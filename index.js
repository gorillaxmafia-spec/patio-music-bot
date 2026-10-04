require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const TOKEN=process.env.DISCORD_TOKEN;
const CLIENT_ID=process.env.CLIENT_ID;
const GUILD_ID=process.env.GUILD_ID||"";
const OWNER_ID="1445101801304227922";
const GAME="OG APPAN";

if(!TOKEN||!CLIENT_ID){console.error("Missing DISCORD_TOKEN or CLIENT_ID");process.exit(1);}

const client=new Client({intents:[GatewayIntentBits.Guilds]});
const db=new Map();

function profile(id,name){
  if(!db.has(id)) db.set(id,{id,name,coins:500,bank:0,level:1,xp:0,wins:0,losses:0,inventory:[]});
  return db.get(id);
}
function money(n){return Math.floor(n).toLocaleString();}
function xpFor(l){return l*100;}

const commands=[
 new SlashCommandBuilder().setName("game").setDescription("OG APPAN game information"),
 new SlashCommandBuilder().setName("play").setDescription("Play a random OG APPAN round"),
 new SlashCommandBuilder().setName("daily").setDescription("Claim your daily reward"),
 new SlashCommandBuilder().setName("profile").setDescription("View your game profile"),
 new SlashCommandBuilder().setName("balance").setDescription("View your wallet and bank"),
 new SlashCommandBuilder().setName("give").setDescription("Give coins to another player")
   .addUserOption(o=>o.setName("user").setDescription("Player to receive coins").setRequired(true))
   .addIntegerOption(o=>o.setName("amount").setDescription("Amount of coins").setMinValue(1).setRequired(true)),
 new SlashCommandBuilder().setName("deposit").setDescription("Deposit coins into your bank")
   .addIntegerOption(o=>o.setName("amount").setDescription("Amount").setMinValue(1).setRequired(true)),
 new SlashCommandBuilder().setName("withdraw").setDescription("Withdraw coins from your bank")
   .addIntegerOption(o=>o.setName("amount").setDescription("Amount").setMinValue(1).setRequired(true)),
 new SlashCommandBuilder().setName("work").setDescription("Work to earn coins"),
 new SlashCommandBuilder().setName("rob").setDescription("Try to rob another player")
   .addUserOption(o=>o.setName("user").setDescription("Target player").setRequired(true)),
 new SlashCommandBuilder().setName("shop").setDescription("View the OG APPAN shop"),
 new SlashCommandBuilder().setName("buy").setDescription("Buy an item")
   .addStringOption(o=>o.setName("item").setDescription("Item name").setRequired(true)
     .addChoices({name:"Lucky Charm - 500",value:"lucky_charm"},{name:"VIP Badge - 2000",value:"vip_badge"},{name:"Pet Egg - 5000",value:"pet_egg"})),
 new SlashCommandBuilder().setName("leaderboard").setDescription("View top players"),
 new SlashCommandBuilder().setName("help").setDescription("Show commands"),
 new SlashCommandBuilder().setName("owner").setDescription("Show OG APPAN owner"),
 new SlashCommandBuilder().setName("announce").setDescription("Owner-only announcement")
   .addStringOption(o=>o.setName("message").setDescription("Announcement").setRequired(true))
].map(x=>x.toJSON());

async function register(){
 const rest=new REST({version:"10"}).setToken(TOKEN);
 const route=GUILD_ID?Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID):Routes.applicationCommands(CLIENT_ID);
 await rest.put(route,{body:commands});
 console.log("Commands registered");
}

client.once("clientReady",()=>{console.log(`Logged in as ${client.user.tag}`);client.user.setActivity(`${GAME} | /help`);});

client.on("interactionCreate",async i=>{
 if(!i.isChatInputCommand()) return;
 const p=profile(i.user.id,i.user.username);
 const c=i.commandName;

 if(c==="game") return i.reply({embeds:[new EmbedBuilder().setTitle(`🎮 ${GAME}`).setDescription("A multiplayer economy & mini-game for Discord. Earn, fight the odds, collect items and climb the leaderboard.").addFields({name:"💰 Economy",value:"/work • /daily • /give • /deposit • /withdraw",inline:false},{name:"🎯 Games",value:"/play • /rob",inline:false},{name:"🛒 Progress",value:"/shop • /buy • /profile • /leaderboard",inline:false})]});
 if(c==="help") return i.reply({embeds:[new EmbedBuilder().setTitle(`📖 ${GAME} Commands`).setDescription([
   "**Economy** `/balance` `/work` `/daily` `/give` `/deposit` `/withdraw`",
   "**Games** `/play` `/rob`",
   "**Shop** `/shop` `/buy`",
   "**Profile** `/profile` `/leaderboard`",
   "**Other** `/game` `/owner` `/help`"
 ].join("\n"))]});
 if(c==="owner") return i.reply(`👑 **${GAME} Owner:** <@${OWNER_ID}>`);

 if(c==="profile"){
   return i.reply({embeds:[new EmbedBuilder().setTitle(`👤 ${i.user.username} • ${GAME}`).addFields(
    {name:"💰 Wallet",value:money(p.coins),inline:true},{name:"🏦 Bank",value:money(p.bank),inline:true},
    {name:"⭐ Level",value:String(p.level),inline:true},{name:"✨ XP",value:`${p.xp}/${xpFor(p.level)}`,inline:true},
    {name:"🏆 Wins",value:String(p.wins),inline:true},{name:"💀 Losses",value:String(p.losses),inline:true},
    {name:"🎒 Inventory",value:p.inventory.length?p.inventory.join(", "):"Empty",inline:false}
   )]});
 }
 if(c==="balance") return i.reply(`💰 Wallet: **${money(p.coins)}**\n🏦 Bank: **${money(p.bank)}**`);

 if(c==="give"){
   const u=i.options.getUser("user",true), amount=i.options.getInteger("amount",true);
   if(u.bot||u.id===i.user.id) return i.reply({content:"❌ Choose another real player.",ephemeral:true});
   if(p.coins<amount) return i.reply({content:"❌ You don't have enough wallet coins.",ephemeral:true});
   const r=profile(u.id,u.username); p.coins-=amount; r.coins+=amount;
   return i.reply(`💸 <@${i.user.id}> gave **${money(amount)} coins** to <@${u.id}>!`);
 }
 if(c==="deposit"){
   const a=i.options.getInteger("amount",true); if(p.coins<a)return i.reply({content:"❌ Not enough wallet coins.",ephemeral:true});
   p.coins-=a;p.bank+=a;return i.reply(`🏦 Deposited **${money(a)} coins**. Bank: **${money(p.bank)}**`);
 }
 if(c==="withdraw"){
   const a=i.options.getInteger("amount",true); if(p.bank<a)return i.reply({content:"❌ Not enough bank coins.",ephemeral:true});
   p.bank-=a;p.coins+=a;return i.reply(`🏦 Withdrawn **${money(a)} coins**. Wallet: **${money(p.coins)}**`);
 }
 if(c==="work"){
   const jobs=[["👨‍💻 Developer",100,180],["🍔 Chef",80,160],["🚗 Driver",90,170],["🛠️ Mechanic",110,200]];
   const j=jobs[Math.floor(Math.random()*jobs.length)], earn=j[1]+Math.floor(Math.random()*(j[2]-j[1]+1));
   p.coins+=earn;p.xp+=25;
   if(p.xp>=xpFor(p.level)){p.xp-=xpFor(p.level);p.level++;}
   return i.reply(`${j[0]} You worked as **${j[0].replace(/^[^ ]+ /,"")}** and earned **${money(earn)} coins**. ⭐ Level ${p.level}`);
 }
 if(c==="daily"){
   const now=Date.now(), last=p.lastDaily||0;
   if(now-last<86400000){const h=Math.ceil((86400000-(now-last))/3600000);return i.reply({content:`⏳ Daily reward is available in about **${h}h**.`,ephemeral:true});}
   const a=500+p.level*100;p.coins+=a;p.lastDaily=now;return i.reply(`🎁 Daily reward: **+${money(a)} coins**!`);
 }
 if(c==="play"){
   const win=Math.random()<0.5, a=win?200:50;
   if(win){p.coins+=a;p.wins++;p.xp+=40;return i.reply(`🎉 You won **${money(a)} coins**! 💰 ${money(p.coins)}`);}
   p.coins=Math.max(0,p.coins-a);p.losses++;return i.reply(`😢 You lost **${money(a)} coins**. 💰 ${money(p.coins)}`);
 }
 if(c==="rob"){
   const u=i.options.getUser("user",true); if(u.bot||u.id===i.user.id)return i.reply({content:"❌ Invalid target.",ephemeral:true});
   const r=profile(u.id,u.username);
   if(r.coins<50)return i.reply("❌ That player has too few wallet coins to rob.");
   if(Math.random()<0.4){const a=Math.min(r.coins,100+Math.floor(Math.random()*300));r.coins-=a;p.coins+=a;p.wins++;return i.reply(`🦹 Successful robbery! You stole **${money(a)} coins** from <@${u.id}>.`);}
   const fine=100;p.coins=Math.max(0,p.coins-fine);p.losses++;return i.reply(`🚨 Robbery failed! You paid a **${fine} coin** fine.`);
 }
 if(c==="shop") return i.reply("🛒 **OG APPAN SHOP**\n`lucky_charm` — 500 coins\n`vip_badge` — 2,000 coins\n`pet_egg` — 5,000 coins\nUse `/buy item:<item>`.");
 if(c==="buy"){
   const item=i.options.getString("item",true);
   const prices={lucky_charm:500,vip_badge:2000,pet_egg:5000};
   if(p.coins<prices[item])return i.reply({content:"❌ Not enough coins.",ephemeral:true});
   p.coins-=prices[item];p.inventory.push(item);return i.reply(`🛒 Purchased **${item}** for **${money(prices[item])} coins**!`);
 }
 if(c==="leaderboard"){
   const arr=[...db.values()].sort((a,b)=>(b.coins+b.bank)-(a.coins+a.bank)).slice(0,10);
   return i.reply(`🏆 **${GAME} Leaderboard**\n${arr.length?arr.map((x,n)=>`**${n+1}.** <@${x.id}> — 💰 ${money(x.coins+x.bank)}`).join("\n"):"No players yet."}`);
 }
 if(c==="announce"){
   if(i.user.id!==OWNER_ID)return i.reply({content:"❌ Owner only.",ephemeral:true});
   return i.reply(`📢 **${GAME} Announcement**\n${i.options.getString("message",true)}`);
 }
});

(async()=>{try{await register();await client.login(TOKEN);}catch(e){console.error(e);process.exit(1);}})();
