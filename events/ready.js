const { Events } = require("discord.js");
const { GAME } = require("../config");

module.exports = (client) => {
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}`);
    console.log(`Guilds: ${readyClient.guilds.cache.size}`);
    readyClient.user.setActivity(`${GAME} | /help`);
  });
};
