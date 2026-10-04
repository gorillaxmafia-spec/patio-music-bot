const { SlashCommandBuilder } = require("discord.js");
const { pause } = require("../music");

module.exports = {
  data: new SlashCommandBuilder().setName("pause").setDescription("Pause the music."),
  async execute(interaction) {
    if (pause(interaction.guildId))
      await interaction.reply("⏸️ Music paused.");
    else
      await interaction.reply("❌ Nothing is currently playing.");
  }
};
