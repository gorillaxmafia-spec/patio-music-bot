import { SlashCommandBuilder } from 'discord.js';
export const data = new SlashCommandBuilder().setName('join').setDescription('Join your voice channel');
export async function execute(interaction, player) {
  const channel = interaction.member?.voice?.channel;
  if (!channel) return interaction.reply('❌ Join a voice channel first.');
  try {
    await player.nodes.create(interaction.guild, { metadata: interaction.channel, selfDeaf: true });
    await interaction.reply(`🔊 Joined **${channel.name}**. Use /play to start music.`);
  } catch (e) {
    await interaction.reply(`❌ Could not join: ${e.message}`);
  }
}
