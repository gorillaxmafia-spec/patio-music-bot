const { SlashCommandBuilder } = require("discord.js");
const { getStatus } = require("../music");
const { musicPanel } = require("../ui");

module.exports = {
  data: new SlashCommandBuilder().setName("panel").setDescription("Send the Now Playing control panel."),
  async execute(interaction) {
    await interaction.reply(musicPanel(getStatus(interaction.guildId)));
  }
};
