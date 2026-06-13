import { IDiscordData } from "@/types";

// ─── Static maps ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  online: "#23a55a", idle: "#f0b132", dnd: "#f23f43", offline: "#80848e",
};
const STATUS_LABELS: Record<string, string> = {
  online: "Online", idle: "Idle", dnd: "Do Not Disturb", offline: "Offline",
};
const ACTIVITY_TYPE_LABELS: Record<number, string> = {
  0: "PLAYING", 1: "STREAMING", 2: "LISTENING TO", 3: "WATCHING", 5: "COMPETING IN",
};
// Approximate pixel widths for badge pill at font-size 9, letter-spacing 0.8
const BADGE_W: Record<string, number> = {
  PLAYING: 56, STREAMING: 66, "LISTENING TO": 88, WATCHING: 64, "COMPETING IN": 80,
};

// ─── Color utilities ──────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lighten(hex: string, t: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return (
    "#" +
    rgb
      .map((c) => Math.round(c + (255 - c) * t).toString(16).padStart(2, "0"))
      .join("")
  );
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
}

// White or near-black depending on background brightness
function contrastText(hex: string): string {
  return luminance(hex) > 0.55 ? "#1a1a1a" : "#ffffff";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clip(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function getArtworkUrl(applicationId: string | undefined, largeImage: string): string {
  if (!largeImage) return "";
  if (largeImage.startsWith("mp:external/"))
    return largeImage.replace("mp:external/", "https://media.discordapp.net/external/");
  if (largeImage.startsWith("spotify:"))
    return `https://i.scdn.co/image/${largeImage.replace("spotify:", "")}`;
  if (applicationId)
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${largeImage}.png?size=80`;
  return "";
}

function formatElapsed(startMs: number): string {
  const diff = Math.max(0, Date.now() - startMs);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m elapsed`;
  if (m > 0) return `${m}m elapsed`;
  return "Just started";
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function RenderCard({ user }: { user: IDiscordData }) {
  const { discord_user, status, activities } = user;

  // Status
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
  const statusLabel = STATUS_LABELS[status] ?? "Offline";

  // Theme colors — p_color from Discord accent, sub_color from lighten
  const pColor = discord_user.banner_color ?? statusColor;
  const subColor = lighten(pColor, 0.88);
  const badgeFg = contrastText(pColor);

  // User
  const displayName = escapeXml(clip(discord_user.global_name || discord_user.username, 22));
  const username = escapeXml(discord_user.username);
  const avatarUrl = escapeXml(
    discord_user.avatar
      ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discord_user.discriminator || "0", 10) % 5}.png`
  );
  const bannerUrl = discord_user.banner
    ? escapeXml(
        `https://cdn.discordapp.com/banners/${discord_user.id}/${discord_user.banner}.${
          discord_user.banner.startsWith("a_") ? "gif" : "webp"
        }?size=480`
      )
    : null;

  // Activity
  const activity = activities.find((a) => a.type !== 4) ?? activities[0] ?? null;
  const artworkUrl = activity?.assets?.large_image
    ? escapeXml(getArtworkUrl(activity.application_id, activity.assets.large_image))
    : "";
  const typeLabel = activity ? (ACTIVITY_TYPE_LABELS[activity.type] ?? "PLAYING") : "";
  const actName = activity ? escapeXml(clip(activity.name, 30)) : "";
  const actDetails = activity?.details ? escapeXml(clip(activity.details, 36)) : "";
  const actState = activity?.state ? escapeXml(clip(activity.state, 36)) : "";
  const elapsed = activity?.timestamps?.start ? formatElapsed(activity.timestamps.start) : "";

  // ─── Layout ────────────────────────────────────────────────────────────────

  const W = 440;
  const BANNER_H = 80;

  // Avatar straddles banner/content boundary
  const AV_CX = 52;
  const AV_CY = BANNER_H;
  const AV_R = 34;

  // Name block (to the right of avatar)
  const NAME_X = 102;
  const NAME_Y = 97;
  const USER_Y = 115;
  const DIVIDER_Y = 131;

  // Activity section
  const ART_SIZE = 52;
  const ART_Y = DIVIDER_Y + 16;
  const hasArt = !!artworkUrl;
  const TEXT_X = hasArt ? 16 + ART_SIZE + 10 : 16;

  const ROW_NAME_Y = ART_Y + 14;
  const ROW_DETAIL_Y = ROW_NAME_Y + 15;
  const ROW_STATE_Y = ROW_DETAIL_Y + 14;
  const ART_BOTTOM = ART_Y + ART_SIZE;

  // Text section bottom (last visible row)
  const textBottom = actState
    ? ROW_STATE_Y
    : actDetails
    ? ROW_DETAIL_Y
    : activity
    ? ROW_NAME_Y
    : DIVIDER_Y + 40;

  const contentBottom = activity ? Math.max(ART_BOTTOM, textBottom) : DIVIDER_Y + 40;
  const ELAPSED_Y = contentBottom + 18;
  const H = elapsed && activity
    ? ELAPSED_Y + 12
    : activity
    ? contentBottom + 14
    : DIVIDER_Y + 50;

  // Badge pill dimensions (right side, aligned with first text row)
  const bw = BADGE_W[typeLabel] ?? 64;
  const BADGE_X = W - 16 - bw;
  const BADGE_TOP = ART_Y + 1;
  const BADGE_H_PX = 17;

  // Gradient fallback for no-banner case
  const gradFrom = pColor;
  const gradTo = lighten(pColor, 0.35);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }</style>
    <clipPath id="cardClip"><rect width="${W}" height="${H}" rx="12"/></clipPath>
    <clipPath id="bannerClip"><rect width="${W}" height="${BANNER_H}"/></clipPath>
    <clipPath id="avatarClip"><circle cx="${AV_CX}" cy="${AV_CY}" r="${AV_R}"/></clipPath>
    ${hasArt ? `<clipPath id="artClip"><rect x="16" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" rx="8"/></clipPath>` : ""}
    <linearGradient id="bgGrad" x1="0" y1="0" x2="${W}" y2="${BANNER_H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${gradFrom}"/>
      <stop offset="100%" stop-color="${gradTo}"/>
    </linearGradient>
    <linearGradient id="bannerFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#cardClip)">

    <!-- Base white -->
    <rect width="${W}" height="${H}" fill="#ffffff"/>

    <!-- Activity section subtle tint -->
    ${activity ? `<rect x="0" y="${DIVIDER_Y}" width="${W}" height="${H - DIVIDER_Y}" fill="${subColor}" opacity="0.5"/>` : ""}

    <!-- Banner -->
    ${bannerUrl
      ? `<image x="0" y="0" width="${W}" height="${BANNER_H}" href="${bannerUrl}" clip-path="url(#bannerClip)" preserveAspectRatio="xMidYMid slice"/>
         <rect x="0" y="${BANNER_H - 28}" width="${W}" height="28" fill="url(#bannerFade)" opacity="0.4"/>`
      : `<rect width="${W}" height="${BANNER_H}" fill="url(#bgGrad)"/>`}

    <!-- Avatar white ring -->
    <circle cx="${AV_CX}" cy="${AV_CY}" r="${AV_R + 3.5}" fill="#ffffff"/>
    <!-- Avatar image -->
    <image x="${AV_CX - AV_R}" y="${AV_CY - AV_R}" width="${AV_R * 2}" height="${AV_R * 2}"
      href="${avatarUrl}" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
    <!-- Status dot -->
    <circle cx="${AV_CX + AV_R - 5}" cy="${AV_CY + AV_R - 5}" r="8.5" fill="${statusColor}" stroke="#ffffff" stroke-width="3"/>

    <!-- Display name -->
    <text x="${NAME_X}" y="${NAME_Y}" font-size="17" font-weight="700" fill="#0d0d0d">${displayName}</text>
    <!-- Username · Status -->
    <text x="${NAME_X}" y="${USER_Y}" font-size="11.5" fill="#0d0d0d" opacity="0.45">${username} · ${escapeXml(statusLabel)}</text>

    <!-- Divider -->
    <line x1="0" y1="${DIVIDER_Y}" x2="${W}" y2="${DIVIDER_Y}" stroke="${pColor}" stroke-width="1" opacity="0.18"/>

    ${activity ? `

    <!-- Activity artwork -->
    ${hasArt ? `<image x="16" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" href="${artworkUrl}" clip-path="url(#artClip)" preserveAspectRatio="xMidYMid slice"/>` : ""}

    <!-- Activity type badge pill (right side) -->
    ${typeLabel ? `
    <rect x="${BADGE_X}" y="${BADGE_TOP}" width="${bw}" height="${BADGE_H_PX}" rx="4" fill="${pColor}"/>
    <text x="${BADGE_X + bw / 2}" y="${BADGE_TOP + 12}" text-anchor="middle"
      font-size="9" font-weight="700" fill="${badgeFg}" letter-spacing="0.8">${typeLabel}</text>
    ` : ""}

    <!-- Activity name -->
    <text x="${TEXT_X}" y="${ROW_NAME_Y}" font-size="13.5" font-weight="600" fill="#0d0d0d">${actName}</text>
    <!-- Details -->
    ${actDetails ? `<text x="${TEXT_X}" y="${ROW_DETAIL_Y}" font-size="12" fill="#0d0d0d" opacity="0.55">${actDetails}</text>` : ""}
    <!-- State -->
    ${actState ? `<text x="${TEXT_X}" y="${ROW_STATE_Y}" font-size="12" fill="#0d0d0d" opacity="0.45">${actState}</text>` : ""}
    <!-- Elapsed (themed with p_color) -->
    ${elapsed ? `<text x="${TEXT_X}" y="${ELAPSED_Y}" font-size="11" fill="${pColor}" opacity="0.7">${elapsed}</text>` : ""}

    ` : `
    <text x="${Math.round(W / 2)}" y="${Math.round(DIVIDER_Y + (H - DIVIDER_Y) / 2 + 5)}"
      text-anchor="middle" font-size="12" fill="#0d0d0d" opacity="0.30">No current activity</text>
    `}

  </g>
</svg>`;
}
