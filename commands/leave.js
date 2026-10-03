import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
export const data = new SlashCommandBuilder().setName('leave').setDescription('Leave the voice channel');
export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue) return interaction.reply('👋 I am not in a voice channel.');
  queue.delete();
  return interaction.reply('👋 Left the voice channel.');
}
