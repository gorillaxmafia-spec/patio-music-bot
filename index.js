require("dotenv").config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});
client.commands = new Collection();

for (const file of fs.readdirSync(path.join(__dirname, "commands")).filter(f => f.endsWith(".js"))) {
  const command = require(path.join(__dirname, "commands", file));
  client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} is online`);
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  const body = [...client.commands.values()].map(c => c.data.toJSON());
  try {
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);
    await rest.put(route, { body });
    console.log("✅ Slash commands registered");
  } catch (e) { console.error("Command registration error:", e); }
});

client.on("interactionCreate", async interaction => {
  if (interaction.isButton()) {
    const music = require("./music");
    const id = interaction.customId;
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: "❌ Join a voice channel first.", ephemeral: true });
    }
    try {
      if (id === "music_pause")
        return interaction.reply({ content: music.pause(interaction.guildId) ? "⏸️ Paused." : "❌ Nothing is playing.", ephemeral: true });
      if (id === "music_resume")
        return interaction.reply({ content: music.resume(interaction.guildId) ? "▶️ Resumed." : "❌ Music is not paused.", ephemeral: true });
      if (id === "music_skip")
        return interaction.reply({ content: music.skip(interaction.guildId) ? "⏭️ Skipped." : "❌ Nothing is playing.", ephemeral: true });
      if (id === "music_shuffle")
        return interaction.reply({ content: music.shuffle(interaction.guildId) ? "🔀 Queue shuffled." : "❌ Add at least 2 songs to shuffle.", ephemeral: true });
      if (id === "music_stop") {
        music.stop(interaction.guildId);
        return interaction.reply({ content: "⏹️ Stopped and left the voice channel.", ephemeral: true });
      }
      if (id === "music_like")
        return interaction.reply({ content: "❤️ Added to your likes.", ephemeral: true });
      if (id === "music_loop")
        return interaction.reply({ content: `🔁 Loop ${music.toggleLoop(interaction.guildId) ? "enabled" : "disabled"}.`, ephemeral: true });
      if (id === "music_queue") {
        const q = music.getStatus(interaction.guildId);
        if (!q.songs.length) return interaction.reply({ content: "📭 Queue is empty.", ephemeral: true });
        const list = q.songs.slice(0, 10).map((s,i) => `${i === 0 ? "▶️" : `${i}.`} ${s.title}`).join("\n");
        return interaction.reply({ content: `🎶 **Queue**\n${list}`, ephemeral: true });
      }
      if (id === "music_volume_down" || id === "music_volume_up") {
        const q = music.getStatus(interaction.guildId);
        const now = Math.round(q.volume * 100);
        const next = id === "music_volume_up" ? Math.min(100, now + 10) : Math.max(0, now - 10);
        return interaction.reply({ content: `🔊 Volume: **${music.setVolume(interaction.guildId, next)}%**`, ephemeral: true });
      }
    } catch (e) {
      console.error("Button error:", e);
      return interaction.reply({ content: "❌ Button action failed.", ephemeral: true }).catch(() => {});
    }
  }

  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (e) {
    console.error(e);
    const msg = "❌ Command failed.";
    if (interaction.replied || interaction.deferred)
      await interaction.followUp({ content: msg, ephemeral: true }).catch(() => {});
    else
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
  }
});

client.login(process.env.DISCORD_TOKEN);
