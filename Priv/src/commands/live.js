const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const config = require("../../config.js");

module.exports = {
  name: "live",
  aliases: ["cam"],
  execute: async (client, message, args) => {
    const tickYes = config.yesEmoji;
    const tickNo = config.noEmoji;
    const authorizedRoles = config.ustyetkiliid;

    // Yetki kontrolü
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageRoles) &&
      !authorizedRoles.some(roleId => message.member.roles.cache.has(roleId))
    ) {
      return message.reply({ content: `${tickNo} Bu komutu kullanmak için yetkin yok.` }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!user) {
      return message.reply({ content: `${tickNo} Lütfen bir kullanıcı belirtin. \`.live @kullanıcı\`` }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    const streamerRole = message.guild.roles.cache.get(config.streamerol);
    if (!streamerRole) {
      return message.reply({ content: `${tickNo} Streamer rolü bulunamadı.` }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    try {
      await user.roles.add(streamerRole);
      await message.react(tickYes);

      const replyEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ ${user} kullanıcısına <@&${streamerRole.id}> rolü verildi.`);
      message.reply({ embeds: [replyEmbed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });

      const logEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🎥 Streamer Rolü Verildi")
        .addFields(
          { name: "🎭 Rol", value: `<@&${streamerRole.id}>`, inline: true },
          { name: "👤 Kullanıcı", value: `${user} (\`${user.id}\`)`, inline: true },
          { name: "🛡️ Yetkili", value: `${message.member} (\`${message.member.id}\`)`, inline: true }
        )
        .setTimestamp();

      const logChannel = message.guild.channels.cache.get(config.rollog);
      if (logChannel) logChannel.send({ embeds: [logEmbed] });

    } catch (err) {
      console.error("Streamer rolü verirken hata:", err);
      await message.react(tickNo);
      message.reply({ content: "❌ Rol verme sırasında bir hata oluştu." }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    setTimeout(() => {
      message.delete().catch(() => {});
    }, 10000);
  }
};
