import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
export const data = new SlashCommandBuilder().setName('clear').setDescription('Clear upcoming songs without stopping the current song');
export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue) return interaction.reply('📭 Queue is empty.');
  queue.tracks.clear();
  return interaction.reply('🧹 Upcoming queue cleared.');
}
