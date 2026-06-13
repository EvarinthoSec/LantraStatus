import { Metadata } from "next";
import { getUserPresence } from "@/lib/discord";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lantrastatus.awarin.art";

interface Props {
  searchParams: Promise<{ id?: string; theme?: string; size?: string; hide?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { id, theme, size, hide } = await searchParams;

  if (!id || !/^\d{17,19}$/.test(id)) {
    return { title: "LantraStatus" };
  }

  const pngUrl = `${APP_URL}/card-png?id=${id}`;

  let title = "Discord Status";
  let description = "Live Discord presence card";

  try {
    const user = await getUserPresence(id);
    const name = user.discord_user.global_name || user.discord_user.username;
    const status = user.status;
    const act = user.activities.find(a => a.type !== 4);
    title = `${name}'s Discord Status`;
    description = act
      ? `${status} · ${act.name}`
      : status.charAt(0).toUpperCase() + status.slice(1);
  } catch {
    // fallback to generic title
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: pngUrl, width: 600, height: 240 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [pngUrl],
    },
  };
}

export default async function StatusPage({ searchParams }: Props) {
  const { id, theme, size, hide } = await searchParams;

  const cardParams = new URLSearchParams(id ? { id } : {});
  if (theme) cardParams.set("theme", theme);
  if (size)  cardParams.set("size", size);
  if (hide)  cardParams.set("hide", hide);

  return (
    <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f" }}>
      {id ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/users?${cardParams}`}
          alt="Discord status card"
          style={{ borderRadius: 12, maxWidth: "90vw", boxShadow: "0 8px 48px rgba(0,0,0,0.6)" }}
        />
      ) : (
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>No Discord ID provided.</p>
      )}
    </main>
  );
}
