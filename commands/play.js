import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song or add it to the queue')
  .addStringOption(o => o.setName('query').setDescription('Song name or supported URL').setRequired(true));

export async function execute(interaction, player) {
  const channel = interaction.member?.voice?.channel;
  if (!channel) return interaction.reply('❌ Join a voice channel first.');

  const query = interaction.options.getString('query', true);
  await interaction.deferReply();

  try {
    const { track, searchResult } = await player.play(channel, query, {
      nodeOptions: {
        metadata: interaction.channel,
        leaveOnStop: true,
        leaveOnStopCooldown: 5000,
        leaveOnEnd: true,
        leaveOnEndCooldown: 15000,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 300000,
        skipOnNoStream: true,
      },
      requestedBy: interaction.user,
    });

    const count = searchResult?.tracks?.length || 1;
    await interaction.editReply(`🎵 Added **${track.title}**${count > 1 ? ` and ${count - 1} more track(s)` : ''} to the queue.`);
  } catch (error) {
    await interaction.editReply(`❌ I couldn't play that. Try a SoundCloud link/search, or a Spotify link.\n\`${error.message}\``);
  }
}
