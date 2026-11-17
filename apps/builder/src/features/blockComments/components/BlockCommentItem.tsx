import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Avatar } from "@typebot.io/ui/components/Avatar";
import { Button } from "@typebot.io/ui/components/Button";
import { Edit03Icon } from "@typebot.io/ui/icons/Edit03Icon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { useState } from "react";
import { TimeSince } from "@/components/TimeSince";
import { orpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { invalidateBlockCommentThreads } from "../helpers/invalidateBlockCommentThreads";
import { BlockCommentForm } from "./BlockCommentForm";

export const BlockCommentItem = ({
  typebotId,
  comment,
  isAuthor,
}: {
  typebotId: string;
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    author: { name: string | null; image: string | null };
  };
  isAuthor: boolean;
}) => {
  const { t } = useTranslate();
  const [isEditing, setIsEditing] = useState(false);

  const { mutate: updateComment, isPending: isUpdatingComment } = useMutation(
    orpc.blockComments.updateComment.mutationOptions({
      onSuccess: () => {
        setIsEditing(false);
        invalidateBlockCommentThreads();
      },
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const { mutate: deleteComment, isPending: isDeletingComment } = useMutation(
    orpc.blockComments.deleteComment.mutationOptions({
      onSuccess: () => invalidateBlockCommentThreads(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const handleEditSubmit = (content: string) =>
    updateComment({ typebotId, commentId: comment.id, content });

  const handleDeleteClick = () =>
    deleteComment({ typebotId, commentId: comment.id });

  return (
    <div className="flex gap-2">
      <Avatar.Root className="size-6">
        <Avatar.Image src={comment.author.image ?? undefined} alt="User" />
        <Avatar.Fallback>{comment.author.name?.charAt(0)}</Avatar.Fallback>
      </Avatar.Root>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {comment.author.name}
          </span>
          <span className="text-xs text-gray-11 shrink-0">
            <TimeSince date={comment.createdAt} />
          </span>
          {isAuthor && !isEditing && (
            <div className="flex ml-auto">
              <Button
                aria-label={t("edit")}
                size="icon"
                variant="ghost"
                className="size-6"
                onClick={() => setIsEditing(true)}
              >
                <Edit03Icon />
              </Button>
              <Button
                aria-label={t("delete")}
                size="icon"
                variant="ghost"
                className="size-6"
                disabled={isDeletingComment}
                onClick={handleDeleteClick}
              >
                <TrashIcon />
              </Button>
            </div>
          )}
        </div>
        {isEditing ? (
          <BlockCommentForm
            initialContent={comment.content}
            submitLabel={t("save")}
            isSubmitting={isUpdatingComment}
            isAutoFocused
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
};
