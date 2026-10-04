const { SlashCommandBuilder } = require("discord.js");
const { skip } = require("../music");

module.exports = {
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip the current song."),
  async execute(interaction) {
    if (skip(interaction.guildId))
      await interaction.reply("⏭️ Skipped.");
    else
      await interaction.reply("❌ Nothing is playing.");
  }
};
