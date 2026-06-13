import { Client, GatewayIntentBits, ActivityType, type Activity as DjsActivity } from "discord.js";
import type { IDiscordData, Activity, ActivityAsset } from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var __discordClient: Client | undefined;
  // eslint-disable-next-line no-var
  var __discordReady: Promise<void> | undefined;
}

function getClient(): { client: Client; ready: Promise<void> } {
  if (globalThis.__discordClient && globalThis.__discordReady) {
    return { client: globalThis.__discordClient, ready: globalThis.__discordReady };
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN is not set");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
    ],
  });

  const ready = new Promise<void>((resolve, reject) => {
    client.once("ready", () => resolve());
    client.once("error", reject);
    setTimeout(() => reject(new Error("Discord client connection timed out")), 30_000);
  });

  globalThis.__discordClient = client;
  globalThis.__discordReady = ready;

  client.login(token).catch((err) => {
    globalThis.__discordClient = undefined;
    globalThis.__discordReady = undefined;
    throw err;
  });

  return { client, ready };
}

function buildActivityAsset(
  raw: { largeImage?: string | null; largeText?: string | null; smallImage?: string | null; smallText?: string | null } | null
): ActivityAsset | undefined {
  if (!raw) return undefined;
  return {
    large_image: raw.largeImage ?? "",
    large_text: raw.largeText ?? "",
    small_image: raw.smallImage ?? "",
    small_text: raw.smallText ?? "",
  };
}

function convertActivity(act: DjsActivity): Activity {
  return {
    type: act.type,
    name: act.name,
    id: act.applicationId ?? (act.type === ActivityType.Custom ? "custom" : act.name),
    state: act.state ?? "",
    details: act.details ?? undefined,
    created_at: act.createdTimestamp,
    timestamps: act.timestamps?.start
      ? { start: act.timestamps.start.getTime() }
      : undefined,
    assets: buildActivityAsset(act.assets),
    application_id: act.applicationId ?? undefined,
    flags: act.flags?.bitfield,
  };
}

export async function getUserPresence(userId: string): Promise<IDiscordData> {
  const { client, ready } = getClient();
  await ready;

  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) throw new Error("DISCORD_GUILD_ID is not set");

  const guild =
    client.guilds.cache.get(guildId) ?? (await client.guilds.fetch(guildId));

  // REQUEST_GUILD_MEMBERS with presences:true — returns member + cached presence
  const member = await guild.members.fetch({ user: userId, withPresences: true });

  const presence = guild.presences.cache.get(userId);
  const status = presence?.status ?? "offline";
  const activities = (presence?.activities ?? []).map(convertActivity);

  // fetch full user via REST to get banner (not included in gateway presence)
  const fullUser = await client.users.fetch(userId, { force: true });

  return {
    discord_user: {
      id: member.user.id,
      username: member.user.username,
      global_name: member.user.globalName ?? member.user.username,
      display_name: member.displayName,
      discriminator: member.user.discriminator,
      avatar: member.user.avatar ?? "",
      public_flags: member.user.flags?.bitfield ?? 0,
      bot: member.user.bot,
      clan: null,
      avatar_decoration_data: null,
      banner: fullUser.banner ?? undefined,
      banner_color: fullUser.hexAccentColor ?? null,
      accent_color: fullUser.accentColor ?? null,
    },
    status,
    activities,
    spotify: null,
    active_on_discord_web: !!presence?.clientStatus?.web,
    active_on_discord_desktop: !!presence?.clientStatus?.desktop,
    active_on_discord_mobile: !!presence?.clientStatus?.mobile,
    listening_to_spotify: activities.some((a) => a.name === "Spotify"),
  };
}
