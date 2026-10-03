const { SlashCommandBuilder } = require("discord.js");
const { setVolume } = require("../music");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set music volume.")
    .addIntegerOption(o => o.setName("percent").setDescription("0-100").setMinValue(0).setMaxValue(100).setRequired(true)),
  async execute(interaction) {
    const v = setVolume(interaction.guildId, interaction.options.getInteger("percent"));
    await interaction.reply(`🔊 Volume set to **${v}%**.`);
  }
};
