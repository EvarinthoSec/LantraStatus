import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LantraStatus — Discord presence in your GitHub README";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(88,101,242,0.18) 0%, transparent 70%)",
            top: -200,
            left: -100,
          }}
        />

        {/* Mock card preview */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#1a1a1a",
            borderRadius: 16,
            overflow: "hidden",
            width: 480,
            marginBottom: 48,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Banner */}
          <div
            style={{
              width: "100%",
              height: 90,
              background: "linear-gradient(135deg, #5865F2 0%, #3b47c7 100%)",
              display: "flex",
            }}
          />
          {/* Avatar */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              padding: "0 20px",
              marginTop: -28,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#5865F2",
                border: "3px solid #1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "white",
              }}
            >
              D
            </div>
          </div>
          {/* Info */}
          <div style={{ padding: "6px 20px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ color: "white", fontSize: 18, fontWeight: 700 }}>DiscordUser</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>Online · desktop</div>
          </div>
          {/* Activity row */}
          <div
            style={{
              margin: "0 14px 14px",
              padding: "10px 12px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Visual Studio Code</div>
            <div
              style={{
                background: "rgba(88,101,242,0.25)",
                color: "#5865F2",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 6,
                letterSpacing: 1,
              }}
            >
              CODING
            </div>
          </div>
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ color: "white", fontSize: 48, fontWeight: 800, letterSpacing: -1 }}>
            LantraStatus
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 20 }}>
            Discord presence in your GitHub README
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
