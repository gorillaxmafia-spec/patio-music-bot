const { SlashCommandBuilder } = require("discord.js");
const { getStatus } = require("../music");

module.exports = {
  data: new SlashCommandBuilder().setName("queue").setDescription("Show the music queue."),
  async execute(interaction) {
    const q = getStatus(interaction.guildId);
    if (!q.songs.length) return interaction.reply("📭 The queue is empty.");

    const list = q.songs.slice(0, 10).map((s, i) =>
      `${i === 0 ? "▶️" : `${i}.`} ${s.title}`
    ).join("\n");

    const more = q.songs.length > 10 ? `\n...and ${q.songs.length - 10} more.` : "";
    await interaction.reply(`🎶 **Queue**\n${list}${more}`);
  }
};
