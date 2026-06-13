import { IDiscordData } from "@/types";

// ─── Public types ─────────────────────────────────────────────────────────────

export type ThemeId = "light" | "dark" | "vivid" | "minimal" | "midnight";
export type SizeId   = "normal" | "compact";
export type HideKey  = "banner" | "activity" | "elapsed" | "customstatus";

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "light",    label: "Light"    },
  { id: "dark",     label: "Dark"     },
  { id: "vivid",    label: "Vivid"    },
  { id: "minimal",  label: "Minimal"  },
  { id: "midnight", label: "Midnight" },
];

// ─── Theme ────────────────────────────────────────────────────────────────────

interface T {
  cardBg: string;
  bodyGrad: boolean;
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
  barTrack: string;
  barTrackOp: number;
  avatarRing: string;
  dotRing: string;
}

// ─── Color utilities ──────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function toHex(r:number,g:number,b:number): string {
  return "#"+[r,g,b].map(c=>Math.max(0,Math.min(255,Math.round(c))).toString(16).padStart(2,"0")).join("");
}
function lighten(hex:string,t:number): string {
  const rgb=hexToRgb(hex); if(!rgb) return hex;
  return toHex(rgb[0]+(255-rgb[0])*t,rgb[1]+(255-rgb[1])*t,rgb[2]+(255-rgb[2])*t);
}
function darken(hex:string,t:number): string {
  const rgb=hexToRgb(hex); if(!rgb) return hex;
  return toHex(rgb[0]*(1-t),rgb[1]*(1-t),rgb[2]*(1-t));
}
function luminance(hex:string): number {
  const rgb=hexToRgb(hex); if(!rgb) return 0;
  return (0.299*rgb[0]+0.587*rgb[1]+0.114*rgb[2])/255;
}
function contrastText(hex:string): string { return luminance(hex)>0.55?"#1a1a1a":"#ffffff"; }

function getTheme(id: ThemeId, pColor: string, subColor: string): T {
  const dp = darken(pColor,0.35), dp2 = darken(pColor,0.55), ctxt = contrastText(pColor);
  switch(id) {
    case "dark": return {
      cardBg:"#1e1f22", bodyGrad:false, gradFrom:"", gradTo:"", showBannerImg:true,
      bannerFallFrom:darken(pColor,0.2), bannerFallTo:darken(pColor,0.5),
      ink:"#e8eaed", inkMidOp:0.5, inkFaintOp:0.3,
      actBg:pColor, actBgOp:0.08, divColor:pColor, divOp:0.25,
      badgeBg:pColor, badgeBgOp:1, badgeFg:ctxt,
      elapsedColor:pColor, elapsedOp:0.85, barTrack:"#ffffff", barTrackOp:0.12,
      avatarRing:"#1e1f22", dotRing:"#1e1f22",
    };
    case "vivid": return {
      cardBg:pColor, bodyGrad:true, gradFrom:pColor, gradTo:dp, showBannerImg:true,
      bannerFallFrom:darken(pColor,0.1), bannerFallTo:pColor,
      ink:"#ffffff", inkMidOp:0.65, inkFaintOp:0.45,
      actBg:"#ffffff", actBgOp:0.08, divColor:"#ffffff", divOp:0.2,
      badgeBg:"#ffffff", badgeBgOp:0.22, badgeFg:"#ffffff",
      elapsedColor:"#ffffff", elapsedOp:0.7, barTrack:"#ffffff", barTrackOp:0.18,
      avatarRing:"#ffffff", dotRing:pColor,
    };
    case "minimal": return {
      cardBg:"#ffffff", bodyGrad:false, gradFrom:"", gradTo:"", showBannerImg:true,
      bannerFallFrom:"#c4c8ce", bannerFallTo:"#9298a0",
      ink:"#1a1a1a", inkMidOp:0.42, inkFaintOp:0.25,
      actBg:"#000000", actBgOp:0, divColor:"#000000", divOp:0.07,
      badgeBg:"#1a1a1a", badgeBgOp:0.09, badgeFg:"#1a1a1a",
      elapsedColor:"#1a1a1a", elapsedOp:0.28, barTrack:"#000000", barTrackOp:0.1,
      avatarRing:"#ffffff", dotRing:"#ffffff",
    };
    case "midnight": return {
      cardBg:"#0b0b14", bodyGrad:false, gradFrom:"", gradTo:"", showBannerImg:true,
      bannerFallFrom:darken(pColor,0.4), bannerFallTo:dp2,
      ink:"#dde0f5", inkMidOp:0.5, inkFaintOp:0.3,
      actBg:pColor, actBgOp:0.12, divColor:pColor, divOp:0.3,
      badgeBg:pColor, badgeBgOp:1, badgeFg:ctxt,
      elapsedColor:pColor, elapsedOp:1, barTrack:"#ffffff", barTrackOp:0.1,
      avatarRing:"#0b0b14", dotRing:"#0b0b14",
    };
    default: return { // light
      cardBg:"#ffffff", bodyGrad:false, gradFrom:"", gradTo:"", showBannerImg:true,
      bannerFallFrom:pColor, bannerFallTo:lighten(pColor,0.35),
      ink:"#0d0d0d", inkMidOp:0.45, inkFaintOp:0.3,
      actBg:subColor, actBgOp:0.5, divColor:pColor, divOp:0.18,
      badgeBg:pColor, badgeBgOp:1, badgeFg:ctxt,
      elapsedColor:pColor, elapsedOp:0.7, barTrack:"#000000", barTrackOp:0.1,
      avatarRing:"#ffffff", dotRing:"#ffffff",
    };
  }
}

// ─── Static maps ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string,string> = {
  online:"#23a55a", idle:"#f0b132", dnd:"#f23f43", offline:"#80848e",
};
const STATUS_LABELS: Record<string,string> = {
  online:"Online", idle:"Idle", dnd:"Do Not Disturb", offline:"Offline",
};
const ACTIVITY_TYPE_LABELS: Record<number,string> = {
  0:"PLAYING", 1:"STREAMING", 2:"LISTENING TO", 3:"WATCHING", 5:"COMPETING IN",
};
const BADGE_W: Record<string,number> = {
  PLAYING:56, STREAMING:66, "LISTENING TO":88, WATCHING:64, "COMPETING IN":80,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeXml(s:string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
          .replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
function clip(s:string,max:number): string {
  return s.length>max ? s.slice(0,max-1)+"…" : s;
}
function proxy(url: string): string {
  return `/proxy?url=${encodeURIComponent(url)}`;
}
function getArtworkUrl(appId:string|undefined, img:string): string {
  if(!img) return "";
  if(img.startsWith("mp:external/")) return proxy(img.replace("mp:external/","https://media.discordapp.net/external/"));
  if(img.startsWith("spotify:")) return proxy(`https://i.scdn.co/image/${img.replace("spotify:","")}`);
  if(appId) return proxy(`https://cdn.discordapp.com/app-assets/${appId}/${img}.png?size=80`);
  return "";
}
function formatElapsed(ms:number): string {
  const h=Math.floor(ms/3_600_000), m=Math.floor((ms%3_600_000)/60_000);
  if(h>0) return `${h}h ${m}m elapsed`;
  if(m>0) return `${m}m elapsed`;
  return "Just started";
}
function formatMs(ms:number): string {
  const m=Math.floor(ms/60000), s=Math.floor((ms%60000)/1000);
  return `${m}:${s.toString().padStart(2,"0")}`;
}

// Platform icon SVG fragments (12×12 viewport)
function platformIcon(p:"desktop"|"mobile"|"web", x:number, y:number, color:string, op:number): string {
  const f=`fill="${color}" fill-opacity="${op}"`, sf=`stroke="${color}" stroke-opacity="${op}"`;
  switch(p) {
    case "desktop": return `
      <rect x="${x+0.5}" y="${y}" width="11" height="7.5" rx="1.2" fill="none" ${sf} stroke-width="1"/>
      <rect x="${x+4}" y="${y+7.5}" width="4" height="1.5" ${f}/>
      <rect x="${x+2.5}" y="${y+9}" width="7" height="1" ${f}/>`;
    case "mobile": return `
      <rect x="${x+3.5}" y="${y+0.5}" width="5" height="9.5" rx="1.5" fill="none" ${sf} stroke-width="1"/>
      <circle cx="${x+6}" cy="${y+8.5}" r="0.8" ${f}/>`;
    case "web": return `
      <circle cx="${x+6}" cy="${y+5.5}" r="4.8" fill="none" ${sf} stroke-width="1"/>
      <ellipse cx="${x+6}" cy="${y+5.5}" rx="2.4" ry="4.8" fill="none" ${sf} stroke-width="0.7"/>
      <line x1="${x+1.2}" y1="${y+5.5}" x2="${x+10.8}" y2="${y+5.5}" ${sf} stroke-width="0.7"/>`;
  }
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function RenderCard({
  user,
  theme: themeId = "light",
  size = "normal",
  hide = [],
}: {
  user: IDiscordData;
  theme?: ThemeId;
  size?: SizeId;
  hide?: HideKey[];
}): string {
  const { discord_user, status, activities,
          active_on_discord_desktop, active_on_discord_mobile, active_on_discord_web } = user;

  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
  const statusLabel  = STATUS_LABELS[status]  ?? "Offline";
  const pColor    = discord_user.banner_color ?? statusColor;
  const subColor  = lighten(pColor, 0.88);
  const t         = getTheme(themeId, pColor, subColor);

  // ─── Classify activities ─────────────────────────────────────────────────
  const customStatus   = activities.find(a => a.type === 4) ?? null;
  const nonCustom      = activities.filter(a => a.type !== 4);
  const spotifyAct     = nonCustom.find(a => a.name === "Spotify") ?? null;
  const primaryAct     = nonCustom.find(a => a.name !== "Spotify") ?? nonCustom[0] ?? null;

  const showCustom     = !!customStatus?.state && !hide.includes("customstatus");
  const showPrimary    = !!primaryAct && !hide.includes("activity");
  const showSpotify    = !!spotifyAct && !hide.includes("activity");
  const hideBanner     = hide.includes("banner");
  const hideElapsed    = hide.includes("elapsed");
  const isCompact      = size === "compact";

  // ─── User display ─────────────────────────────────────────────────────────
  const displayName = escapeXml(clip(discord_user.global_name || discord_user.username, 22));
  const username    = escapeXml(discord_user.username);
  const avatarUrl   = escapeXml(proxy(
    discord_user.avatar
      ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discord_user.discriminator||"0",10)%5}.png`
  ));
  const bannerUrl = (t.showBannerImg && !hideBanner && discord_user.banner)
    ? escapeXml(proxy(`https://cdn.discordapp.com/banners/${discord_user.id}/${discord_user.banner}.${
        discord_user.banner.startsWith("a_")?"gif":"webp"}?size=480`))
    : null;

  // ─── Custom status ────────────────────────────────────────────────────────
  const csEmoji    = customStatus?.emoji;
  const csEmojiUrl = csEmoji?.id
    ? escapeXml(proxy(`https://cdn.discordapp.com/emojis/${csEmoji.id}.${csEmoji.animated?"gif":"png"}?size=24`))
    : null;
  const csEmojiChar = !csEmoji?.id && csEmoji?.name ? escapeXml(csEmoji.name) : null;
  const csText      = customStatus?.state ? escapeXml(clip(customStatus.state, 32)) : null;

  // ─── Primary activity ─────────────────────────────────────────────────────
  const artworkUrl  = primaryAct?.assets?.large_image
    ? escapeXml(getArtworkUrl(primaryAct.application_id, primaryAct.assets.large_image))
    : "";
  const typeLabel   = primaryAct ? (ACTIVITY_TYPE_LABELS[primaryAct.type] ?? "PLAYING") : "";
  const actName     = primaryAct ? escapeXml(clip(primaryAct.name, 30)) : "";
  const actDetails  = primaryAct?.details ? escapeXml(clip(primaryAct.details, 36)) : "";
  const actState    = primaryAct?.state   ? escapeXml(clip(primaryAct.state, 36))   : "";
  const elapsed     = (!hideElapsed && primaryAct?.timestamps?.start)
    ? formatElapsed(Date.now() - primaryAct.timestamps.start)
    : "";

  // ─── Spotify activity ─────────────────────────────────────────────────────
  const spotArtUrl   = spotifyAct?.assets?.large_image
    ? escapeXml(getArtworkUrl(undefined, spotifyAct.assets.large_image))
    : "";
  const spotTrack    = spotifyAct?.details ? escapeXml(clip(spotifyAct.details, 32)) : "";
  const spotArtist   = spotifyAct?.state   ? escapeXml(clip(spotifyAct.state, 32))   : "";
  const spotAlbum    = spotifyAct?.assets?.large_text ? escapeXml(clip(spotifyAct.assets.large_text,32)) : "";
  const spotStart    = spotifyAct?.timestamps?.start ?? 0;
  const spotEnd      = spotifyAct?.timestamps_end ?? 0;
  const spotFraction = (spotStart && spotEnd)
    ? Math.min(1, Math.max(0, (Date.now()-spotStart)/(spotEnd-spotStart)))
    : 0;
  const spotElapsed  = spotStart ? formatMs(Math.max(0,Date.now()-spotStart)) : "";
  const spotTotal    = spotEnd   ? formatMs(Math.max(0,spotEnd-spotStart))    : "";

  // ─── Platform icons ───────────────────────────────────────────────────────
  const platforms: Array<"desktop"|"mobile"|"web"> = [];
  if (active_on_discord_desktop) platforms.push("desktop");
  if (active_on_discord_mobile)  platforms.push("mobile");
  if (active_on_discord_web)     platforms.push("web");

  // ─── Layout constants ─────────────────────────────────────────────────────
  const W       = 440;
  const BANNER_H= isCompact ? 0 : 80;
  const AV_R    = isCompact ? 22 : 34;
  const AV_CX   = isCompact ? 30 : 52;
  const AV_CY   = isCompact ? 30 : BANNER_H;
  const NAME_X  = AV_CX + AV_R + (isCompact ? 10 : 16);
  const NAME_Y  = isCompact ? 24 : 97;
  const USER_Y  = isCompact ? 39 : 115;
  const CS_Y    = USER_Y + (isCompact ? 15 : 15);
  const DIVIDER_Y = showCustom ? CS_Y + (isCompact ? 10 : 12) : USER_Y + (isCompact ? 10 : 16);

  // ─── Primary activity layout ──────────────────────────────────────────────
  const hasArt    = !!artworkUrl;
  const ART_SIZE  = 52;
  const ACT_SEC_Y = DIVIDER_Y + (isCompact ? 10 : 14);
  const ART_Y     = ACT_SEC_Y;
  const TEXT_X    = hasArt ? 16 + ART_SIZE + 10 : 16;
  const ROW_NAME_Y   = ART_Y + 14;
  const ROW_DETAIL_Y = ROW_NAME_Y + 15;
  const ROW_STATE_Y  = ROW_DETAIL_Y + 14;
  const ART_BOTTOM   = ART_Y + ART_SIZE;
  const textBottom   = actState ? ROW_STATE_Y : actDetails ? ROW_DETAIL_Y : showPrimary ? ROW_NAME_Y : ACT_SEC_Y;
  const primaryBottom = showPrimary ? Math.max(ART_BOTTOM, textBottom) : ACT_SEC_Y;
  const ELAPSED_Y    = primaryBottom + 18;
  const primaryEnd   = (elapsed && showPrimary) ? ELAPSED_Y : showPrimary ? primaryBottom + 10 : DIVIDER_Y + 20;

  // Badge (primary activity, right side)
  const bw      = BADGE_W[typeLabel] ?? 64;
  const BADGE_X = W - 16 - bw;
  const BADGE_TOP = ART_Y + 1;

  // ─── Spotify layout ───────────────────────────────────────────────────────
  const hasSpotArt = !!spotArtUrl;
  const SPOT_IS_SECONDARY = showPrimary && showSpotify; // stacked under primary
  const SPOT_ART_SIZE = SPOT_IS_SECONDARY ? 40 : ART_SIZE;
  const SPOT_SEC_Y  = showPrimary ? primaryEnd + 12 : DIVIDER_Y + (isCompact ? 10 : 14);
  const SPOT_SEPARATOR_Y = showPrimary ? primaryEnd + 6 : 0;
  const SPOT_ART_Y  = SPOT_SEC_Y;
  const SPOT_TEXT_X = hasSpotArt ? 16 + SPOT_ART_SIZE + 10 : 16;
  const SPOT_TRACK_Y  = SPOT_ART_Y + 14;
  const SPOT_ARTIST_Y = SPOT_TRACK_Y + (SPOT_IS_SECONDARY ? 14 : 15);
  const SPOT_ART_BOTTOM = SPOT_ART_Y + SPOT_ART_SIZE;
  const SPOT_BAR_Y    = Math.max(SPOT_ART_BOTTOM, SPOT_ARTIST_Y) + (SPOT_IS_SECONDARY ? 6 : 8);
  const SPOT_BAR_W    = W - SPOT_TEXT_X - 16 - (spotTotal ? 52 : 0);
  const SPOT_END_Y    = SPOT_BAR_Y + (showSpotify ? 16 : 0);

  // ─── Total height ──────────────────────────────────────────────────────────
  const actEnd = showSpotify ? SPOT_END_Y : showPrimary ? primaryEnd : DIVIDER_Y + 44;
  const H = actEnd + 12;

  // ─── Platform icons positions ─────────────────────────────────────────────
  const ICON_Y   = USER_Y - 9;
  const ICON_W   = 13;
  const platformSvg = platforms.map((p, i) => {
    const x = W - 16 - (platforms.length - i) * (ICON_W + 3);
    return platformIcon(p, x, ICON_Y, t.ink, t.inkFaintOp + 0.08);
  }).join("");

  // ─── SVG ──────────────────────────────────────────────────────────────────
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }</style>
    <clipPath id="cc"><rect width="${W}" height="${H}" rx="${isCompact ? 8 : 12}"/></clipPath>
    ${BANNER_H > 0 ? `<clipPath id="bc"><rect width="${W}" height="${BANNER_H}"/></clipPath>` : ""}
    <clipPath id="ac"><circle cx="${AV_CX}" cy="${AV_CY}" r="${AV_R}"/></clipPath>
    ${hasArt ? `<clipPath id="arc"><rect x="16" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" rx="8"/></clipPath>` : ""}
    ${hasSpotArt ? `<clipPath id="sc"><rect x="16" y="${SPOT_ART_Y}" width="${SPOT_ART_SIZE}" height="${SPOT_ART_SIZE}" rx="${SPOT_IS_SECONDARY ? 6 : 8}"/></clipPath>` : ""}
    ${BANNER_H > 0 ? `
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${BANNER_H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${t.bannerFallFrom}"/>
      <stop offset="100%" stop-color="${t.bannerFallTo}"/>
    </linearGradient>
    <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000"/>
    </linearGradient>` : ""}
    ${t.bodyGrad && BANNER_H > 0 ? `
    <linearGradient id="vg" x1="0" y1="${BANNER_H}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${t.gradFrom}"/>
      <stop offset="100%" stop-color="${t.gradTo}"/>
    </linearGradient>` : ""}
    ${t.bodyGrad && BANNER_H === 0 ? `
    <linearGradient id="vg" x1="0" y1="0" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${t.gradFrom}"/>
      <stop offset="100%" stop-color="${t.gradTo}"/>
    </linearGradient>` : ""}
  </defs>

  <g clip-path="url(#cc)">

    <!-- Card base -->
    <rect width="${W}" height="${H}" fill="${t.bodyGrad ? "url(#vg)" : t.cardBg}"/>

    ${BANNER_H > 0 ? `
    <!-- Activity section tint -->
    ${(showPrimary || showSpotify) ? `<rect x="0" y="${DIVIDER_Y}" width="${W}" height="${H-DIVIDER_Y}" fill="${t.actBg}" fill-opacity="${t.actBgOp}"/>` : ""}
    <!-- Banner -->
    ${bannerUrl
      ? `<image x="0" y="0" width="${W}" height="${BANNER_H}" href="${bannerUrl}" clip-path="url(#bc)" preserveAspectRatio="xMidYMid slice"/>
         <rect x="0" y="${BANNER_H-28}" width="${W}" height="28" fill="url(#bf)" fill-opacity="0.4"/>`
      : `<rect width="${W}" height="${BANNER_H}" fill="${BANNER_H > 0 ? "url(#bg)" : t.cardBg}"/>`}
    <!-- Vivid body gradient overlay -->
    ${t.bodyGrad ? `<rect x="0" y="${BANNER_H}" width="${W}" height="${H-BANNER_H}" fill="url(#vg)"/>` : ""}
    ` : `
    <!-- Compact: activity tint -->
    ${(showPrimary || showSpotify) ? `<rect x="0" y="${DIVIDER_Y}" width="${W}" height="${H-DIVIDER_Y}" fill="${t.actBg}" fill-opacity="${t.actBgOp}"/>` : ""}
    `}

    <!-- Avatar ring + image -->
    <circle cx="${AV_CX}" cy="${AV_CY}" r="${AV_R+3.5}" fill="${t.avatarRing}"/>
    <image x="${AV_CX-AV_R}" y="${AV_CY-AV_R}" width="${AV_R*2}" height="${AV_R*2}"
      href="${avatarUrl}" clip-path="url(#ac)" preserveAspectRatio="xMidYMid slice"/>
    <!-- Status dot -->
    <circle cx="${AV_CX+AV_R-5}" cy="${AV_CY+AV_R-5}" r="${isCompact?6.5:8.5}"
      fill="${statusColor}" stroke="${t.dotRing}" stroke-width="2.5"/>

    <!-- Display name -->
    <text x="${NAME_X}" y="${NAME_Y}" font-size="${isCompact?15:17}" font-weight="700" fill="${t.ink}">${displayName}</text>
    <!-- Username · Status -->
    <text x="${NAME_X}" y="${USER_Y}" font-size="11.5" fill="${t.ink}" fill-opacity="${t.inkMidOp}">${username} · ${escapeXml(statusLabel)}</text>
    <!-- Platform icons -->
    ${platformSvg}

    <!-- Custom status -->
    ${showCustom ? `
    ${csEmojiUrl
      ? `<image x="${NAME_X}" y="${CS_Y-12}" width="13" height="13" href="${csEmojiUrl}"/>
         <text x="${NAME_X+16}" y="${CS_Y}" font-size="11" fill="${t.ink}" fill-opacity="${t.inkMidOp}">${csText}</text>`
      : `<text x="${NAME_X}" y="${CS_Y}" font-size="11" fill="${t.ink}" fill-opacity="${t.inkMidOp}">${csEmojiChar ? csEmojiChar+" " : ""}${csText}</text>`
    }` : ""}

    <!-- Divider -->
    <line x1="0" y1="${DIVIDER_Y}" x2="${W}" y2="${DIVIDER_Y}" stroke="${t.divColor}" stroke-width="1" stroke-opacity="${t.divOp}"/>

    ${showPrimary ? `
    <!-- Primary activity artwork -->
    ${hasArt ? `<image x="16" y="${ART_Y}" width="${ART_SIZE}" height="${ART_SIZE}" href="${artworkUrl}" clip-path="url(#arc)" preserveAspectRatio="xMidYMid slice"/>` : ""}
    <!-- Badge pill -->
    ${typeLabel ? `
    <rect x="${BADGE_X}" y="${BADGE_TOP}" width="${bw}" height="17" rx="4" fill="${t.badgeBg}" fill-opacity="${t.badgeBgOp}"/>
    <text x="${BADGE_X+bw/2}" y="${BADGE_TOP+12}" text-anchor="middle" font-size="9" font-weight="700" fill="${t.badgeFg}" letter-spacing="0.8">${typeLabel}</text>
    ` : ""}
    <!-- Activity name -->
    <text x="${TEXT_X}" y="${ROW_NAME_Y}" font-size="13.5" font-weight="600" fill="${t.ink}">${actName}</text>
    ${actDetails ? `<text x="${TEXT_X}" y="${ROW_DETAIL_Y}" font-size="12" fill="${t.ink}" fill-opacity="${t.inkMidOp}">${actDetails}</text>` : ""}
    ${actState   ? `<text x="${TEXT_X}" y="${ROW_STATE_Y}" font-size="12" fill="${t.ink}" fill-opacity="${t.inkFaintOp+0.1}">${actState}</text>` : ""}
    ${elapsed    ? `<text x="${TEXT_X}" y="${ELAPSED_Y}" font-size="11" fill="${t.elapsedColor}" fill-opacity="${t.elapsedOp}">${elapsed}</text>` : ""}
    ` : !showSpotify ? `
    <text x="${Math.round(W/2)}" y="${Math.round(DIVIDER_Y+(H-DIVIDER_Y)/2+5)}" text-anchor="middle" font-size="12" fill="${t.ink}" fill-opacity="${t.inkFaintOp}">No current activity</text>
    ` : ""}

    ${showSpotify ? `
    <!-- Spotify separator (when stacked) -->
    ${SPOT_IS_SECONDARY ? `<line x1="16" y1="${SPOT_SEPARATOR_Y}" x2="${W-16}" y2="${SPOT_SEPARATOR_Y}" stroke="${t.divColor}" stroke-width="0.75" stroke-opacity="${t.divOp*0.6}"/>` : ""}
    <!-- Spotify album art -->
    ${hasSpotArt ? `<image x="16" y="${SPOT_ART_Y}" width="${SPOT_ART_SIZE}" height="${SPOT_ART_SIZE}" href="${spotArtUrl}" clip-path="url(#sc)" preserveAspectRatio="xMidYMid slice"/>` : ""}
    <!-- Spotify badge -->
    <rect x="${BADGE_X}" y="${SPOT_ART_Y+1}" width="${BADGE_W["LISTENING TO"]}" height="17" rx="4" fill="${t.badgeBg}" fill-opacity="${t.badgeBgOp}"/>
    <text x="${BADGE_X+BADGE_W["LISTENING TO"]/2}" y="${SPOT_ART_Y+13}" text-anchor="middle" font-size="9" font-weight="700" fill="${t.badgeFg}" letter-spacing="0.8">LISTENING TO</text>
    <!-- Track -->
    <text x="${SPOT_TEXT_X}" y="${SPOT_TRACK_Y}" font-size="${SPOT_IS_SECONDARY?12.5:13.5}" font-weight="600" fill="${t.ink}">${spotTrack}</text>
    <!-- Artist -->
    <text x="${SPOT_TEXT_X}" y="${SPOT_ARTIST_Y}" font-size="12" fill="${t.ink}" fill-opacity="${t.inkMidOp}">${spotArtist}${spotAlbum && !SPOT_IS_SECONDARY ? ` · ${spotAlbum}` : ""}</text>
    <!-- Progress bar -->
    ${spotFraction > 0 ? `
    <rect x="${SPOT_TEXT_X}" y="${SPOT_BAR_Y}" width="${SPOT_BAR_W}" height="3" rx="1.5" fill="${t.barTrack}" fill-opacity="${t.barTrackOp}"/>
    <rect x="${SPOT_TEXT_X}" y="${SPOT_BAR_Y}" width="${Math.round(SPOT_BAR_W*spotFraction)}" height="3" rx="1.5" fill="${t.elapsedColor}" fill-opacity="${t.elapsedOp}"/>
    ${spotTotal ? `<text x="${W-16}" y="${SPOT_BAR_Y+12}" text-anchor="end" font-size="10" fill="${t.ink}" fill-opacity="${t.inkFaintOp}">${spotElapsed} / ${spotTotal}</text>` : ""}
    ` : spotElapsed ? `<text x="${SPOT_TEXT_X}" y="${SPOT_BAR_Y+10}" font-size="11" fill="${t.elapsedColor}" fill-opacity="${t.elapsedOp}">${spotElapsed} elapsed</text>` : ""}
    ` : ""}

  </g>
</svg>`;
}
