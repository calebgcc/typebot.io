import { beforeEach, describe, expect, it, mock } from "bun:test";

const blockCommentUpdateMany = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: {
    blockComment: { updateMany: blockCommentUpdateMany },
  },
}));

const { handleUpdateBlockComment } = await import("./handleUpdateBlockComment");

const user = { id: "user-id", email: "user@example.com" };

describe("handleUpdateBlockComment", () => {
  beforeEach(() => {
    blockCommentUpdateMany.mockReset();
  });

  it("only lets the author with write access edit a comment", async () => {
    blockCommentUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      handleUpdateBlockComment({
        input: {
          typebotId: "typebot-id",
          commentId: "someone-else-comment-id",
          content: "Edited",
        },
        context: { user },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(blockCommentUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "someone-else-comment-id",
        authorId: user.id,
        thread: {
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
      },
      data: { content: "Edited" },
    });
  });
});
