const {GAME}=require("../config");
module.exports=(client)=>{client.once("ready",()=>{console.log(`Logged in as ${client.user.tag}`);client.user.setActivity(`${GAME} | /help`);});};
