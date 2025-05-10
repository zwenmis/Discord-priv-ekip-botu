const { EmbedBuilder,Colors, PermissionsBitField, MessageActionRow, ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js");
const config = require("../../config.js");

module.exports = {
  name: 'unvmute',
  description: 'Bir kullanıcının ses mute\'unu kaldırır.',
  args: true,
  usage: '<@kullanıcı> <sebep>',
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

    const sebep = args.slice(1).join(' ');
    if (!sebep) {
      return sendReply(`${config.noEmoji} Bir unmute sebebi belirtmeniz gerekiyor.`).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      })}
    


    // Kullanıcı zaten unmuteli mi?
    if (!member.voice.serverMute) {
      return sendReply({
        content: `${member.user.tag} zaten mute durumda değil.`,
        ephemeral: true
      });
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
      content: `${member.user.tag} kullanıcısının ses mutesi kaldırılacak. Sebep: ${sebep}`,
      components: [row]
    });

    const filter = i => i.user.id === message.author.id;
    const collector = confirmationMessage.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'onayla') {
        await member.voice.setMute(false, sebep);
        await interaction.reply({ content: `${config.yesEmoji} ${member.user.tag} kullanıcısının mute\'u kaldırıldı.`, ephemeral: true });
  message.react(config.yesEmoji).catch(() => {});
        const logChannel = message.guild.channels.cache.find(channel => channel.name === 'vmute-log');
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('🔈 Kullanıcının Mute\'u Kaldırıldı')
            .addFields(
              { name: 'Kullanıcı', value: `${member.user.tag} (${member.id})`, inline: true },
              { name: 'Sebep', value: sebep, inline: true },
              { name: 'İşlemi Yapan', value: `${message.author.tag} (${message.author.id})`, inline: true }
            )
            .setColor(Colors.Green) // unvmute
            .setTimestamp();

          logChannel.send({ embeds: [embed] });
        }
      } else if (interaction.customId === 'iptal') {
        await interaction.reply({ content: `${config.noEmoji} Unmute işlemi iptal edildi.`, ephemeral: true });
        await confirmationMessage.delete().catch(() => {});
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        await confirmationMessage.delete().catch(() => {});
        message.channel.send(`${config.noEmoji} Unmute işlemi zaman aşımına uğradı.`).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 10000);
        });
      }
    });

    setTimeout(() => {
      confirmationMessage.delete().catch(() => {});
    }, 10000);
  }
};
