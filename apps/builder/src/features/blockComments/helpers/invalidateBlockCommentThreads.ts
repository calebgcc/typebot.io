import { orpc, queryClient } from "@/lib/queryClient";

export const invalidateBlockCommentThreads = () =>
  queryClient.invalidateQueries({
    queryKey: orpc.blockComments.listThreads.key(),
  });
