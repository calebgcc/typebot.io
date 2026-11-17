import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canReadTypebots } from "@/helpers/databaseRules";

export const listBlockCommentThreadsInputSchema = z.object({
  typebotId: z.string(),
});

export const handleListBlockCommentThreads = async ({
  input: { typebotId },
  context: { user },
}: {
  input: z.infer<typeof listBlockCommentThreadsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const existingTypebot = await prisma.typebot.findFirst({
    where: canReadTypebots(typebotId, user),
    select: { id: true },
  });
  if (!existingTypebot)
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  const threads = await prisma.blockCommentThread.findMany({
    where: { typebotId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      blockId: true,
      resolvedAt: true,
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          author: { select: { name: true, image: true } },
        },
      },
    },
  });

  return { threads };
};
