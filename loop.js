import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
export const data = new SlashCommandBuilder().setName('loop').setDescription('Change loop mode').addStringOption(o => o.setName('mode').setDescription('Loop mode').setRequired(true).addChoices({ name: 'Off', value: 'off' }, { name: 'Song', value: 'song' }, { name: 'Queue', value: 'queue' }));
export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue) return interaction.reply('❌ Nothing is playing.');
  const mode = interaction.options.getString('mode', true);
  const value = mode === 'off' ? 0 : mode === 'song' ? 1 : 2;
  queue.setRepeatMode(value);
  return interaction.reply(`🔁 Loop: **${mode}**.`);
}
