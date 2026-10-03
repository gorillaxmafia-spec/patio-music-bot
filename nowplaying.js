import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
export const data = new SlashCommandBuilder().setName('nowplaying').setDescription('Show the current song');
export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  const track = queue?.currentTrack;
  if (!track) return interaction.reply('❌ Nothing is playing.');
  return interaction.reply(`🎶 Now playing: **${track.title}**\n🔗 ${track.url || 'No URL'}`);
}
