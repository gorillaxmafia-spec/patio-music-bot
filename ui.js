const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder
} = require("discord.js");

function musicPanel(q) {
  const s = q.current;
  const embed = new EmbedBuilder()
    .setColor(0x6f3cff)
    .setAuthor({ name: "🔴  Now Playing" })
    .setDescription(s
      ? `• [${s.title}](${s.url})\n• Duration: **${s.duration || "Unknown"}**`
      : "• Nothing is playing")
    .setFooter({ text: s ? "Requested by the current player" : "PATIO MUSIC" });

  if (s?.thumbnail) embed.setThumbnail(s.thumbnail);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("music_pause").setLabel("Pause").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("music_skip").setLabel("Skip").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("music_shuffle").setLabel("Shuffle").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("music_stop").setLabel("Stop").setStyle(ButtonStyle.Danger)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("music_like").setLabel("Like").setStyle(ButtonStyle.Success)
  );
  return { embeds: [embed], components: [row, row2] };
}

module.exports = { musicPanel };
