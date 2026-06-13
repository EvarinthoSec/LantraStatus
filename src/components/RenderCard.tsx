import { IDiscordData } from "@/types";

// ─── Theme ────────────────────────────────────────────────────────────────────

export type ThemeId = "light" | "dark" | "vivid" | "minimal" | "midnight";

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "light",    label: "Light"    },
  { id: "dark",     label: "Dark"     },
  { id: "vivid",    label: "Vivid"    },
  { id: "minimal",  label: "Minimal"  },
  { id: "midnight", label: "Midnight" },
];

interface T {
  cardBg: string;
  fullGrad: boolean;      // vivid: gradient covers entire card, no banner split
  gradFrom: string;
  gradTo: string;
  showBannerImg: boolean;
  bannerFallFrom: string;
  bannerFallTo: string;
  ink: string;
  inkMidOp: number;
  inkFaintOp: number;
  actBg: string;
  actBgOp: number;
  divColor: string;
  divOp: number;
  badgeBg: string;
  badgeBgOp: number;
  badgeFg: string;
  elapsedColor: string;
  elapsedOp: number;
  avatarRing: string;
  dotRing: string;
}

// ─── Color utilities ──────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");
}

function lighten(hex: string, t: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return toHex(rgb[0] + (255 - rgb[0]) * t, rgb[1] + (255 - rgb[1]) * t, rgb[2] + (255 - rgb[2]) * t);
}

function darken(hex: string, t: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return toHex(rgb[0] * (1 - t), rgb[1] * (1 - t), rgb[2] * (1 - t));
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
}

function contrastText(hex: string): string {
  return luminance(hex) > 0.55 ? "#1a1a1a" : "#ffffff";
}

function getTheme(id: ThemeId, pColor: string, subColor: string): T {
  const dp = darken(pColor, 0.35);
  const dp2 = darken(pColor, 0.55);
  const ctxt = contrastText(pColor);

  switch (id) {
    case "dark":
      return {
        cardBg: "#1e1f22", fullGrad: false, gradFrom: "", gradTo: "",
        showBannerImg: true,
        bannerFallFrom: darken(pColor, 0.2), bannerFallTo: darken(pColor, 0.5),
        ink: "#e8eaed", inkMidOp: 0.5, inkFaintOp: 0.3,
        actBg: pColor, actBgOp: 0.08,
        divColor: pColor, divOp: 0.25,
        badgeBg: pColor, badgeBgOp: 1, badgeFg: ctxt,
        elapsedColor: pColor, elapsedOp: 0.85,
        avatarRing: "#1e1f22", dotRing: "#1e1f22",
      };

    case "vivid":
      return {
        cardBg: pColor, fullGrad: true, gradFrom: pColor, gradTo: dp,
        showBannerImg: false,
        bannerFallFrom: pColor, bannerFallTo: dp,
        ink: "#ffffff", inkMidOp: 0.65, inkFaintOp: 0.45,
        actBg: "#ffffff", actBgOp: 0.1,
        divColor: "#ffffff", divOp: 0.2,
        badgeBg: "#ffffff", badgeBgOp: 0.22, badgeFg: "#ffffff",
        elapsedColor: "#ffffff", elapsedOp: 0.7,
        avatarRing: "#ffffff", dotRing: pColor,
      };

    case "minimal":
      return {
        cardBg: "#ffffff", fullGrad: false, gradFrom: "", gradTo: "",
        showBannerImg: true,
        bannerFallFrom: "#c4c8ce", bannerFallTo: "#9298a0",
        ink: "#1a1a1a", inkMidOp: 0.42, inkFaintOp: 0.25,
        actBg: "#000000", actBgOp: 0,
        divColor: "#000000", divOp: 0.07,
        badgeBg: "#1a1a1a", badgeBgOp: 0.09, badgeFg: "#1a1a1a",
        elapsedColor: "#1a1a1a", elapsedOp: 0.28,
        avatarRing: "#ffffff", dotRing: "#ffffff",
      };

    case "midnight":
      return {
        cardBg: "#0b0b14", fullGrad: false, gradFrom: "", gradTo: "",
        showBannerImg: true,
        bannerFallFrom: darken(pColor, 0.4), bannerFallTo: dp2,
        ink: "#dde0f5", inkMidOp: 0.5, inkFaintOp: 0.3,
        actBg: pColor, actBgOp: 0.12,
        divColor: pColor, divOp: 0.3,
        badgeBg: pColor, badgeBgOp: 1, badgeFg: ctxt,
        elapsedColor: pColor, elapsedOp: 1,
        avatarRing: "#0b0b14", dotRing: "#0b0b14",
      };

    default: // light
      return {
        cardBg: "#ffffff", fullGrad: false, gradFrom: "", gradTo: "",
        showBannerImg: true,
        bannerFallFrom: pColor, bannerFallTo: lighten(pColor, 0.35),
        ink: "#0d0d0d", inkMidOp: 0.45, inkFaintOp: 0.3,
        actBg: subColor, actBgOp: 0.5,
        divColor: pColor, divOp: 0.18,
        badgeBg: pColor, badgeBgOp: 1, badgeFg: ctxt,
        elapsedColor: pColor, elapsedOp: 0.7,
        avatarRing: "#ffffff", dotRing: "#ffffff",
      };
  }
}

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
const BADGE_W: Record<string, number> = {
  PLAYING: 56, STREAMING: 66, "LISTENING TO": 88, WATCHING: 64, "COMPETING IN": 80,
};

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

export function RenderCard({
  user,
  theme: themeId = "light",
}: {
  user: IDiscordData;
  theme?: ThemeId;
}): string {
  const { discord_user, status, activities } = user;

  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
  const statusLabel = STATUS_LABELS[status] ?? "Offline";

  // p_color from Discord accent; sub_color from lighten
  const pColor = discord_user.banner_color ?? statusColor;
  const subColor = lighten(pColor, 0.88);
  const t = getTheme(themeId, pColor, subColor);

  // User info
  const displayName = escapeXml(clip(discord_user.global_name || discord_user.username, 22));
  const username = escapeXml(discord_user.username);
  const avatarUrl = escapeXml(
    discord_user.avatar
      ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discord_user.discriminator || "0", 10) % 5}.png`
  );
  const bannerUrl =
    t.showBannerImg && discord_user.banner
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
  const AV_CX = 52, AV_CY = BANNER_H, AV_R = 34;

  const NAME_X = 102;
  const NAME_Y = 97;
  const USER_Y = 115;
  const DIVIDER_Y = 131;

  const ART_SIZE = 52;
  const ART_Y = DIVIDER_Y + 16;
  const hasArt = !!artworkUrl;
  const TEXT_X = hasArt ? 16 + ART_SIZE + 10 : 16;

  const ROW_NAME_Y = ART_Y + 14;
  const ROW_DETAIL_Y = ROW_NAME_Y + 15;
  const ROW_STATE_Y = ROW_DETAIL_Y + 14;
  const ART_BOTTOM = ART_Y + ART_SIZE;

  const textBottom = actState ? ROW_STATE_Y : actDetails ? ROW_DETAIL_Y : activity ? ROW_NAME_Y : DIVIDER_Y + 40;
  const contentBottom = activity ? Math.max(ART_BOTTOM, textBottom) : DIVIDER_Y + 40;
  const ELAPSED_Y = contentBottom + 18;
  const H = elapsed && activity ? ELAPSED_Y + 12 : activity ? contentBottom + 14 : DIVIDER_Y + 50;

  // Badge pill (right side, aligned with art top)
  const bw = BADGE_W[typeLabel] ?? 64;
  const BADGE_X = W - 16 - bw;
  const BADGE_TOP = ART_Y + 1;
  const BADGE_PH = 17;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }</style>
    <clipPath id="cardClip"><rect width="${W}" height="${H}" rx="12"/></clipPath>
    <clipPath id="bannerClip"><rect width="${W}" height="${BANNER_H}"/></clipPath>
    <clipPath id="avatarClip"><circle cx="${AV_CX}" cy="${AV_CY}" r="${AV_R}"/></clipPath>
    ${hasArt ? `<clipPath id="artClip"><rect x="16" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" rx="8"/></clipPath>` : ""}

    ${t.fullGrad ? `
    <linearGradient id="vividGrad" x1="0" y1="0" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${t.gradFrom}"/>
      <stop offset="100%" stop-color="${t.gradTo}"/>
    </linearGradient>` : `
    <linearGradient id="bannerGrad" x1="0" y1="0" x2="${W}" y2="${BANNER_H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${t.bannerFallFrom}"/>
      <stop offset="100%" stop-color="${t.bannerFallTo}"/>
    </linearGradient>
    <linearGradient id="bannerFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>`}
  </defs>

  <g clip-path="url(#cardClip)">

    ${t.fullGrad ? `
    <!-- Vivid: full gradient background -->
    <rect width="${W}" height="${H}" fill="url(#vividGrad)"/>
    ` : `
    <!-- Base card color -->
    <rect width="${W}" height="${H}" fill="${t.cardBg}"/>
    <!-- Activity section tint -->
    ${activity ? `<rect x="0" y="${DIVIDER_Y}" width="${W}" height="${H - DIVIDER_Y}" fill="${t.actBg}" fill-opacity="${t.actBgOp}"/>` : ""}
    <!-- Banner -->
    ${bannerUrl
      ? `<image x="0" y="0" width="${W}" height="${BANNER_H}" href="${bannerUrl}" clip-path="url(#bannerClip)" preserveAspectRatio="xMidYMid slice"/>
         <rect x="0" y="${BANNER_H - 28}" width="${W}" height="28" fill="url(#bannerFade)" fill-opacity="0.4"/>`
      : `<rect width="${W}" height="${BANNER_H}" fill="url(#bannerGrad)"/>`}
    `}

    <!-- Avatar ring -->
    <circle cx="${AV_CX}" cy="${AV_CY}" r="${AV_R + 3.5}" fill="${t.avatarRing}"/>
    <!-- Avatar -->
    <image x="${AV_CX - AV_R}" y="${AV_CY - AV_R}" width="${AV_R * 2}" height="${AV_R * 2}"
      href="${avatarUrl}" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
    <!-- Status dot -->
    <circle cx="${AV_CX + AV_R - 5}" cy="${AV_CY + AV_R - 5}" r="8.5"
      fill="${statusColor}" stroke="${t.dotRing}" stroke-width="3"/>

    <!-- Display name -->
    <text x="${NAME_X}" y="${NAME_Y}" font-size="17" font-weight="700" fill="${t.ink}">${displayName}</text>
    <!-- Username · Status -->
    <text x="${NAME_X}" y="${USER_Y}" font-size="11.5" fill="${t.ink}" fill-opacity="${t.inkMidOp}">${username} · ${escapeXml(statusLabel)}</text>

    <!-- Divider -->
    <line x1="0" y1="${DIVIDER_Y}" x2="${W}" y2="${DIVIDER_Y}"
      stroke="${t.divColor}" stroke-width="1" stroke-opacity="${t.divOp}"/>

    ${activity ? `

    <!-- Artwork -->
    ${hasArt ? `<image x="16" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}"
      href="${artworkUrl}" clip-path="url(#artClip)" preserveAspectRatio="xMidYMid slice"/>` : ""}

    <!-- Badge pill -->
    ${typeLabel ? `
    <rect x="${BADGE_X}" y="${BADGE_TOP}" width="${bw}" height="${BADGE_PH}" rx="4"
      fill="${t.badgeBg}" fill-opacity="${t.badgeBgOp}"/>
    <text x="${BADGE_X + bw / 2}" y="${BADGE_TOP + 12}" text-anchor="middle"
      font-size="9" font-weight="700" fill="${t.badgeFg}" letter-spacing="0.8">${typeLabel}</text>
    ` : ""}

    <!-- Activity name -->
    <text x="${TEXT_X}" y="${ROW_NAME_Y}" font-size="13.5" font-weight="600" fill="${t.ink}">${actName}</text>
    <!-- Details -->
    ${actDetails ? `<text x="${TEXT_X}" y="${ROW_DETAIL_Y}" font-size="12" fill="${t.ink}" fill-opacity="${t.inkMidOp}">${actDetails}</text>` : ""}
    <!-- State -->
    ${actState ? `<text x="${TEXT_X}" y="${ROW_STATE_Y}" font-size="12" fill="${t.ink}" fill-opacity="${t.inkFaintOp + 0.1}">${actState}</text>` : ""}
    <!-- Elapsed -->
    ${elapsed ? `<text x="${TEXT_X}" y="${ELAPSED_Y}" font-size="11" fill="${t.elapsedColor}" fill-opacity="${t.elapsedOp}">${elapsed}</text>` : ""}

    ` : `
    <text x="${Math.round(W / 2)}" y="${Math.round(DIVIDER_Y + (H - DIVIDER_Y) / 2 + 5)}"
      text-anchor="middle" font-size="12" fill="${t.ink}" fill-opacity="${t.inkFaintOp}">No current activity</text>
    `}

  </g>
</svg>`;
}
