const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { ITEMS } = require("../utils/items");

module.exports = {
  data: new SlashCommandBuilder().setName("shop").setDescription("View the OG APPAN shop"),

  async execute(i) {
    const foods = Object.entries(ITEMS).filter(([, item]) => item.category === "Kerala Food");
    const mandi = Object.entries(ITEMS).filter(([, item]) => item.category === "Mandi");
    const special = Object.entries(ITEMS).filter(([, item]) => item.category === "Special");

    const list = arr => arr.map(([id, item]) =>
      `${item.emoji} **${item.name}** — 🪙 ${item.price.toLocaleString()}\n\`/buy item:${id}\``
    ).join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("🛒 OG APPAN FOOD SHOP")
      .setDescription("🍽️ Kerala foods + special Mandi varieties. Buy them and gift them to other players!")
      .addFields(
        { name: "🍛 Kerala Foods", value: list(foods) },
        { name: "🍗 Mandi Special", value: list(mandi) },
        { name: "🎁 Special Items", value: list(special) }
      )
      .setColor(0x2ecc71)
      .setFooter({ text: "Use /giftfood to give food to another player" });

    return i.reply({ embeds: [embed] });
  }
};
