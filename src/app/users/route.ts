import { RenderCard, ThemeId, SizeId, HideKey, THEMES } from "@/components/RenderCard";
import { getUserPresence } from "@/lib/discord";
import { NextRequest, NextResponse } from "next/server";

const VALID_THEMES = new Set<ThemeId>(THEMES.map(t => t.id));
const VALID_SIZES  = new Set<SizeId>(["normal", "compact"]);
const VALID_HIDE   = new Set<HideKey>(["banner","activity","elapsed","customstatus"]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id       = searchParams.get("id");
  const rawTheme = searchParams.get("theme") ?? "light";
  const rawSize  = searchParams.get("size")  ?? "normal";
  const rawHide  = (searchParams.get("hide") ?? "").split(",").filter(Boolean);

  const theme = VALID_THEMES.has(rawTheme as ThemeId) ? (rawTheme as ThemeId) : "light";
  const size  = VALID_SIZES.has(rawSize as SizeId)    ? (rawSize  as SizeId)  : "normal";
  const hide  = rawHide.filter((h): h is HideKey => VALID_HIDE.has(h as HideKey));

  if (!id || !/^\d{17,19}$/.test(id)) {
    return NextResponse.json({ error: "Invalid Discord ID" }, { status: 400 });
  }

  try {
    const user = await getUserPresence(id);
    const headers = new Headers({
      "Content-Type": "image/svg+xml; charset=utf-8",
      "content-security-policy": "default-src 'none'; img-src * data:; style-src 'unsafe-inline'",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });
    return new NextResponse(RenderCard({ user, theme, size, hide }), { headers });
  } catch (error) {
    console.error("[discord]", error);
    return NextResponse.json({ error: "User not found or not in guild" }, { status: 500 });
  }
}
