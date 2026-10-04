const { SlashCommandBuilder }=require("discord.js"); const {profile,money}=require("../utils/profile");
module.exports={data:new SlashCommandBuilder().setName("balance").setDescription("View your wallet and bank"),async execute(i){const p=profile(i.user.id,i.user.username);return i.reply(`💰 Wallet: **${money(p.coins)}**\n🏦 Bank: **${money(p.bank)}**`);}};
