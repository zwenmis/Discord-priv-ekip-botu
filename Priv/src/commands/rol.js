const { PermissionsBitField, EmbedBuilder } = require("discord.js");

const config = require("../../config.js");

module.exports = {
  name: "rol",
  execute: async (client, message, args) => {
    const tickYes = config.yesEmoji;
    const tickNo = config.noEmoji;
    // Çoklu rol ID'leri kontrolü (config.js'deki muteyetkili rollerini alıyoruz)
    const authorizedRoles = config.ownerroleid; // ["role_id_1", "role_id_2", ...]

    // Kullanıcının gerekli izinlere sahip olup olmadığını kontrol et
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers) && 
      !authorizedRoles.some(role => message.member.roles.cache.has(role))
    ) {
      return message.reply({ content: `${no} Bu komutu kullanmak için gerekli yetkiye veya role sahip değilsin.` })
        .then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 10000); // 10 saniye sonra mesajı sil
        });
    }

    // Diğer komut işlemleri...
  

    const [subCommand, userArg, roleArg] = args;

    if (!["ver", "al"].includes(subCommand)) {
      return message.reply("Kullanım: `.rol ver @kullanıcı @rol` veya `.rol al @kullanıcı @rol`").then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 15000);
      });
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(userArg);
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(roleArg);

    if (!member || !role) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("Kullanım: `.rol ver @kullanıcı @rol` veya `.rol al @kullanıcı @rol`");
      return message.reply({ embeds: [embed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 15000);
      });
    }

    try {
      if (subCommand === "ver") {
        await member.roles.add(role);
        await message.react(tickYes);

        const replyEmbed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(`✅ ${member} kullanıcısına \`${role.name}\` rolü verildi.`);
        message.reply({ embeds: [replyEmbed] }).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 15000);
        });

        const logEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("📌 Rol Verildi")
          .addFields(
            { name: "👤 Kullanıcı", value: `${member} (\`${member.id}\`)` },
            { name: "🎭 Rol", value: `${role} (\`${role.id}\`)` },
            { name: "🛡️ Yetkili", value: `${message.member} (\`${message.member.id}\`)` }
          )
          .setTimestamp();

        const logChannel = message.guild.channels.cache.get(config.rollog);
        if (logChannel) logChannel.send({ embeds: [logEmbed] });

      } else if (subCommand === "al") {
        await member.roles.remove(role);
        await message.react(tickYes);

        const replyEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setDescription(`✅ ${member} kullanıcısından \`${role.name}\` rolü alındı.`);
        message.reply({ embeds: [replyEmbed] }).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 15000);
        });

        const logEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle("📌 Rol Alındı")
          .addFields(
            { name: "👤 Kullanıcı", value: `${member} (\`${member.id}\`)` },
            { name: "🎭 Rol", value: `${role} (\`${role.id}\`)` },
            { name: "🛡️ Yetkili", value: `${message.member} (\`${message.member.id}\`)` }
          )
          .setTimestamp();

        const logChannel = message.guild.channels.cache.get(config.rollog);
        if (logChannel) logChannel.send({ embeds: [logEmbed] });
      }

    } catch (err) {
      console.error("Rol işlemi hatası:", err);
      await message.react(tickNo);
      message.reply("Rol işlemi sırasında bir hata oluştu.").then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 15000);
      });
    }

    setTimeout(() => {
      message.delete().catch(() => {});
    }, 15000);
  }
};
