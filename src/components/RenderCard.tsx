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

export function RenderCard({ user }: { user: IDiscordData }) {
  const { discord_user, status, activities } = user;
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
  const statusLabel = STATUS_LABELS[status] ?? "Offline";

  const displayName = escapeXml(clip(discord_user.global_name || discord_user.username, 22));
  const username = escapeXml(discord_user.username);
  const avatarUrl = escapeXml(
    discord_user.avatar
      ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discord_user.discriminator || "0", 10) % 5}.png`
  );

  const activity = activities.find((a) => a.type !== 4) ?? activities[0] ?? null;
  const artworkUrl =
    activity?.assets?.large_image
      ? escapeXml(getArtworkUrl(activity.application_id, activity.assets.large_image))
      : "";
  const typeLabel = activity ? (ACTIVITY_TYPE_LABELS[activity.type] ?? "PLAYING") : "";
  const actName = activity ? escapeXml(clip(activity.name, 30)) : "";
  const actDetails = activity?.details ? escapeXml(clip(activity.details, 35)) : "";
  const actState = activity?.state ? escapeXml(clip(activity.state, 35)) : "";
  const elapsed = activity?.timestamps?.start ? formatElapsed(activity.timestamps.start) : "";

  const W = 440;
  const H = 180;
  const hasArt = !!artworkUrl;
  const tX = hasArt ? 92 : 16;

  const TYPE_Y = 106;
  const NAME_Y = typeLabel ? 123 : 112;
  const DETAIL_Y = NAME_Y + 17;
  const STATE_Y = DETAIL_Y + 15;
  const ELAPSED_Y = H - 10;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }</style>
    <clipPath id="cardClip"><rect width="${W}" height="${H}" rx="10"/></clipPath>
    <clipPath id="avatarClip"><circle cx="48" cy="42" r="27"/></clipPath>
    ${hasArt ? `<clipPath id="artClip"><rect x="16" y="98" width="60" height="60" rx="8"/></clipPath>` : ""}
  </defs>
  <g clip-path="url(#cardClip)">
    <rect width="${W}" height="${H}" fill="white"/>
    <rect x="0" y="0" width="5" height="${H}" fill="${statusColor}"/>
    <image x="21" y="15" width="54" height="54" href="${avatarUrl}" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
    <circle cx="66" cy="60" r="7.5" fill="${statusColor}" stroke="white" stroke-width="2.5"/>
    <text x="90" y="36" font-size="17" font-weight="700" fill="#0d0d0d">${displayName}</text>
    <text x="90" y="55" font-size="12" fill="#0d0d0d" opacity="0.45">${username} · ${escapeXml(statusLabel)}</text>
    <line x1="16" y1="82" x2="424" y2="82" stroke="#0d0d0d" stroke-width="1" opacity="0.07"/>
    ${activity ? `
    ${hasArt ? `<image x="16" y="98" width="60" height="60" href="${artworkUrl}" clip-path="url(#artClip)" preserveAspectRatio="xMidYMid slice"/>` : ""}
    ${typeLabel ? `<text x="${tX}" y="${TYPE_Y}" font-size="9.5" font-weight="600" fill="#0d0d0d" opacity="0.38" letter-spacing="0.8">${typeLabel}</text>` : ""}
    <text x="${tX}" y="${NAME_Y}" font-size="14" font-weight="600" fill="#0d0d0d">${actName}</text>
    ${actDetails ? `<text x="${tX}" y="${DETAIL_Y}" font-size="12" fill="#0d0d0d" opacity="0.55">${actDetails}</text>` : ""}
    ${actState ? `<text x="${tX}" y="${STATE_Y}" font-size="12" fill="#0d0d0d" opacity="0.45">${actState}</text>` : ""}
    ${elapsed ? `<text x="${tX}" y="${ELAPSED_Y}" font-size="11" fill="#0d0d0d" opacity="0.32">${elapsed}</text>` : ""}
    ` : `
    <text x="${Math.round(W / 2)}" y="${Math.round(82 + (H - 82) / 2 + 5)}" text-anchor="middle" font-size="12.5" fill="#0d0d0d" opacity="0.35">No current activity</text>
    `}
  </g>
</svg>`;
}
