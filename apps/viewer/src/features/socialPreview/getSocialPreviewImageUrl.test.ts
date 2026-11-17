import { describe, expect, it } from "bun:test";
import { getSocialPreviewImageUrl } from "./getSocialPreviewImageUrl";

const viewerBaseUrl = "https://viewer.typebot.io";

describe("getSocialPreviewImageUrl", () => {
  it("should keep the creator's custom image", () => {
    expect(
      getSocialPreviewImageUrl({
        customImageUrl: "https://example.com/custom.png",
        publicId: "my-bot",
        viewerBaseUrl,
      }),
    ).toBe("https://example.com/custom.png");
  });

  it("should use the generated image when no custom image is set", () => {
    expect(
      getSocialPreviewImageUrl({
        customImageUrl: undefined,
        publicId: "my-bot",
        viewerBaseUrl,
      }),
    ).toBe("https://viewer.typebot.io/api/og/my-bot");
    expect(
      getSocialPreviewImageUrl({
        customImageUrl: "",
        publicId: "my bot",
        viewerBaseUrl,
      }),
    ).toBe("https://viewer.typebot.io/api/og/my%20bot");
  });

  it("should fall back to the default image without a public ID", () => {
    expect(
      getSocialPreviewImageUrl({
        customImageUrl: undefined,
        publicId: null,
        viewerBaseUrl,
      }),
    ).toBe("https://viewer.typebot.io/site-preview.jpeg");
  });
});
