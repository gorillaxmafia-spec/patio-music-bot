const { SlashCommandBuilder } = require("discord.js");
const { GAME, OWNER_ID } = require("../config");
module.exports = { data: new SlashCommandBuilder().setName("owner").setDescription("Show OG APPAN owner"), async execute(i) { return i.reply(`👑 **${GAME} Owner:** <@${OWNER_ID}>`); } };
