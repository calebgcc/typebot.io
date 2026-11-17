import { beforeEach, describe, expect, it, mock } from "bun:test";

const blockCommentThreadUpdateMany = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: {
    blockCommentThread: { updateMany: blockCommentThreadUpdateMany },
  },
}));

const { handleUpdateBlockCommentThread } = await import(
  "./handleUpdateBlockCommentThread"
);

const user = { id: "user-id", email: "user@example.com" };

describe("handleUpdateBlockCommentThread", () => {
  beforeEach(() => {
    blockCommentThreadUpdateMany.mockReset();
  });

  it("does not let a read-only collaborator resolve a thread", async () => {
    blockCommentThreadUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      handleUpdateBlockCommentThread({
        input: {
          typebotId: "typebot-id",
          threadId: "thread-id",
          isResolved: true,
        },
        context: { user },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(blockCommentThreadUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "thread-id",
        typebot: {
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
      },
      data: { resolvedAt: expect.any(Date) },
    });
  });

  it("reopens a resolved thread", async () => {
    blockCommentThreadUpdateMany.mockResolvedValue({ count: 1 });

    await expect(
      handleUpdateBlockCommentThread({
        input: {
          typebotId: "typebot-id",
          threadId: "thread-id",
          isResolved: false,
        },
        context: { user },
      }),
    ).resolves.toEqual({ message: "success" });
    expect(blockCommentThreadUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { resolvedAt: null } }),
    );
  });
});
