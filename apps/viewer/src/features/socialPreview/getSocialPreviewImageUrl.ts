import { isNotEmpty } from "@typebot.io/lib/utils";
import { defaultSettings } from "@typebot.io/settings/constants";

export const getSocialPreviewImageUrl = ({
  customImageUrl,
  publicId,
  viewerBaseUrl,
}: {
  customImageUrl: string | undefined;
  publicId: string | null | undefined;
  viewerBaseUrl: string;
}) => {
  if (isNotEmpty(customImageUrl)) return customImageUrl;
  if (isNotEmpty(publicId))
    return `${viewerBaseUrl}/api/og/${encodeURIComponent(publicId)}`;
  return defaultSettings.metadata.imageUrl(viewerBaseUrl);
};
