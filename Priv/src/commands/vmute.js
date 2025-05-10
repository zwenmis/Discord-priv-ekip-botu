const { EmbedBuilder,Colors, PermissionsBitField, MessageActionRow, ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js");
const config = require("../../config.js");

module.exports = {
    name: 'vmute',
    description: 'Bir kullanıcıyı sesli kanalda mute yapar.',
    args: true,
    usage: '<@kullanıcı> <zaman> <sebep>',
    async execute(client, message, args) {
      const sendReply = (content) => {
        if (message.reply) return message.reply(content);
        else return message.channel.send(content);
      };
  // Yetkili kontrolü
const authorizedRoles = config.ustyetkiliid;
if (!authorizedRoles.some(roleId => message.member.roles.cache.has(roleId))) {
  return sendReply(`${config.noEmoji} Bu komutu kullanmaya yetkiniz yok.`).then(msg => {
    setTimeout(() => msg.delete().catch(() => {}), 10000);
  });
}

      const member = message.mentions.members?.first();
      if (!member) {
        return sendReply(`${config.noEmoji} Geçerli bir kullanıcı etiketlemeniz gerekiyor.`).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 10000);
          })}
      
  
      const zaman = args[1];
      const sebep = args.slice(2).join(' ');
  
      if (!sebep) {
        return sendReply(`${config.noEmoji} Bir mute sebebi belirtmeniz gerekiyor.`).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 10000);
          })}
  

  
      if (member.voice.serverMute) {
        return sendReply({
          content: `${member.user.tag} zaten mute durumda.`,
          ephemeral: true
        });
      }
  
      // ... (devamı aynı kalabilir)
  

    // Süreli mute işlemi
    let muteTime = null;
    if (zaman) {
      const regex = /(\d+)([hm])/;
      const match = regex.exec(zaman);
      if (match) {
        const duration = parseInt(match[1], 10);
        const unit = match[2];
        muteTime = unit === 'h' ? duration * 60 * 60 * 1000 : duration * 60 * 1000;
      } else {
        return message.reply({
          content: `${config.noEmoji} Geçersiz zaman formatı. Örnek: 1h (1 saat), 30m (30 dakika)`,
          ephemeral: true
        });
      }
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('onayla')
          .setEmoji(config.yesEmoji)
          .setLabel('Onayla')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('iptal')
          .setLabel('İptal Et')
          .setEmoji(config.noEmoji)
          .setStyle(ButtonStyle.Danger)
      );
      

    const confirmationMessage = await message.channel.send({
      content: `${member.user.tag} kullanıcısına mute işlemi uygulanacak. Sebep: ${sebep}`,
      components: [row]
    });

    // Mesajı 10 saniye sonra silme
    setTimeout(() => {
      confirmationMessage.delete();
    }, 10000);

    // Butonları işleyen event
    const filter = i => i.user.id === message.author.id;
    const collector = confirmationMessage.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'onayla') {
        // Mute uygula
        await member.voice.setMute(true, sebep);
        await interaction.reply({ content: `${config.yesEmoji} ${member.user.tag} başarıyla mute edildi. Sebep: ${sebep}`, ephemeral: true });
        message.react(config.yesEmoji).catch(() => {});
        // Süreli mute işlemi varsa, belirli süre sonra mute kaldır
        if (muteTime) {
          setTimeout(() => {
            member.voice.setMute(false, 'Mute süresi sona erdi.');
          }, muteTime);
        }

        // Loglama işlemi
        const logChannel = message.guild.channels.cache.find(channel => channel.name === 'vmute-log'); // Log kanalının adı
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('🔇 Kullanıcı Mute Edildi')
            .addFields(
              { name: 'Mute Edilen Kullanıcı', value: `${member.user.tag} (${member.id})`, inline: true },
              { name: 'Mute Sebebi', value: sebep, inline: true },
              { name: 'Mute Eden Yetkili', value: `${message.author.tag} (${message.author.id})`, inline: true }
            )
            .setColor(Colors.Red) // vmute
            .setTimestamp();

          logChannel.send({ embeds: [embed] });
        }
      } else if (interaction.customId === 'iptal') {
        await interaction.reply({ content: `${config.noEmoji} Mute işlemi iptal edildi.`, ephemeral: true });
        await confirmationMessage.delete(); // Orijinal cevabı sil
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        await confirmationMessage.delete();
        message.reply(`${config.noEmoji} Mute işlemi zaman aşımına uğradı.`);
      }
    });
  }
};
