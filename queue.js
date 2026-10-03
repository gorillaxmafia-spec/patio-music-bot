import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
export const data = new SlashCommandBuilder().setName('queue').setDescription('Show the music queue');
export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue) return interaction.reply('📭 The queue is empty.');
  const current = queue.currentTrack;
  const tracks = queue.tracks.toArray();
  const lines = tracks.slice(0, 10).map((t, i) => `${i + 1}. **${t.title}**`).join('\n') || 'No upcoming songs.';
  const embed = new EmbedBuilder().setTitle('🎵 PATIO MUSIC Queue').setDescription(`${current ? `▶️ **Now:** ${current.title}\n\n` : ''}${lines}`).setFooter({ text: tracks.length > 10 ? `Showing 10 of ${tracks.length}` : `${tracks.length} upcoming track(s)` });
  return interaction.reply({ embeds: [embed] });
}
