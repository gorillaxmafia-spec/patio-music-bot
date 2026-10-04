const { SlashCommandBuilder } = require("discord.js");
const { profile, money } = require("../utils/profile");
const { ITEMS } = require("../utils/items");

const choices = [
  ["Lucky Charm - 500","lucky_charm"],["VIP Badge - 2000","vip_badge"],["Pet Egg - 5000","pet_egg"],
  ["Kerala Biriyani - 650","biriyani"],["Pazhampori - 180","pazhampori"],["Porotta + Beef - 550","porotta_beef"],
  ["Puttu + Kadala - 400","puttu_kadala"],["Appam + Stew - 450","appam_stew"],["Idiyappam - 350","idiyappam"],
  ["Kerala Sadya - 900","kerala_sadya"],["Fish Curry Meals - 700","fish_curry_meals"],["Kappa + Beef - 600","kappa_beef"],
  ["Chicken 65 - 500","chicken_65"],["Unniyappam - 220","unniyappam"],["Sulaimani Tea - 120","sulaimani"],
  ["Neychoru + Beef - 650","neychoru_beef"],["Kallappam - 300","kallappam"],["Kerala Fish Fry - 480","fish_fry"],
  ["Banana Chips - 160","banana_chips"],["Chicken Mandi - 850","mandi"],["Alfham Mandi - 950","alfham_mandi"],
  ["Peri Peri Mandi - 1050","peri_peri_mandi"],["Beef Mandi - 1000","beef_mandi"],["Mutton Mandi - 1200","mutton_mandi"],
  ["Fish Mandi - 1100","fish_mandi"]
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy").setDescription("Buy an item or food")
    .addStringOption(o => o.setName("item").setDescription("Choose an item").setRequired(true)
      .addChoices(...choices.map(([name,value]) => ({name,value})))),

  async execute(i) {
    const p = profile(i.user.id, i.user.username);
    const item = i.options.getString("item", true);
    const product = ITEMS[item];
    if (!product) return i.reply({content:"❌ Item not found.",ephemeral:true});
    if (p.coins < product.price)
      return i.reply({content:`❌ You need **${money(product.price)} coins** for ${product.emoji} **${product.name}**.`,ephemeral:true});
    p.coins -= product.price;
    p.inventory.push(item);
    return i.reply(`🛒 Bought ${product.emoji} **${product.name}** for **${money(product.price)} coins**!`);
  }
};
