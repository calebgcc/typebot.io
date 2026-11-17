import { beforeEach, describe, expect, it, mock } from "bun:test";

const typebotFindFirst = mock();
const blockCommentThreadCreate = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: {
    typebot: { findFirst: typebotFindFirst },
    blockCommentThread: { create: blockCommentThreadCreate },
  },
}));

const { handleCreateBlockCommentThread } = await import(
  "./handleCreateBlockCommentThread"
);

const user = { id: "user-id", email: "user@example.com" };

describe("handleCreateBlockCommentThread", () => {
  beforeEach(() => {
    typebotFindFirst.mockReset();
    blockCommentThreadCreate.mockReset();
  });

  it("does not let a read-only collaborator start a thread", async () => {
    typebotFindFirst.mockResolvedValue(null);

    await expect(
      handleCreateBlockCommentThread({
        input: { typebotId: "typebot-id", blockId: "block-id", content: "Hi" },
        context: { user },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(typebotFindFirst).toHaveBeenCalledWith({
      where: {
        id: "typebot-id",
        OR: [
          {
            workspace: {
              members: {
                some: { userId: user.id, role: { not: "GUEST" } },
              },
            },
          },
          {
            collaborators: {
              some: { userId: user.id, type: { not: "READ" } },
            },
          },
        ],
      },
      select: { id: true },
    });
    expect(blockCommentThreadCreate).not.toHaveBeenCalled();
  });

  it("creates the thread with the current user as first comment author", async () => {
    typebotFindFirst.mockResolvedValue({ id: "typebot-id" });

    await handleCreateBlockCommentThread({
      input: { typebotId: "typebot-id", blockId: "block-id", content: "Hi" },
      context: { user },
    });

    expect(blockCommentThreadCreate).toHaveBeenCalledWith({
      data: {
        typebotId: "typebot-id",
        blockId: "block-id",
        comments: { create: { authorId: user.id, content: "Hi" } },
      },
    });
  });
});
