import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
export const data = new SlashCommandBuilder().setName('stop').setDescription('Stop music and clear the queue');
export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue) return interaction.reply('❌ Nothing is playing.');
  queue.delete();
  return interaction.reply('⏹️ Stopped and cleared the queue.');
}
