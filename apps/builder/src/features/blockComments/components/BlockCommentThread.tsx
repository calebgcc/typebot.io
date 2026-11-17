import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { TickIcon } from "@typebot.io/ui/icons/TickIcon";
import { Undo03Icon } from "@typebot.io/ui/icons/Undo03Icon";
import { cn } from "@typebot.io/ui/lib/cn";
import type { ComponentProps } from "react";
import { useUser } from "@/features/user/hooks/useUser";
import { orpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { invalidateBlockCommentThreads } from "../helpers/invalidateBlockCommentThreads";
import { BlockCommentForm } from "./BlockCommentForm";
import { BlockCommentItem } from "./BlockCommentItem";

export const BlockCommentThread = ({
  typebotId,
  thread,
  isReadOnly,
}: {
  typebotId: string;
  thread: {
    id: string;
    resolvedAt: Date | null;
    comments: (ComponentProps<typeof BlockCommentItem>["comment"] & {
      authorId: string;
    })[];
  };
  isReadOnly: boolean;
}) => {
  const { user } = useUser();
  const { t } = useTranslate();

  const { mutate: createComment, isPending: isCreatingComment } = useMutation(
    orpc.blockComments.createComment.mutationOptions({
      onSuccess: () => invalidateBlockCommentThreads(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const { mutate: updateThread, isPending: isUpdatingThread } = useMutation(
    orpc.blockComments.updateThread.mutationOptions({
      onSuccess: () => invalidateBlockCommentThreads(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const handleReplySubmit = (content: string) =>
    createComment({ typebotId, threadId: thread.id, content });

  const handleResolveToggleClick = () =>
    updateThread({
      typebotId,
      threadId: thread.id,
      isResolved: !isResolved,
    });

  const isResolved = thread.resolvedAt !== null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3 rounded-lg border",
        isResolved && "opacity-60",
      )}
    >
      {(isResolved || !isReadOnly) && (
        <div className="flex items-center gap-2">
          {isResolved && (
            <Badge>{t("editor.blockComments.resolvedBadge.label")}</Badge>
          )}
          {!isReadOnly && (
            <Button
              size="xs"
              variant="ghost"
              className="ml-auto"
              disabled={isUpdatingThread}
              onClick={handleResolveToggleClick}
            >
              {isResolved ? <Undo03Icon /> : <TickIcon />}
              {isResolved
                ? t("editor.blockComments.reopenButton.label")
                : t("editor.blockComments.resolveButton.label")}
            </Button>
          )}
        </div>
      )}
      {thread.comments.map((comment) => (
        <BlockCommentItem
          key={comment.id}
          typebotId={typebotId}
          comment={comment}
          isAuthor={!isReadOnly && comment.authorId === user?.id}
        />
      ))}
      {!isReadOnly && !isResolved && (
        <BlockCommentForm
          key={thread.comments.length}
          placeholder={t("editor.blockComments.replyInput.placeholder")}
          submitLabel={t("editor.blockComments.sendButton.label")}
          isSubmitting={isCreatingComment}
          onSubmit={handleReplySubmit}
        />
      )}
    </div>
  );
};
