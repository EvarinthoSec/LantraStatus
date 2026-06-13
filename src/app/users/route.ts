import { RenderCard } from "@/components/RenderCard";
import { getUserPresence } from "@/lib/discord";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");

  if (!id || !/^\d{17,19}$/.test(id)) {
    return NextResponse.json({ error: "Invalid Discord ID" }, { status: 400 });
  }

  try {
    const user = await getUserPresence(id);

    const headers = new Headers({
      "Content-Type": "image/svg+xml; charset=utf-8",
      "content-security-policy":
        "default-src 'none'; img-src * data:; style-src 'unsafe-inline'",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });

    return new NextResponse(RenderCard({ user }), { headers });
  } catch (error) {
    console.error("[discord]", error);
    return NextResponse.json({ error: "User not found or not in guild" }, { status: 500 });
  }
}