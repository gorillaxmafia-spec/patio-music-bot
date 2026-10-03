import { SlashCommandBuilder } from 'discord.js';
import { useTimeline } from 'discord-player';
export const data = new SlashCommandBuilder().setName('resume').setDescription('Resume the current song');
export async function execute(interaction) {
  const timeline = useTimeline(interaction.guildId);
  if (!timeline) return interaction.reply('❌ Nothing is playing.');
  if (!timeline.paused) return interaction.reply('▶️ Already playing.');
  timeline.resume();
  return interaction.reply('▶️ Resumed.');
}
