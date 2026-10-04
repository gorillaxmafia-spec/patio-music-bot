require("dotenv").config();
const http=require("http"); const fs=require("fs"),path=require("path"); const {Client,GatewayIntentBits}=require("discord.js");
const TOKEN=process.env.DISCORD_TOKEN, CLIENT_ID=process.env.CLIENT_ID;
if(!TOKEN||!CLIENT_ID){console.error("Missing DISCORD_TOKEN or CLIENT_ID");process.exit(1);}
const PORT=Number(process.env.PORT||10000); const server=http.createServer((req,res)=>{res.writeHead(200,{"Content-Type":"text/plain"});res.end("OG APPAN GAME BOT is online");}); server.listen(PORT,"0.0.0.0",()=>console.log(`Web health server listening on 0.0.0.0:${PORT}`));
const client=new Client({intents:[GatewayIntentBits.Guilds]});
require("./events/ready")(client); require("./events/interactionCreate")(client);
(async()=>{try{await require("./deploy-commands"); await client.login(TOKEN);}catch(e){console.error(e);process.exit(1);}})();
