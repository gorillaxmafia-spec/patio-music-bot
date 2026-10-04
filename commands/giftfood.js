const { SlashCommandBuilder } = require("discord.js");
const { profile } = require("../utils/profile");
const { ITEMS } = require("../utils/items");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giftfood")
    .setDescription("Give Kerala food from your inventory to another player")
    .addUserOption(o => o.setName("user").setDescription("Player to receive the food").setRequired(true))
    .addStringOption(o => o.setName("item").setDescription("Food to give").setRequired(true).addChoices(
      { name: "🍛 Kerala Biriyani", value: "biriyani" },
      { name: "🍌 Pazhampori", value: "pazhampori" },
      { name: "🥩 Porotta + Beef", value: "porotta_beef" },
      { name: "🍚 Puttu + Kadala", value: "puttu_kadala" },
      { name: "🥞 Appam + Stew", value: "appam_stew" },
      { name: "🍜 Idiyappam", value: "idiyappam" },
      { name: "🍃 Kerala Sadya", value: "kerala_sadya" },
      { name: "🐟 Fish Curry Meals", value: "fish_curry_meals" },
      { name: "🍠 Kappa + Beef", value: "kappa_beef" },
      { name: "🍗 Chicken 65", value: "chicken_65" },
      { name: "🧁 Unniyappam", value: "unniyappam" },
      { name: "☕ Sulaimani Tea", value: "sulaimani" },
      { name: "🍚 Neychoru + Beef", value: "neychoru_beef" },
      { name: "🥞 Kallappam", value: "kallappam" },
      { name: "🐟 Kerala Fish Fry", value: "fish_fry" },
      { name: "🍌 Banana Chips", value: "banana_chips" },
      { name: "🍗 Chicken Mandi", value: "mandi" },
      { name: "🍗 Alfham Mandi", value: "alfham_mandi" },
      { name: "🌶️ Peri Peri Mandi", value: "peri_peri_mandi" },
      { name: "🥩 Beef Mandi", value: "beef_mandi" },
      { name: "🍖 Mutton Mandi", value: "mutton_mandi" },
      { name: "🐟 Fish Mandi", value: "fish_mandi" },
      { name: "🔥 BBQ Chicken Mandi", value: "bbq_chicken_mandi" },
      { name: "🌶️ Spicy Chicken Mandi", value: "spicy_chicken_mandi" }
    ))
    .addIntegerOption(o => o.setName("quantity").setDescription("How many to give").setMinValue(1).setMaxValue(20).setRequired(true)),

  async execute(i) {
    const sender = profile(i.user.id, i.user.username);
    const receiverUser = i.options.getUser("user", true);
    const item = i.options.getString("item", true);
    const quantity = i.options.getInteger("quantity", true);
    const product = ITEMS[item];

    if (!product || !["Kerala Food", "Mandi"].includes(product.category)) {
      return i.reply({ content: "❌ That is not a Kerala food item.", ephemeral: true });
    }
    if (receiverUser.bot || receiverUser.id === i.user.id) {
      return i.reply({ content: "❌ Choose another real player.", ephemeral: true });
    }

    const owned = sender.inventory.filter(x => x === item).length;
    if (owned < quantity) {
      return i.reply({
        content: `❌ You only have **${owned}** ${product.emoji} **${product.name}** in your inventory.`,
        ephemeral: true
      });
    }

    for (let n = 0; n < quantity; n++) {
      const index = sender.inventory.indexOf(item);
      if (index !== -1) sender.inventory.splice(index, 1);
    }

    const receiver = profile(receiverUser.id, receiverUser.username);
    for (let n = 0; n < quantity; n++) receiver.inventory.push(item);

    return i.reply(
      `${product.emoji} <@${i.user.id}> gave **${quantity}x ${product.name}** to <@${receiverUser.id}>! ❤️`
    );
  }
};
