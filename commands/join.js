const { SlashCommandBuilder } = require("discord.js");
const { addSong } = require("../music");

module.exports = {
  data: new SlashCommandBuilder().setName("join").setDescription("Join your current voice channel."),
  async execute(interaction) {
    const vc = interaction.member?.voice?.channel;
    if (!vc) return interaction.reply({ content: "❌ Join a voice channel first.", ephemeral: true });
    try {
      // Adding an invisible no-op isn't appropriate; play module handles the actual connection.
      // Tell the user to use /play, which joins and connects automatically.
      await interaction.reply("🔊 Use `/play` and I will automatically join your voice channel.");
    } catch {
      await interaction.reply("❌ Could not join.");
    }
  }
};
