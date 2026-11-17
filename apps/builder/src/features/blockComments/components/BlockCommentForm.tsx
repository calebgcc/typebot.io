import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Textarea } from "@typebot.io/ui/components/Textarea";
import { type FormEvent, type KeyboardEvent, useState } from "react";

export const BlockCommentForm = ({
  initialContent = "",
  placeholder,
  submitLabel,
  isSubmitting,
  isAutoFocused = false,
  onSubmit,
  onCancel,
}: {
  initialContent?: string;
  placeholder?: string;
  submitLabel: string;
  isSubmitting: boolean;
  isAutoFocused?: boolean;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
}) => {
  const { t } = useTranslate();
  const [content, setContent] = useState(initialContent);

  const submitContent = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;
    onSubmit(trimmedContent);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitContent();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey))
      submitContent();
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <Textarea
        value={content}
        placeholder={placeholder}
        autoFocus={isAutoFocused}
        onValueChange={setContent}
        onKeyDown={handleKeyDown}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            size="xs"
            variant="secondary"
            onClick={onCancel}
          >
            {t("cancel")}
          </Button>
        )}
        <Button
          type="submit"
          size="xs"
          disabled={!content.trim() || isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
