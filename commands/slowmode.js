const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set slowmode for this channel")
    .addIntegerOption(o =>
      o.setName("seconds")
        .setDescription("Slowmode delay in seconds (0 to disable, max 21600)")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(i) {
    if (!i.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
      return i.reply({ content: "❌ You need **Manage Channels** permission.", ephemeral: true });
    }

    const seconds = i.options.getInteger("seconds", true);
    if (!i.channel || typeof i.channel.setRateLimitPerUser !== "function") {
      return i.reply({ content: "❌ Slowmode can't be changed in this channel.", ephemeral: true });
    }

    try {
      await i.channel.setRateLimitPerUser(seconds, `Slowmode changed by ${i.user.tag}`);

      if (seconds === 0) {
        return i.reply("🐢 **Slowmode disabled** in this channel.");
      }

      const minutes = Math.floor(seconds / 60);
      const remaining = seconds % 60;
      const duration = minutes
        ? `${minutes}m${remaining ? ` ${remaining}s` : ""}`
        : `${seconds}s`;

      return i.reply(`🐢 **Slowmode enabled:** members must wait **${duration}** between messages.`);
    } catch (error) {
      console.error("Slowmode error:", error);
      return i.reply({ content: "❌ I couldn't change slowmode. Make sure I have **Manage Channels** permission.", ephemeral: true });
    }
  }
};
