const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const config = require("../../config.js");

module.exports = {
  name: "git",
  description: "Bir kullanıcının yanına gitmek için istek gönderir.",
  execute: async (client, message, args) => {
    const authorizedRoles = config.ustyetkiliid;

    // Yetki kontrolü
   
    

    // Hedef kişi belirleme
    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetMember) return message.reply("Lütfen gitmek istediğin kişiyi etiketle veya ID'sini yaz.").then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 10000);
    });

    // Seste mi kontrolü
    if (!targetMember.voice?.channel) return message.reply("Bu kullanıcı bir ses kanalında değil.").then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 10000);
    });
    if (!message.member.voice?.channel) return message.reply("Sende bir ses kanalında olmalısın.").then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 10000);
    });

    // Butonlar
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_git')
        .setLabel('Kabul Et')
        .setEmoji(config.yesEmoji)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('decline_git')
        .setLabel('Reddet')
        .setEmoji(config.noEmoji)
        .setStyle(ButtonStyle.Danger)
    );

    // Embed
    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setDescription(`${targetMember}, ${message.member} senin yanına gelmek istiyor. Kabul ediyor musun? (30 saniye içinde)`);

    const requestMsg = await message.channel.send({
      content: `<@${targetMember.id}>`,
      embeds: [embed],
      components: [row]
    });

    // Collector başlat
    const collector = requestMsg.createMessageComponentCollector({
      filter: (i) => i.user.id === targetMember.id,
      time: 30000
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'accept_git') {
        await i.deferUpdate();
        await message.member.voice.setChannel(targetMember.voice.channel);
        const successEmbed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(`${message.member}, ${targetMember} yanına taşındı ✅`);
        await requestMsg.edit({ embeds: [successEmbed], components: [] });
        setTimeout(() => requestMsg.delete().catch(() => {}), 10000);
        collector.stop();
      } else if (i.customId === 'decline_git') {
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
