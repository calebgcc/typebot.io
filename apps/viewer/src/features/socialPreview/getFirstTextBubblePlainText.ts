import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import { z } from "zod";

const maxPlainTextLength = 180;

const bubbleBlockTypes: string[] = Object.values(BubbleBlockType);

const flowSchema = z.object({
  groups: z.array(
    z.object({
      id: z.string(),
      blocks: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          outgoingEdgeId: z.string().optional(),
          content: z
            .object({
              richText: z.array(z.unknown()).optional(),
              plainText: z.string().optional(),
            })
            .optional(),
        }),
      ),
    }),
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      to: z.object({ groupId: z.string(), blockId: z.string().optional() }),
    }),
  ),
  events: z
    .array(z.object({ outgoingEdgeId: z.string().optional() }))
    .nullish(),
});

export const getFirstTextBubblePlainText = (publishedTypebot: {
  version: string | null;
  groups: unknown;
  edges: unknown;
  events: unknown;
}) => {
  const parsedFlow = flowSchema.safeParse(publishedTypebot);
  if (!parsedFlow.success) return;
  const { groups, edges, events } = parsedFlow.data;

  const startEdgeId = isTypebotVersionAtLeastV6(publishedTypebot.version)
    ? events?.at(0)?.outgoingEdgeId
    : groups.at(0)?.blocks.at(0)?.outgoingEdgeId;
  const startEdge = edges.find((edge) => edge.id === startEdgeId);
  if (!startEdge) return;

  const startGroup = groups.find((group) => group.id === startEdge.to.groupId);
  if (!startGroup) return;
  const startBlockIndex = startEdge.to.blockId
    ? startGroup.blocks.findIndex((block) => block.id === startEdge.to.blockId)
    : 0;
  if (startBlockIndex === -1) return;

  for (const block of startGroup.blocks.slice(startBlockIndex)) {
    if (!bubbleBlockTypes.includes(block.type)) return;
    if (block.type !== BubbleBlockType.TEXT) continue;
    const plainText = sanitizePlainText(
      block.content?.richText
        ? block.content.richText.map(extractTextFromRichTextNode).join(" ")
        : (block.content?.plainText ?? ""),
    );
    if (plainText) return truncate(plainText, maxPlainTextLength);
  }
};

const extractTextFromRichTextNode = (node: unknown): string => {
  if (typeof node !== "object" || node === null) return "";
  if ("text" in node && typeof node.text === "string") return node.text;
  if ("children" in node && Array.isArray(node.children))
    return node.children.map(extractTextFromRichTextNode).join("");
  return "";
};

const sanitizePlainText = (text: string) =>
  text
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();

const truncate = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
