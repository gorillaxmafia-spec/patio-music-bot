const { SlashCommandBuilder } = require("discord.js");
const { stop } = require("../music");

module.exports = {
  data: new SlashCommandBuilder().setName("stop").setDescription("Stop music, clear queue and leave VC."),
  async execute(interaction) {
    stop(interaction.guildId);
    await interaction.reply("⏹️ Stopped, cleared the queue and left the voice channel.");
  }
};
