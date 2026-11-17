type SocialPreviewImageProps = {
  title: string;
  firstMessage: string | undefined;
  colors: {
    background: string;
    hostBubbleBackground: string;
    hostBubbleText: string;
    accentBackground: string;
    accentText: string;
  };
};

// Rendered by `next/og` (Satori): only inline styles and flexbox layouts are supported.
export const SocialPreviewImage = ({
  title,
  firstMessage,
  colors,
}: SocialPreviewImageProps) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px 80px",
      backgroundColor: colors.background,
    }}
  >
    <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: colors.accentBackground,
          color: colors.accentText,
          fontSize: 44,
          fontWeight: 700,
        }}
      >
        {getInitial(title)}
      </div>
      {firstMessage ? (
        <div
          style={{
            display: "flex",
            maxWidth: 880,
            padding: "28px 36px",
            borderRadius: 28,
            backgroundColor: colors.hostBubbleBackground,
            color: colors.hostBubbleText,
            fontSize: 40,
            lineHeight: 1.35,
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          }}
        >
          {firstMessage}
        </div>
      ) : null}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 40,
        padding: "32px 40px",
        borderRadius: 32,
        // Title uses the host bubble colors so it stays readable on any page background
        backgroundColor: colors.hostBubbleBackground,
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: 840,
          color: colors.hostBubbleText,
          fontSize: 56,
          fontWeight: 700,
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          padding: "16px 32px",
          borderRadius: 999,
          backgroundColor: colors.accentBackground,
          color: colors.accentText,
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        Start chatting
      </div>
    </div>
  </div>
);

const getInitial = (title: string) =>
  Array.from(title.trim()).at(0)?.toUpperCase() ?? "?";
