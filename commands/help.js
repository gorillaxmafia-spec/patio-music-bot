const { SlashCommandBuilder } = require("discord.js");
const { GAME } = require("../config");
module.exports = { data: new SlashCommandBuilder().setName("help").setDescription("Show commands"), async execute(i) { return i.reply(`📖 **${GAME} Commands**\n**Economy** /balance /work /daily /give /deposit /withdraw\n**Games** /play /rob\n**Shop** /shop /buy\n**Profile** /profile /leaderboard\n**Other** /game /owner /help`); } };
