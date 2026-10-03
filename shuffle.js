import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
export const data = new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the queue');
export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue) return interaction.reply('❌ Queue is empty.');
  queue.tracks.shuffle();
  return interaction.reply('🔀 Queue shuffled.');
}
