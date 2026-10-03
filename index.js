import 'dotenv/config';
import ffmpegPath from 'ffmpeg-static';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';

if (ffmpegPath) process.env.FFMPEG_PATH = ffmpegPath;

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN in environment variables.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const player = new Player(client);

client.once('clientReady', async (readyClient) => {
  await player.extractors.loadMulti(DefaultExtractors);

  const status = process.env.BOT_STATUS || '🎵 /play | PATIO MUSIC';
  readyClient.user.setPresence({
    activities: [{ name: status, type: ActivityType.Listening }],
    status: 'online',
  });

  console.log(`Logged in as ${readyClient.user.tag}`);
  console.log(`Servers: ${readyClient.guilds.cache.size}`);
  console.log('PATIO MUSIC is online.');
});

player.events.on('playerStart', (queue, track) => {
  const channel = queue.metadata;
  if (channel?.send) {
    channel.send(`🎶 Now playing: **${track.title}**`).catch(() => {});
  }
});

player.events.on('playerFinish', (queue, track) => {
  const channel = queue.metadata;
  if (channel?.send) {
    channel.send(`✅ Finished: **${track.title}**`).catch(() => {});
  }
});

player.events.on('error', (queue, error) => {
  console.error('[Player Error]', error);
  queue.metadata?.send?.(`❌ Player error: ${error.message}`).catch(() => {});
});

player.events.on('playerError', (queue, error) => {
  console.error('[Player Error]', error);
  queue.metadata?.send?.(`❌ Could not play that track: ${error.message}`).catch(() => {});
});

player.events.on('emptyQueue', (queue) => {
  queue.metadata?.send?.('📭 Queue finished.').catch(() => {});
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands?.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, player);
  } catch (error) {
    console.error(error);
    const message = '❌ Something went wrong while running that command.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message).catch(() => {});
    } else {
      await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
    }
  }
});

// Load command modules
const commandFiles = [
  'play', 'skip', 'stop', 'pause', 'resume', 'queue', 'nowplaying',
  'volume', 'loop', 'shuffle', 'clear', 'join', 'leave', 'ping', 'help'
];
const commands = new Map();
for (const name of commandFiles) {
  const mod = await import(`./commands/${name}.js`);
  commands.set(mod.data.name, mod);
}
client.commands = commands;

process.on('unhandledRejection', (error) => console.error('Unhandled rejection:', error));
process.on('uncaughtException', (error) => console.error('Uncaught exception:', error));

client.login(token);
