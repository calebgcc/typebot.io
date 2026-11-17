import { beforeEach, describe, expect, it, mock } from "bun:test";

const blockCommentFindFirst = mock();
const blockCommentDelete = mock();
const blockCommentThreadDeleteMany = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: {
    blockComment: {
      findFirst: blockCommentFindFirst,
      delete: blockCommentDelete,
    },
    blockCommentThread: { deleteMany: blockCommentThreadDeleteMany },
  },
}));

const { handleDeleteBlockComment } = await import("./handleDeleteBlockComment");

const user = { id: "user-id", email: "user@example.com" };

describe("handleDeleteBlockComment", () => {
  beforeEach(() => {
    blockCommentFindFirst.mockReset();
    blockCommentDelete.mockReset();
    blockCommentThreadDeleteMany.mockReset();
  });

  it("does not let a user delete someone else's comment", async () => {
    blockCommentFindFirst.mockResolvedValue(null);

    await expect(
      handleDeleteBlockComment({
        input: { typebotId: "typebot-id", commentId: "comment-id" },
        context: { user },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(blockCommentFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "comment-id",
          authorId: user.id,
        }),
      }),
    );
    expect(blockCommentDelete).not.toHaveBeenCalled();
  });

  it("removes the thread once its last comment is deleted", async () => {
    blockCommentFindFirst.mockResolvedValue({ threadId: "thread-id" });

    await handleDeleteBlockComment({
      input: { typebotId: "typebot-id", commentId: "comment-id" },
      context: { user },
    });

    expect(blockCommentDelete).toHaveBeenCalledWith({
      where: { id: "comment-id" },
    });
    expect(blockCommentThreadDeleteMany).toHaveBeenCalledWith({
      where: { id: "thread-id", comments: { none: {} } },
    });
  });
});
