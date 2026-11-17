import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canWriteTypebots } from "@/helpers/databaseRules";

export const updateBlockCommentThreadInputSchema = z.object({
  typebotId: z.string(),
  threadId: z.string(),
  isResolved: z.boolean(),
});

export const handleUpdateBlockCommentThread = async ({
  input: { typebotId, threadId, isResolved },
  context: { user },
}: {
  input: z.infer<typeof updateBlockCommentThreadInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const { count } = await prisma.blockCommentThread.updateMany({
    where: { id: threadId, typebot: canWriteTypebots(typebotId, user) },
    data: { resolvedAt: isResolved ? new Date() : null },
  });
  if (count === 0)
    throw new ORPCError("NOT_FOUND", { message: "Thread not found" });

  return { message: "success" };
};
