import { IDiscordData } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  online: "#23a55a",
  idle: "#f0b132",
  dnd: "#f23f43",
  offline: "#80848e",
};
const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};
const ACTIVITY_TYPE_LABELS: Record<number, string> = {
  0: "PLAYING",
  1: "STREAMING",
  2: "LISTENING TO",
  3: "WATCHING",
  5: "COMPETING IN",
};

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

// Convert hex accent color to a muted gradient fallback when no banner
function accentToGradient(accentHex: string | null | undefined, statusColor: string): [string, string] {
  if (accentHex) return [accentHex, accentHex + "99"];
  return [statusColor, statusColor + "88"];
}

export function RenderCard({ user }: { user: IDiscordData }) {
  const { discord_user, status, activities } = user;
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
  const statusLabel = STATUS_LABELS[status] ?? "Offline";

  const displayName = escapeXml(clip(discord_user.global_name || discord_user.username, 24));
  const username = escapeXml(discord_user.username);
  const avatarUrl = escapeXml(
    discord_user.avatar
      ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discord_user.discriminator || "0", 10) % 5}.png`
  );
  const bannerUrl = discord_user.banner
    ? escapeXml(
        `https://cdn.discordapp.com/banners/${discord_user.id}/${discord_user.banner}.${discord_user.banner.startsWith("a_") ? "gif" : "webp"}?size=480`
      )
    : null;

  const activity = activities.find((a) => a.type !== 4) ?? activities[0] ?? null;
  const artworkUrl =
    activity?.assets?.large_image
      ? escapeXml(getArtworkUrl(activity.application_id, activity.assets.large_image))
      : "";
  const typeLabel = activity ? (ACTIVITY_TYPE_LABELS[activity.type] ?? "PLAYING") : "";
  const actName = activity ? escapeXml(clip(activity.name, 32)) : "";
  const actDetails = activity?.details ? escapeXml(clip(activity.details, 38)) : "";
  const actState = activity?.state ? escapeXml(clip(activity.state, 38)) : "";
  const elapsed = activity?.timestamps?.start ? formatElapsed(activity.timestamps.start) : "";

  const W = 440;
  const BANNER_H = 88;
  const H = activity ? 228 : 160;

  const hasArt = !!artworkUrl;
  const hasActivity = !!activity;

  // Avatar straddles banner/content boundary
  const AV_CX = 52;
  const AV_CY = BANNER_H;
  const AV_R = 34;

  const CONTENT_START = BANNER_H + AV_R + 10; // ~132
  const NAME_Y = CONTENT_START;
  const USER_Y = NAME_Y + 18;
  const DIVIDER_Y = USER_Y + 16;

  const ACT_X = hasArt ? 88 : 16;
  const ACT_BASE = DIVIDER_Y + 14;
  const ACT_TYPE_Y = ACT_BASE;
  const ACT_NAME_Y = ACT_BASE + 16;
  const ACT_DETAIL_Y = ACT_NAME_Y + 15;
  const ACT_STATE_Y = ACT_DETAIL_Y + 14;
  const ACT_ELAPSED_Y = H - 10;

  const [gradFrom, gradTo] = accentToGradient(discord_user.banner_color, statusColor);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }</style>
    <clipPath id="cardClip"><rect width="${W}" height="${H}" rx="12"/></clipPath>
    <clipPath id="bannerClip"><rect width="${W}" height="${BANNER_H}"/></clipPath>
    <clipPath id="avatarClip"><circle cx="${AV_CX}" cy="${AV_CY}" r="${AV_R}"/></clipPath>
    ${hasArt ? `<clipPath id="artClip"><rect x="16" y="${ACT_BASE - 2}" width="60" height="60" rx="8"/></clipPath>` : ""}
    <linearGradient id="bannerFallback" x1="0" y1="0" x2="${W}" y2="${BANNER_H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${gradFrom}"/>
      <stop offset="100%" stop-color="${gradTo}"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#cardClip)">
    <!-- White base -->
    <rect width="${W}" height="${H}" fill="#ffffff"/>

    <!-- Banner -->
    ${bannerUrl
      ? `<image x="0" y="0" width="${W}" height="${BANNER_H}" href="${bannerUrl}" clip-path="url(#bannerClip)" preserveAspectRatio="xMidYMid slice"/>`
      : `<rect width="${W}" height="${BANNER_H}" fill="url(#bannerFallback)"/>`
    }
    <!-- Banner bottom fade -->
    <rect x="0" y="${BANNER_H - 24}" width="${W}" height="24" fill="url(#bannerFade)" opacity="0.35"/>

    <!-- Avatar ring -->
    <circle cx="${AV_CX}" cy="${AV_CY}" r="${AV_R + 3.5}" fill="#ffffff"/>
    <!-- Avatar image -->
    <image x="${AV_CX - AV_R}" y="${AV_CY - AV_R}" width="${AV_R * 2}" height="${AV_R * 2}"
      href="${avatarUrl}" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
    <!-- Status dot -->
    <circle cx="${AV_CX + AV_R - 6}" cy="${AV_CY + AV_R - 6}" r="9" fill="${statusColor}" stroke="#ffffff" stroke-width="3"/>

    <!-- Name block -->
    <text x="102" y="${NAME_Y}" font-size="17" font-weight="700" fill="#0d0d0d">${displayName}</text>
    <text x="102" y="${USER_Y}" font-size="12" fill="#0d0d0d" opacity="0.45">${username} · ${escapeXml(statusLabel)}</text>

    <!-- Divider -->
    <line x1="16" y1="${DIVIDER_Y}" x2="${W - 16}" y2="${DIVIDER_Y}" stroke="#0d0d0d" stroke-width="1" opacity="0.07"/>

    ${hasActivity ? `
    <!-- Artwork -->
    ${hasArt ? `<image x="16" y="${ACT_BASE - 2}" width="60" height="60" href="${artworkUrl}" clip-path="url(#artClip)" preserveAspectRatio="xMidYMid slice"/>` : ""}
    <!-- Activity type -->
    ${typeLabel ? `<text x="${ACT_X}" y="${ACT_TYPE_Y}" font-size="9" font-weight="700" fill="#0d0d0d" opacity="0.35" letter-spacing="1">${typeLabel}</text>` : ""}
    <!-- Activity name -->
    <text x="${ACT_X}" y="${ACT_NAME_Y}" font-size="13.5" font-weight="600" fill="#0d0d0d">${actName}</text>
    ${actDetails ? `<text x="${ACT_X}" y="${ACT_DETAIL_Y}" font-size="12" fill="#0d0d0d" opacity="0.55">${actDetails}</text>` : ""}
    ${actState ? `<text x="${ACT_X}" y="${ACT_STATE_Y}" font-size="12" fill="#0d0d0d" opacity="0.45">${actState}</text>` : ""}
    ${elapsed ? `<text x="${ACT_X}" y="${ACT_ELAPSED_Y}" font-size="11" fill="#0d0d0d" opacity="0.30">${elapsed}</text>` : ""}
    ` : `
    <text x="${Math.round(W / 2)}" y="${Math.round(DIVIDER_Y + (H - DIVIDER_Y) / 2 + 5)}" text-anchor="middle" font-size="12" fill="#0d0d0d" opacity="0.30">No current activity</text>
    `}
  </g>
</svg>`;
}
