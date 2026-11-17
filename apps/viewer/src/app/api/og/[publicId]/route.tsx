import { ImageResponse } from "next/og";
import { getSocialPreviewTypebot } from "@/features/socialPreview/getSocialPreviewTypebot";
import { SocialPreviewImage } from "@/features/socialPreview/SocialPreviewImage";

type RouteContext = {
  params: Promise<{ publicId: string }>;
};

export const runtime = "nodejs";

export const GET = async (_request: Request, context: RouteContext) => {
  try {
    const { publicId } = await context.params;
    const socialPreviewTypebot = await getSocialPreviewTypebot(publicId);
    if (!socialPreviewTypebot)
      return new Response("Not found", { status: 404 });

    return new ImageResponse(
      <SocialPreviewImage
        title={socialPreviewTypebot.title}
        firstMessage={socialPreviewTypebot.firstMessage}
        colors={socialPreviewTypebot.colors}
      />,
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control":
            "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error(error);
    return new Response("Could not generate image", { status: 500 });
  }
};
