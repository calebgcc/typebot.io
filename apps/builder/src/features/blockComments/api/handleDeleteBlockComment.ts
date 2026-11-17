import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canWriteTypebots } from "@/helpers/databaseRules";

export const deleteBlockCommentInputSchema = z.object({
  typebotId: z.string(),
  commentId: z.string(),
});

export const handleDeleteBlockComment = async ({
  input: { typebotId, commentId },
  context: { user },
}: {
  input: z.infer<typeof deleteBlockCommentInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const existingComment = await prisma.blockComment.findFirst({
    where: {
      id: commentId,
      authorId: user.id,
      thread: { typebot: canWriteTypebots(typebotId, user) },
    },
    select: { threadId: true },
  });
  if (!existingComment)
    throw new ORPCError("NOT_FOUND", { message: "Comment not found" });

  await prisma.blockComment.delete({ where: { id: commentId } });
  await prisma.blockCommentThread.deleteMany({
    where: { id: existingComment.threadId, comments: { none: {} } },
  });

  return { message: "success" };
};
