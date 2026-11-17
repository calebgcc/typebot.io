import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import {
  createBlockCommentInputSchema,
  handleCreateBlockComment,
} from "./handleCreateBlockComment";
import {
  createBlockCommentThreadInputSchema,
  handleCreateBlockCommentThread,
} from "./handleCreateBlockCommentThread";
import {
  deleteBlockCommentInputSchema,
  handleDeleteBlockComment,
} from "./handleDeleteBlockComment";
import {
  handleListBlockCommentThreads,
  listBlockCommentThreadsInputSchema,
} from "./handleListBlockCommentThreads";
import {
  handleUpdateBlockComment,
  updateBlockCommentInputSchema,
} from "./handleUpdateBlockComment";
import {
  handleUpdateBlockCommentThread,
  updateBlockCommentThreadInputSchema,
} from "./handleUpdateBlockCommentThread";

export const blockCommentsRouter = {
  listThreads: authenticatedProcedure
    .input(listBlockCommentThreadsInputSchema)
    .handler(handleListBlockCommentThreads),

  createThread: authenticatedProcedure
    .input(createBlockCommentThreadInputSchema)
    .handler(handleCreateBlockCommentThread),

  updateThread: authenticatedProcedure
    .input(updateBlockCommentThreadInputSchema)
    .handler(handleUpdateBlockCommentThread),

  createComment: authenticatedProcedure
    .input(createBlockCommentInputSchema)
    .handler(handleCreateBlockComment),

  updateComment: authenticatedProcedure
    .input(updateBlockCommentInputSchema)
    .handler(handleUpdateBlockComment),

  deleteComment: authenticatedProcedure
    .input(deleteBlockCommentInputSchema)
    .handler(handleDeleteBlockComment),
};
