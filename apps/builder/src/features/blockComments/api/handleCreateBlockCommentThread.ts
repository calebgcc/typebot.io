import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canWriteTypebots } from "@/helpers/databaseRules";
import { blockCommentContentSchema } from "./blockCommentContentSchema";

export const createBlockCommentThreadInputSchema = z.object({
  typebotId: z.string(),
  blockId: z.string(),
  content: blockCommentContentSchema,
});

export const handleCreateBlockCommentThread = async ({
  input: { typebotId, blockId, content },
  context: { user },
}: {
  input: z.infer<typeof createBlockCommentThreadInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const existingTypebot = await prisma.typebot.findFirst({
    where: canWriteTypebots(typebotId, user),
    select: { id: true },
  });
  if (!existingTypebot)
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  await prisma.blockCommentThread.create({
    data: {
      typebotId,
      blockId,
      comments: { create: { authorId: user.id, content } },
    },
  });

  return { message: "success" };
};
