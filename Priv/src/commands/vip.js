const { PermissionsBitField } = require("discord.js");
const config = require("../../config.js");

module.exports = {
  name: "vip",
  description: "Bir kullanıcıya VIP rolü verir.",
  args: true,
  usage: "<@kullanıcı veya ID>",
  async execute(client, message, args) {
    const sendReply = (content) => {
      return message.channel.send(content).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    };

    // Yetkili kontrolü
    if (!config.ustyetkiliid.some(roleId => message.member.roles.cache.has(roleId))) {
      return sendReply(`${config.noEmoji} Bu komutu kullanmaya yetkiniz yok.`);
    }

    // Kullanıcı alma
    const member = message.mentions.members?.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return sendReply(`${config.noEmoji} Geçerli bir kullanıcı etiketlemelisin veya ID girmelisin.`);
    }

    const vipRol = message.guild.roles.cache.get(config.vipRolID);
    if (!vipRol) {
      return sendReply(`${config.noEmoji} VIP rolü bulunamadı. Lütfen config.js dosyasına 'vipRolID' ekleyin.`);
    }

    if (member.roles.cache.has(config.vipRolID)) {
      return sendReply(`${config.noEmoji} Bu kullanıcı zaten VIP.`);
    }

    // VIP rolünü ver
    member.roles.add(vipRol).then(() => {
      sendReply(`${config.yesEmoji} ${member.user.tag} kullanıcısına VIP rolü verildi!`);

      // Log kanalına gönderim
      const logChannel = message.guild.channels.cache.find(c => c.name === 'rol-log');
      if (logChannel) {
        logChannel.send(`🔔 ${member.user.tag} kullanıcısına ${message.author.tag} tarafından **VIP rolü** verildi.`);
      }

    }).catch(err => {
      console.error(err);
      sendReply(`${config.noEmoji} VIP rolü verilirken bir hata oluştu.`);
    });

    // Komut mesajını da 10 saniye sonra sil
    setTimeout(() => {
      message.delete().catch(() => {});
    }, 10000);
  }
};
