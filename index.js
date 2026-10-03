require("dotenv").config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { musicPanel } = require("./ui");
const express = require("express");
const { generateDependencyReport } = require("@discordjs/voice");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});
client.commands = new Collection();

for (const file of fs.readdirSync(path.join(__dirname, "commands")).filter(f => f.endsWith(".js"))) {
  const command = require(path.join(__dirname, "commands", file));
  client.commands.set(command.data.name, command);
}

client.once("clientReady", async () => {
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
      return interaction.reply({
        content: "❌ Join a voice channel first.",
        ephemeral: true
      });
    }

    try {
      if (id === "music_pause") {
        const ok = music.pause(interaction.guildId);
        if (!ok) return interaction.reply({ content: "❌ Nothing is playing.", ephemeral: true });
        await interaction.reply({ content: "⏸️ Paused.", ephemeral: true });
      } else if (id === "music_resume") {
        const ok = music.resume(interaction.guildId);
        if (!ok) return interaction.reply({ content: "❌ Music is not paused.", ephemeral: true });
        await interaction.reply({ content: "▶️ Resumed.", ephemeral: true });
      } else if (id === "music_skip") {
        const ok = music.skip(interaction.guildId);
        if (!ok) return interaction.reply({ content: "❌ Nothing is playing.", ephemeral: true });
        await interaction.reply({ content: "⏭️ Skipped.", ephemeral: true });
      } else if (id === "music_shuffle") {
        const ok = music.shuffle(interaction.guildId);
        await interaction.reply({
          content: ok ? "🔀 Queue shuffled." : "❌ Add at least 2 songs to shuffle.",
          ephemeral: true
        });
      } else if (id === "music_stop") {
        music.stop(interaction.guildId);
        await interaction.reply({ content: "⏹️ Stopped and left the voice channel.", ephemeral: true });
      } else if (id === "music_like") {
        await interaction.reply({ content: "❤️ Added to your likes.", ephemeral: true });
      } else if (id === "music_loop") {
        const enabled = music.toggleLoop(interaction.guildId);
        await interaction.reply({
          content: `🔁 Loop ${enabled ? "enabled" : "disabled"}.`,
          ephemeral: true
        });
      } else if (id === "music_queue") {
        const q = music.getStatus(interaction.guildId);
        if (!q.songs.length) return interaction.reply({ content: "📭 Queue is empty.", ephemeral: true });
        const list = q.songs.slice(0, 10)
          .map((song, i) => `${i === 0 ? "▶️" : `${i}.`} ${song.title}`)
          .join("\n");
        await interaction.reply({ content: `🎶 **Queue**\n${list}`, ephemeral: true });
      } else if (id === "music_volume_down" || id === "music_volume_up") {
        const q = music.getStatus(interaction.guildId);
        const now = Math.round(q.volume * 100);
        const next = id === "music_volume_up"
          ? Math.min(100, now + 10)
          : Math.max(0, now - 10);
        const value = music.setVolume(interaction.guildId, next);
        await interaction.reply({ content: `🔊 Volume: **${value}%**`, ephemeral: true });
      } else {
        return;
      }

      // If this button came from a normal message, update the control panel.
      // Ephemeral confirmations remain visible only to the clicker.
      const channel = interaction.channel;
      if (channel?.isTextBased()) {
        const messages = await channel.messages.fetch({ limit: 10 }).catch(() => null);
        const panelMessage = messages?.find(m =>
          m.author?.id === interaction.client.user.id &&
          m.components?.some(row => row.components?.some(c => c.customId === "music_pause"))
        );
        if (panelMessage) {
          await panelMessage.edit(musicPanel(music.getStatus(interaction.guildId))).catch(() => {});
        }
      }
    } catch (e) {
      console.error("Button error:", e);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "❌ Button action failed.", ephemeral: true }).catch(() => {});
      }
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

// Render Web Service health server.
// Discord bots do not need a port, but Render Web Services do.
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/", (req, res) => {
  res.status(200).send("PATIO MUSIC is online 🎵");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    bot: client.isReady(),
    uptime: Math.floor(process.uptime())
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Web server listening on port ${PORT}`);
  console.log(generateDependencyReport());
});

client.login(process.env.DISCORD_TOKEN);

process.on("unhandledRejection", err => console.error("UNHANDLED REJECTION:", err));
process.on("uncaughtException", err => console.error("UNCAUGHT EXCEPTION:", err));
