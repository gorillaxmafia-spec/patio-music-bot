const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder
} = require("discord.js");

function musicPanel(q) {
  const s = q.current;

  const embed = new EmbedBuilder()
    .setColor(0x6f3cff)
    .setAuthor({ name: "🎵 PATIO MUSIC • Now Playing" })
    .setDescription(
      s
        ? `**[${s.title}](${s.url})**\n\n⏱️ Duration: **${s.duration || "Unknown"}**\n🔊 Volume: **${Math.round(q.volume * 100)}%**\n🔁 Loop: **${q.loop ? "On" : "Off"}**`
        : "Nothing is playing right now."
    )
    .setFooter({ text: "Use the buttons below to control PATIO MUSIC" });

  if (s?.thumbnail) embed.setThumbnail(s.thumbnail);

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("music_pause")
      .setLabel("Pause")
      .setEmoji("⏸️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("music_resume")
      .setLabel("Resume")
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("music_skip")
      .setLabel("Skip")
      .setEmoji("⏭️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("music_stop")
      .setLabel("Stop")
      .setEmoji("⏹️")
      .setStyle(ButtonStyle.Danger)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("music_shuffle")
      .setLabel("Shuffle")
      .setEmoji("🔀")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("music_loop")
      .setLabel("Loop")
      .setEmoji("🔁")
      .setStyle(q.loop ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("music_queue")
      .setLabel("Queue")
      .setEmoji("📜")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("music_like")
      .setLabel("Like")
      .setEmoji("❤️")
      .setStyle(ButtonStyle.Secondary)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("music_volume_down")
      .setLabel("Vol −")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("music_volume_up")
      .setLabel("Vol +")
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2, row3] };
}

module.exports = { musicPanel };
