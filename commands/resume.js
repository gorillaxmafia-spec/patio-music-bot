const { SlashCommandBuilder } = require("discord.js");
const { resume } = require("../music");

module.exports = {
  data: new SlashCommandBuilder().setName("resume").setDescription("Resume the music."),
  async execute(interaction) {
    if (resume(interaction.guildId))
      await interaction.reply("▶️ Music resumed.");
    else
      await interaction.reply("❌ Music is not paused.");
  }
};
