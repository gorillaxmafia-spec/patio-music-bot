require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || "";
const OWNER_ID = "1445101801304227922";
const GAME_NAME = "OG APPAN";

if (!TOKEN || !CLIENT_ID) {
  console.error("Missing DISCORD_TOKEN or CLIENT_ID in Render Environment Variables.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("game")
    .setDescription("Show OG APPAN game information"),

  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Start a simple OG APPAN game round"),

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Show your OG APPAN profile"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show the OG APPAN leaderboard"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all OG APPAN commands"),

  new SlashCommandBuilder()
    .setName("owner")
    .setDescription("Show the OG APPAN owner"),

  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Owner-only game announcement")
    .addStringOption(o =>
      o.setName("message")
       .setDescription("Announcement text")
       .setRequired(true)
    )
].map(c => c.toJSON());

const profiles = new Map();

function getProfile(user) {
  if (!profiles.has(user.id)) {
    profiles.set(user.id, {
      id: user.id,
      name: user.username,
      coins: 100,
      wins: 0,
      games: 0
    });
  }
  return profiles.get(user.id);
}

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  if (GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Registered guild slash commands.");
  } else {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("Registered global slash commands.");
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity(`${GAME_NAME} | /help`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  if (command === "game") {
    const embed = new EmbedBuilder()
      .setTitle(`🎮 ${GAME_NAME}`)
      .setDescription("Welcome to the OG APPAN game bot!")
      .addFields(
        { name: "🎯 Play", value: "`/play`", inline: true },
        { name: "👤 Profile", value: "`/profile`", inline: true },
        { name: "🏆 Leaderboard", value: "`/leaderboard`", inline: true }
      )
      .setFooter({ text: `Owner ID: ${OWNER_ID}` });

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "play") {
    const p = getProfile(interaction.user);
    p.games++;

    const won = Math.random() < 0.5;
    const reward = won ? 50 : 0;

    if (won) {
      p.wins++;
      p.coins += reward;
    } else {
      p.coins = Math.max(0, p.coins - 10);
    }

    return interaction.reply(
      won
        ? `🎉 **${GAME_NAME}**\nYou won the round and earned **+${reward} coins**!\n💰 Balance: **${p.coins}**`
        : `😢 **${GAME_NAME}**\nYou lost this round and lost **10 coins**.\n💰 Balance: **${p.coins}**`
    );
  }

  if (command === "profile") {
    const p = getProfile(interaction.user);

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${interaction.user.username}'s ${GAME_NAME} Profile`)
      .addFields(
        { name: "💰 Coins", value: String(p.coins), inline: true },
        { name: "🏆 Wins", value: String(p.wins), inline: true },
        { name: "🎮 Games", value: String(p.games), inline: true }
      );

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "leaderboard") {
    const list = [...profiles.values()]
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 10);

    const description = list.length
      ? list.map((p, i) => `**${i + 1}.** <@${p.id}> — 💰 ${p.coins}`).join("\n")
      : "No players yet. Use `/play` to start!";

    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${GAME_NAME} Leaderboard`)
      .setDescription(description);

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "owner") {
    return interaction.reply(`👑 **${GAME_NAME} Owner:** <@${OWNER_ID}>`);
  }

  if (command === "help") {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🎮 ${GAME_NAME} — Commands`)
          .setDescription(
            "`/game` — Game information\n" +
            "`/play` — Play a round\n" +
            "`/profile` — Your profile\n" +
            "`/leaderboard` — Top players\n" +
            "`/owner` — Show owner\n" +
            "`/help` — Show commands\n" +
            "`/announce` — Owner announcement"
          )
      ]
    });
  }

  if (command === "announce") {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Only the OG APPAN owner can use this command.",
        ephemeral: true
      });
    }

    const message = interaction.options.getString("message", true);

    return interaction.reply({
      content: `📢 **${GAME_NAME} Announcement**\n${message}`,
      allowedMentions: { parse: [] }
    });
  }
});

(async () => {
  try {
    await registerCommands();
    await client.login(TOKEN);
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
})();
