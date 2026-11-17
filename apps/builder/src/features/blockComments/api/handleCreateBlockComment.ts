import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canWriteTypebots } from "@/helpers/databaseRules";
import { blockCommentContentSchema } from "./blockCommentContentSchema";

export const createBlockCommentInputSchema = z.object({
  typebotId: z.string(),
  threadId: z.string(),
  content: blockCommentContentSchema,
});

export const handleCreateBlockComment = async ({
  input: { typebotId, threadId, content },
  context: { user },
}: {
  input: z.infer<typeof createBlockCommentInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const existingThread = await prisma.blockCommentThread.findFirst({
    where: { id: threadId, typebot: canWriteTypebots(typebotId, user) },
    select: { id: true },
  });
  if (!existingThread)
    throw new ORPCError("NOT_FOUND", { message: "Thread not found" });

  await prisma.blockComment.create({
    data: { threadId, authorId: user.id, content },
  });

  return { message: "success" };
};
