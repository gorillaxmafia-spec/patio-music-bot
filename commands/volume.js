import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
export const data = new SlashCommandBuilder().setName('volume').setDescription('Set music volume (1-100)').addIntegerOption(o => o.setName('amount').setDescription('Volume').setMinValue(1).setMaxValue(100).setRequired(true));
export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue) return interaction.reply('❌ Nothing is playing.');
  const amount = interaction.options.getInteger('amount', true);
  queue.node.setVolume(amount);
  return interaction.reply(`🔊 Volume set to **${amount}%**.`);
}
