/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{ protocol: "https", hostname: "**" }],
    },
    // discord.js has native addons (zlib-sync, bufferutil) — don't bundle via webpack
    serverExternalPackages: ["discord.js", "@discordjs/ws", "@discordjs/rest"],
};

export default nextConfig;
