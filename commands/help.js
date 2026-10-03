const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Show music commands."),
  async execute(interaction) {
    await interaction.reply(
      "🎵 **PATIO MUSIC COMMANDS**\n" +
      "`/play <song>` — Play/add song\n" +
      "`/pause` — Pause\n" +
      "`/resume` — Resume\n" +
      "`/skip` — Skip\n" +
      "`/stop` — Stop + leave VC\n" +
      "`/queue` — Show queue\n" +
      "`/nowplaying` — Current song\n" +
      "`/volume <0-100>` — Volume\n" +
      "`/loop` — Toggle loop\n" +
      "`/join` — Voice help\n" +
      "`/ping` — Bot latency"
    );
  }
};
