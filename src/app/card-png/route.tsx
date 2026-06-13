import { ImageResponse } from "next/og";
import { getUserPresence } from "@/lib/discord";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const W = 600, H = 240;

const STATUS_COLOR: Record<string, string> = {
  online: "#23a55a", idle: "#f0b132", dnd: "#f23f43", offline: "#80848e",
};
const STATUS_LABEL: Record<string, string> = {
  online: "Online", idle: "Idle", dnd: "Do Not Disturb", offline: "Offline",
};
const ACT_LABEL: Record<number, string> = {
  0: "PLAYING", 1: "STREAMING", 2: "LISTENING TO", 3: "WATCHING", 5: "COMPETING IN",
};

function proxyUrl(url: string, base: string): string {
  return `${base}/proxy?url=${encodeURIComponent(url)}`;
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const id = searchParams.get("id") ?? "";

  if (!id || !/^\d{17,19}$/.test(id)) {
    return new Response("Invalid ID", { status: 400 });
  }

  let user;
  try {
    user = await getUserPresence(id);
  } catch {
    return new Response("User not found", { status: 500 });
  }

  const du = user.discord_user;
  const name = du.global_name || du.username;
  const statusColor = STATUS_COLOR[user.status] ?? "#80848e";
  const pColor = du.banner_color ?? "#5865F2";

  const avatarUrl = proxyUrl(
    du.avatar
      ? `https://cdn.discordapp.com/avatars/${du.id}/${du.avatar}.webp?size=128`
      : `https://cdn.discordapp.com/embed/avatars/0.png`,
    origin
  );

  const bannerUrl = du.banner
    ? proxyUrl(
        `https://cdn.discordapp.com/banners/${du.id}/${du.banner}.${du.banner.startsWith("a_") ? "gif" : "webp"}?size=480`,
        origin
      )
    : null;

  const primaryAct = user.activities.find(a => a.type !== 4 && a.name !== "Spotify") ?? null;
  const spotify = user.activities.find(a => a.name === "Spotify") ?? null;
  const customStatus = user.activities.find(a => a.type === 4) ?? null;

  const actLabel = primaryAct ? (ACT_LABEL[primaryAct.type] ?? "PLAYING") : null;
  const actName = primaryAct?.name ?? spotify?.details ?? null;
  const actDetail = primaryAct?.details ?? spotify?.state ?? null;
  const customText = customStatus?.state ?? null;

  const BANNER_H = 80;
  const AV = 64;
  const AV_TOP = BANNER_H - AV / 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: W, height: H,
          display: "flex", flexDirection: "column",
          background: "#ffffff",
          borderRadius: 12,
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Banner */}
        <div style={{ position: "relative", width: W, height: BANNER_H, flexShrink: 0, display: "flex" }}>
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl} width={W} height={BANNER_H} style={{ objectFit: "cover", width: W, height: BANNER_H }} alt="" />
          ) : (
            <div style={{ width: W, height: BANNER_H, background: `linear-gradient(135deg, ${pColor}, ${pColor}88)`, display: "flex" }} />
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 20px 16px", position: "relative" }}>
          {/* Avatar */}
          <div style={{ position: "absolute", top: AV_TOP - BANNER_H, left: 20, display: "flex" }}>
            <div style={{ position: "relative", width: AV, height: AV, display: "flex" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} width={AV} height={AV} style={{ borderRadius: "50%", border: "3px solid #fff", width: AV, height: AV }} alt="" />
              <div style={{
                position: "absolute", bottom: 2, right: 2,
                width: 14, height: 14, borderRadius: "50%",
                background: statusColor, border: "2.5px solid #fff",
                display: "flex",
              }} />
            </div>
          </div>

          {/* Name row */}
          <div style={{ marginTop: AV / 2 + 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#0d0d0d", lineHeight: 1.2 }}>{name}</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {STATUS_LABEL[user.status] ?? "Offline"}
            </span>
          </div>

          {customText && (
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, display: "flex" }}>{customText}</div>
          )}

          {/* Activity */}
          {actName && (
            <div style={{
              marginTop: 8, display: "flex", alignItems: "center", gap: 10,
              background: `${pColor}14`, borderRadius: 8, padding: "8px 12px",
            }}>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {actLabel && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: pColor, letterSpacing: 1, marginBottom: 2, display: "flex" }}>
                    {actLabel}
                  </span>
                )}
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0d0d0d", display: "flex" }}>{actName}</span>
                {actDetail && <span style={{ fontSize: 12, color: "#6b7280", display: "flex" }}>{actDetail}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
    }
  );
}
