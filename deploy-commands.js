import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('Set DISCORD_TOKEN and CLIENT_ID in .env');
  process.exit(1);
}

const commandFiles = [
  'play', 'skip', 'stop', 'pause', 'resume', 'queue', 'nowplaying',
  'volume', 'loop', 'shuffle', 'clear', 'join', 'leave', 'ping', 'help'
];

const commands = [];
for (const name of commandFiles) {
  const mod = await import(`./commands/${name}.js`);
  commands.push(mod.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

if (GUILD_ID) {
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log(`Registered ${commands.length} commands to guild ${GUILD_ID}.`);
} else {
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log(`Registered ${commands.length} global commands. Global commands can take time to appear.`);
}
