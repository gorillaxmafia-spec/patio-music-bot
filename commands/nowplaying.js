const { SlashCommandBuilder } = require("discord.js");
const { getStatus } = require("../music");

module.exports = {
  data: new SlashCommandBuilder().setName("nowplaying").setDescription("Show the current song."),
  async execute(interaction) {
    const q = getStatus(interaction.guildId);
    if (!q.current) return interaction.reply("❌ Nothing is playing.");
    await interaction.reply(`🎧 **Now playing:** ${q.current.title}\n🔊 Volume: ${Math.round(q.volume * 100)}%\n🔁 Loop: ${q.loop ? "On" : "Off"}`);
  }
};
