/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["*"],
    },
    experimental: {
        // discord.js has native addons (zlib-sync, bufferutil) — don't bundle via webpack
        serverComponentsExternalPackages: ["discord.js", "@discordjs/ws", "@discordjs/rest"],
    },
};

export default nextConfig;