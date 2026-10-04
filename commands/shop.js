const { SlashCommandBuilder }=require("discord.js");
module.exports={data:new SlashCommandBuilder().setName("shop").setDescription("View the OG APPAN shop"),async execute(i){return i.reply("🛒 **OG APPAN SHOP**\n`lucky_charm` — 500 coins\n`vip_badge` — 2,000 coins\n`pet_egg` — 5,000 coins\nUse `/buy item:<item>`. ");}};
