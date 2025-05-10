const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const config = require("../../config.js");

module.exports = {
  name: "çek",
  description: "Bir kullanıcıyı yanına çekmek için istek gönderir.",
  execute: async (client, message, args) => {
    const authorizedRoles = config.ustyetkiliid;

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
        !authorizedRoles.some(role => message.member.roles.cache.has(role))) {
      return message.reply("Bu komutu kullanmak için yetkin yok.").then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetMember) return message.reply("Lütfen çekmek istediğin kişiyi etiketle veya ID'sini yaz.").then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 10000);
    });

    if (!targetMember.voice?.channel) return message.reply("Bu kullanıcı bir ses kanalında değil.").then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 10000);
    });
    if (!message.member.voice?.channel) return message.reply("Sen bir ses kanalında olmalısın.").then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 10000);
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_cek')
        .setLabel('Kabul Et')
        .setEmoji(config.yesEmoji)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('decline_cek')
        .setLabel('Reddet')
        .setEmoji(config.noEmoji)
        .setStyle(ButtonStyle.Danger)
    );

    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setDescription(`${targetMember}, ${message.member} seni yanına çekmek istiyor. Kabul ediyor musun? (30 saniye içinde)`);

    const requestMsg = await message.channel.send({
      content: `<@${targetMember.id}>`,
      embeds: [embed],
      components: [row]
    });

    const collector = requestMsg.createMessageComponentCollector({
      filter: (i) => i.user.id === targetMember.id,
      time: 30000
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'accept_cek') {
        await i.deferUpdate();
        await targetMember.voice.setChannel(message.member.voice.channel);
        const successEmbed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(`${targetMember}, ${message.member} yanına çekildi ✅`);
        await requestMsg.edit({ embeds: [successEmbed], components: [] });
        setTimeout(() => requestMsg.delete().catch(() => {}), 10000);
        collector.stop();
      } else if (i.customId === 'decline_cek') {
        await i.deferUpdate();
        const declinedEmbed = new EmbedBuilder()
          .setColor("Red")
          .setDescription(`${targetMember}, isteği reddetti ❌`);
        await requestMsg.edit({ embeds: [declinedEmbed], components: [] });
        setTimeout(() => requestMsg.delete().catch(() => {}), 10000);
        collector.stop();
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = new EmbedBuilder()
          .setColor("Grey")
          .setDescription(`⏱️ Yanıt süresi doldu, işlem iptal edildi.`);
        await requestMsg.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
        setTimeout(() => requestMsg.delete().catch(() => {}), 10000);
      }
    });
  }
};
