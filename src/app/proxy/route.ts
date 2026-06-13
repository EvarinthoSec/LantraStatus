import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "cdn.discordapp.com",
  "media.discordapp.net",
  "i.scdn.co",           // Spotify artwork
  "mosaic.scdn.co",      // Spotify mosaic artwork
  "assets.spotify.com",
]);

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return new NextResponse("Missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return new NextResponse("Host not allowed", { status: 403 });
  }

  const upstream = await fetch(target.toString(), {
    headers: { "User-Agent": "LantraStatus/2.0" },
  });

  if (!upstream.ok) {
    return new NextResponse("Upstream error", { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/png";
  if (!/^(image|video|audio)\//.test(contentType)) {
    return new NextResponse("Content-type not allowed", { status: 403 });
  }

  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
