const config = require("../../config.js");

module.exports = {
  name: "lock",
  description: "Kanalı kilitler veya kilidi açar.",
  usage: "[süre] / tümkanal / on / off",
  args: false,
  async execute(client, message, args) {
    const sendTemp = (content) => {
      return message.channel.send(content).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    };

    // Yetkili kontrolü
    if (!config.ustyetkiliid.some(roleId => message.member.roles.cache.has(roleId))) {
      return sendTemp(`${config.noEmoji} Bu komutu kullanmaya yetkiniz yok.`);
    }

    const everyone = message.guild.roles.everyone;

    // .lock off
    if (args[0] === "off") {
      await message.channel.permissionOverwrites.edit(everyone, {
        SendMessages: null
      });
      sendTemp(`${config.yesEmoji} Kanalın kilidi kaldırıldı.`);
      return setTimeout(() => message.delete().catch(() => {}), 10000);
    }

    // .lock on
    if (args[0] === "on") {
      await message.channel.permissionOverwrites.edit(everyone, {
        SendMessages: false
      });
      sendTemp(`${config.yesEmoji} Kanal kilitlendi.`);
      return setTimeout(() => message.delete().catch(() => {}), 10000);
    }

    // .lock tümkanal
    if (args[0] === "tümkanal") {
      message.guild.channels.cache
        .filter(ch => ch.type === 0) // Text kanallar
        .forEach(ch => {
          ch.permissionOverwrites.edit(everyone, {
            SendMessages: false
          }).catch(() => {});
        });
      sendTemp(`${config.yesEmoji} Tüm metin kanalları kilitlendi.`);
      return setTimeout(() => message.delete().catch(() => {}), 10000);
    }

    // Süreli lock
    if (args[0]) {
      const regex = /(\d+)([mhd])/; // Dakika, saat, gün
      const match = regex.exec(args[0]);

      if (!match) {
        return sendTemp(`${config.noEmoji} Geçersiz süre biçimi. Örnek: \`10m\`, \`1h\`, \`2d\``);
      }

      const amount = parseInt(match[1]);
      const unit = match[2];
      let duration = 0;

      if (unit === "m") duration = amount * 60 * 1000;
      if (unit === "h") duration = amount * 60 * 60 * 1000;
      if (unit === "d") duration = amount * 24 * 60 * 60 * 1000;

      await message.channel.permissionOverwrites.edit(everyone, {
        SendMessages: false
      });

      sendTemp(`${config.yesEmoji} Kanal ${args[0]} boyunca kilitlendi.`);

      setTimeout(() => {
        message.channel.permissionOverwrites.edit(everyone, {
          SendMessages: null
        });
        message.channel.send(`${config.yesEmoji} Kanalın kilidi otomatik olarak kaldırıldı.`)
          .then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
      }, duration);

      return setTimeout(() => message.delete().catch(() => {}), 10000);
    }

    // Süresiz lock (hiçbir argüman yoksa)
    await message.channel.permissionOverwrites.edit(everyone, {
      SendMessages: false
    });
    sendTemp(`${config.yesEmoji} Kanal süresiz olarak kilitlendi.`);
    return setTimeout(() => message.delete().catch(() => {}), 10000);
  }
};
