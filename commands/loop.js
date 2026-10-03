const { SlashCommandBuilder } = require("discord.js");
const { toggleLoop } = require("../music");

module.exports = {
  data: new SlashCommandBuilder().setName("loop").setDescription("Toggle song loop."),
  async execute(interaction) {
    const enabled = toggleLoop(interaction.guildId);
    await interaction.reply(`🔁 Loop **${enabled ? "enabled" : "disabled"}**.`);
  }
};
