import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lantrastatus.vercel.app";

export const metadata: Metadata = {
  title: "LantraStatus — Discord presence in your GitHub README",
  description: "Paste your Discord ID, get an SVG embed URL. Display your live Discord status in any GitHub profile README.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "LantraStatus",
    description: "Display your live Discord status in any GitHub profile README.",
    url: APP_URL,
    siteName: "LantraStatus",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LantraStatus",
    description: "Display your live Discord status in any GitHub profile README.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
