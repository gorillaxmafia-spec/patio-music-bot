import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
export const data = new SlashCommandBuilder().setName('skip').setDescription('Skip the current song');
export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue?.isPlaying()) return interaction.reply('❌ Nothing is playing.');
  queue.node.skip();
  return interaction.reply('⏭️ Skipped.');
}
