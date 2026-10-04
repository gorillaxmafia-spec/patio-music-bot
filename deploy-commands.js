require("dotenv").config();
const fs=require("fs"),path=require("path"); const {REST,Routes}=require("discord.js");
const TOKEN=process.env.DISCORD_TOKEN, CLIENT_ID=process.env.CLIENT_ID, GUILD_ID=process.env.GUILD_ID||"";
if(!TOKEN||!CLIENT_ID){console.error("Missing DISCORD_TOKEN or CLIENT_ID");process.exit(1);}
const commands=[]; for(const file of fs.readdirSync(path.join(__dirname,"commands")).filter(f=>f.endsWith(".js"))){commands.push(require(path.join(__dirname,"commands",file)).data.toJSON());}
(async()=>{const rest=new REST({version:"10"}).setToken(TOKEN);const route=GUILD_ID?Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID):Routes.applicationCommands(CLIENT_ID);await rest.put(route,{body:commands});console.log(`Commands registered: ${commands.length}`);})().catch(e=>{console.error(e);process.exit(1);});
