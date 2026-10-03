import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
export const data = new SlashCommandBuilder().setName('help').setDescription('Show PATIO MUSIC commands');
export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🎵 PATIO MUSIC')
    .setDescription('Music bot commands')
    .addFields(
      { name: 'Music', value: '`/play` `/skip` `/stop` `/pause` `/resume` `/nowplaying`' },
      { name: 'Queue', value: '`/queue` `/clear` `/shuffle` `/loop`' },
      { name: 'Controls', value: '`/volume` `/join` `/leave`' },
      { name: 'Utility', value: '`/ping` `/help`' },
    )
    .setFooter({ text: 'PATIO MUSIC • Node.js + Discord Player' });
  return interaction.reply({ embeds: [embed] });
}
