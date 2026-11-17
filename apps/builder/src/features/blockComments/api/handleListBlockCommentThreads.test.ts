import { beforeEach, describe, expect, it, mock } from "bun:test";

const typebotFindFirst = mock();
const blockCommentThreadFindMany = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: {
    typebot: { findFirst: typebotFindFirst },
    blockCommentThread: { findMany: blockCommentThreadFindMany },
  },
}));

const { handleListBlockCommentThreads } = await import(
  "./handleListBlockCommentThreads"
);

const user = { id: "user-id", email: "user@example.com" };

describe("handleListBlockCommentThreads", () => {
  beforeEach(() => {
    typebotFindFirst.mockReset();
    blockCommentThreadFindMany.mockReset();
  });

  it("does not expose comment threads to a user without read access", async () => {
    typebotFindFirst.mockResolvedValue(null);

    await expect(
      handleListBlockCommentThreads({
        input: { typebotId: "typebot-id" },
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
          { collaborators: { some: { userId: user.id } } },
        ],
      },
      select: { id: true },
    });
    expect(blockCommentThreadFindMany).not.toHaveBeenCalled();
  });

  it("returns the typebot comment threads to a user with read access", async () => {
    const threads = [
      { id: "thread-id", blockId: "block-id", resolvedAt: null, comments: [] },
    ];
    typebotFindFirst.mockResolvedValue({ id: "typebot-id" });
    blockCommentThreadFindMany.mockResolvedValue(threads);

    await expect(
      handleListBlockCommentThreads({
        input: { typebotId: "typebot-id" },
        context: { user },
      }),
    ).resolves.toEqual({ threads });
    expect(blockCommentThreadFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { typebotId: "typebot-id" } }),
    );
  });
});
