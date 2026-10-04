const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { GAME } = require("../config");
module.exports = {
  data: new SlashCommandBuilder().setName("game").setDescription("OG APPAN game information"),
  async execute(i) { return i.reply({ embeds: [new EmbedBuilder().setTitle(`🎮 ${GAME}`).setDescription("A multiplayer economy & mini-game for Discord. Earn, fight the odds, collect items and climb the leaderboard.").addFields({name:"💰 Economy",value:"/work • /daily • /give • /deposit • /withdraw"},{name:"🎯 Games",value:"/play • /rob"},{name:"🛒 Progress",value:"/shop • /buy • /profile • /leaderboard"})] }); }
};
