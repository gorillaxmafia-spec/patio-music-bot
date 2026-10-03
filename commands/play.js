const { SlashCommandBuilder } = require("discord.js");
const { addSong, getStatus } = require("../music");
const { musicPanel } = require("../ui");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or add it to the queue.")
    .addStringOption(o => o.setName("query").setDescription("YouTube URL or song name").setRequired(true)),
  async execute(interaction) {
    const vc = interaction.member?.voice?.channel;
    if (!vc) return interaction.reply({ content: "❌ Join a voice channel first.", ephemeral: true });
    await interaction.deferReply();
    try {
      const song = await addSong(interaction.guild, vc, interaction.channel, interaction.options.getString("query"));
      const q = getStatus(interaction.guildId);
      const panel = musicPanel(q);
      await interaction.editReply({
        content: `🎵 Added **${song.title}** to the queue.`,
        ...panel
      });
    } catch (e) {
      console.error(e);
      await interaction.editReply("❌ I couldn't load that song. Check the Render logs for the exact error.");
    }
  }
};
