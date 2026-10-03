import { SlashCommandBuilder } from 'discord.js';
export const data = new SlashCommandBuilder().setName('ping').setDescription('Show bot latency');
export async function execute(interaction) {
  return interaction.reply(`🏓 Pong! **${interaction.client.ws.ping}ms**`);
}
