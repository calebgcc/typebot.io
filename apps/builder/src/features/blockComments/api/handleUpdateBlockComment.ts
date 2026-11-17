import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canWriteTypebots } from "@/helpers/databaseRules";
import { blockCommentContentSchema } from "./blockCommentContentSchema";

export const updateBlockCommentInputSchema = z.object({
  typebotId: z.string(),
  commentId: z.string(),
  content: blockCommentContentSchema,
});

export const handleUpdateBlockComment = async ({
  input: { typebotId, commentId, content },
  context: { user },
}: {
  input: z.infer<typeof updateBlockCommentInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const { count } = await prisma.blockComment.updateMany({
    where: {
      id: commentId,
      authorId: user.id,
      thread: { typebot: canWriteTypebots(typebotId, user) },
    },
    data: { content },
  });
  if (count === 0)
    throw new ORPCError("NOT_FOUND", { message: "Comment not found" });

  return { message: "success" };
};
