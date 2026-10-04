require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || "";

if (!TOKEN || !CLIENT_ID) {
  throw new Error("Missing DISCORD_TOKEN or CLIENT_ID");
}

const commandDir = path.join(__dirname, "commands");
const commands = [];

for (const file of fs.readdirSync(commandDir).filter((f) => f.endsWith(".js"))) {
  const command = require(path.join(commandDir, file));
  if (!command.data || typeof command.data.toJSON !== "function") {
    console.warn(`Skipping invalid command file: ${file}`);
    continue;
  }
  commands.push(command.data.toJSON());
}

module.exports = async function deployCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);

  console.log(
    `Registering ${commands.length} slash commands ${GUILD_ID ? `to guild ${GUILD_ID}` : "globally"}...`
  );
  await rest.put(route, { body: commands });
  console.log(`Commands registered successfully: ${commands.length}`);
};

if (require.main === module) {
  module.exports().catch((error) => {
    console.error("Command registration failed:", error);
    process.exit(1);
  });
}
