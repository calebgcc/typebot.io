import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Popover } from "@typebot.io/ui/components/Popover";
import { ChatIcon } from "@typebot.io/ui/icons/ChatIcon";
import type { SyntheticEvent } from "react";
import { orpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { invalidateBlockCommentThreads } from "../helpers/invalidateBlockCommentThreads";
import { BlockCommentForm } from "./BlockCommentForm";
import { BlockCommentThread } from "./BlockCommentThread";

export const BlockCommentsPopover = ({
  typebotId,
  blockId,
  isOpen,
  isReadOnly,
  onOpen,
  onClose,
}: {
  typebotId: string;
  blockId: string;
  isOpen: boolean;
  isReadOnly: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslate();

  const { data } = useQuery(
    orpc.blockComments.listThreads.queryOptions({
      input: { typebotId },
    }),
  );

  const { mutate: createThread, isPending: isCreatingThread } = useMutation(
    orpc.blockComments.createThread.mutationOptions({
      onSuccess: () => invalidateBlockCommentThreads(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const handleNewThreadSubmit = (content: string) =>
    createThread({ typebotId, blockId, content });

  const blockThreads =
    data?.threads.filter((thread) => thread.blockId === blockId) ?? [];
  const openThreadsCount = blockThreads.filter(
    (thread) => thread.resolvedAt === null,
  ).length;

  if (openThreadsCount === 0 && !isOpen) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: This wrapper only stops events from reaching the parent block node trigger.
    <div
      className="absolute -top-3 -right-3"
      onClick={stopPropagation}
      onKeyDown={stopPropagation}
      onPointerDown={stopPropagation}
      onMouseDown={stopPropagation}
      onContextMenu={stopPropagation}
    >
      <Popover.Root isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <Popover.TriggerButton
          aria-label={t("editor.blockComments.triggerButton.ariaLabel")}
          size="xs"
          variant="secondary"
          data-testid={`block-comments-button ${blockId}`}
        >
          <ChatIcon />
          {openThreadsCount > 0 && openThreadsCount}
        </Popover.TriggerButton>
        <Popover.Popup side="right" align="start" className="w-80 p-3 gap-3">
          {blockThreads.map((thread) => (
            <BlockCommentThread
              key={thread.id}
              typebotId={typebotId}
              thread={thread}
              isReadOnly={isReadOnly}
            />
          ))}
          {!isReadOnly && openThreadsCount === 0 && (
            <BlockCommentForm
              placeholder={t("editor.blockComments.newThreadInput.placeholder")}
              submitLabel={t("editor.blockComments.sendButton.label")}
              isSubmitting={isCreatingThread}
              isAutoFocused
              onSubmit={handleNewThreadSubmit}
            />
          )}
        </Popover.Popup>
      </Popover.Root>
    </div>
  );
};

const stopPropagation = (event: SyntheticEvent) => event.stopPropagation();
