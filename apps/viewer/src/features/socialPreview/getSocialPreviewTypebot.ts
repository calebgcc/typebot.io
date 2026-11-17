import prisma from "@typebot.io/prisma";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import { settingsSchema } from "@typebot.io/settings/schemas";
import {
  BackgroundType,
  defaultBackgroundColor,
  defaultButtonsBackgroundColor,
  defaultButtonsColor,
  defaultHostBubblesBackgroundColor,
  defaultHostBubblesColor,
} from "@typebot.io/theme/constants";
import { themeSchema } from "@typebot.io/theme/schemas";
import { getFirstTextBubblePlainText } from "./getFirstTextBubblePlainText";

export const getSocialPreviewTypebot = async (publicId: string) => {
  const publishedTypebot = await prisma.publicTypebot.findFirst({
    where: { typebot: { publicId } },
    select: {
      version: true,
      theme: true,
      settings: true,
      groups: true,
      edges: true,
      events: true,
      typebot: {
        select: {
          name: true,
          isArchived: true,
          workspace: { select: { isSuspended: true } },
        },
      },
    },
  });
  if (
    !publishedTypebot?.version ||
    publishedTypebot.typebot.isArchived ||
    publishedTypebot.typebot.workspace.isSuspended
  )
    return;

  const theme = themeSchema.safeParse(publishedTypebot.theme).data;
  const settings = settingsSchema.safeParse(publishedTypebot.settings).data;
  const defaultsVersion = isTypebotVersionAtLeastV6(publishedTypebot.version)
    ? publishedTypebot.version
    : "6";
  const background = theme?.general?.background;

  return {
    title: truncateTitle(
      settings?.metadata?.title || publishedTypebot.typebot.name,
    ),
    firstMessage: getFirstTextBubblePlainText(publishedTypebot),
    colors: {
      background:
        (background?.type === BackgroundType.COLOR &&
          parseSafeColor(background.content)) ||
        defaultBackgroundColor[defaultsVersion],
      hostBubbleBackground:
        parseSafeColor(theme?.chat?.hostBubbles?.backgroundColor) ??
        defaultHostBubblesBackgroundColor[defaultsVersion],
      hostBubbleText:
        parseSafeColor(theme?.chat?.hostBubbles?.color) ??
        defaultHostBubblesColor,
      accentBackground:
        parseSafeColor(theme?.chat?.buttons?.backgroundColor) ??
        defaultButtonsBackgroundColor[defaultsVersion],
      accentText:
        parseSafeColor(theme?.chat?.buttons?.color) ?? defaultButtonsColor,
    },
  };
};

// Only plain color values are forwarded to the image renderer so that
// creator-provided strings can't inject unsupported CSS (gradients, url(), ...).
const parseSafeColor = (color: string | undefined) => {
  if (!color) return;
  const trimmedColor = color.trim();
  if (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmedColor))
    return trimmedColor;
  if (/^(?:rgb|rgba|hsl|hsla)\([\d\s.,%/]+\)$/i.test(trimmedColor))
    return trimmedColor;
};

const maxTitleLength = 70;

const truncateTitle = (title: string) =>
  title.length > maxTitleLength
    ? `${title.slice(0, maxTitleLength - 1).trimEnd()}…`
    : title;
