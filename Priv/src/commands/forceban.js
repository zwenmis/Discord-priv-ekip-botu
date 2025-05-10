const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config.js");

module.exports = {
  name: "forceban",
  aliases: [],

  execute: async (client, message, args) => {
    const yes = config.yesEmoji;
    const no = config.noEmoji;
    const tick = config.yesEmoji;

    if (config.ownerroleid.includes(message.author.id)) {
      return message.reply({ content: `${no} Bu komutu kullanamazsın.` }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null);
    if (!member) {
      return message.reply({ content: `${no} Lütfen geçerli bir kullanıcı etiketle veya ID gir.` }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    const userId = member.id;
    const reason = args.slice(1).join(" ") || "Belirtilmedi.";

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("ban_onay").setLabel("Onayla").setStyle(ButtonStyle.Success).setEmoji(yes),
      new ButtonBuilder().setCustomId("ban_red").setLabel("İptal").setStyle(ButtonStyle.Danger).setEmoji(no)
    );

    const msg = await message.reply({
      content: `Kullanıcı <@${userId}> (\`${userId}\`) banlansın mı?\nSebep: \`${reason}\``,
      components: [row]
    });

    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 15000, max: 1 });

    collector.on("collect", async interaction => {
      if (!interaction.guild) return;

      if (interaction.customId === "ban_onay") {
        try {
          await interaction.guild.members.ban(userId, { reason });

          await interaction.update({
            content: `${tick} <@${userId}> başarıyla banlandı.`,
            components: []
          });

          const logChannel = interaction.guild.channels.cache.get(config.banLogChannel);
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setColor("Red")
              .setTitle("🚫 Force Ban Uygulandı")
              .addFields(
                { name: "👤 Kullanıcı", value: `<@${userId}> (\`${userId}\`)`, inline: true },
                { name: "🛡️ Yetkili", value: `<@${message.author.id}>`, inline: true },
                { name: "📄 Sebep", value: reason }
              )
              .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
              .setTimestamp();
            logChannel.send({ embeds: [embed] });
          }
        } catch (err) {
          await interaction.update({
            content: `${no} Kullanıcı banlanırken bir hata oluştu.`,
            components: []
          });
        }
      } else if (interaction.customId === "ban_red") {
        await interaction.update({
          content: `${no} Ban işlemi iptal edildi.`,
          components: []
        });
      }

      setTimeout(() => {
        msg.delete().catch(() => {});
      }, 10000);
    });

    collector.on("end", collected => {
      if (collected.size === 0) {
        msg.edit({ content: `⏰ Süre doldu, işlem iptal edildi.`, components: [] });
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      }
    });
  }
};
