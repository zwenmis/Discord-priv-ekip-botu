const { EmbedBuilder } = require('discord.js');
const config = require("../../config.js");

module.exports = {
  name: "sil",
  aliases: ["temizle", "sil"],
  execute: async (client, message, args) => {
    // Embed objesi oluşturuluyor (v14 uyumlu)
    const embed = new EmbedBuilder();


   // Çoklu ID'ler kontrolü (config.js'deki rolleri alıyoruz)
   const authorizedRoles = config.banRole; // ["role_id_1", "role_id_2", ...]

   // Kullanıcının yetkisini kontrol et (Admin ya da authorizedRoles'tan birine sahip)
   if (!message.member.permissions.has("Administrator") && 
       !authorizedRoles.some(role => message.member.roles.cache.has(role))) {
     return message.reply({ embeds: [embed.setDescription(`Öncelikle geçerli yetkin olmalı!`)] })
       .catch((err) => console.log(err));
   }

    // Eğer miktar verilmemişse veya geçersizse uyarı gönder
    if (!args[0]) {
      return message.reply({ embeds: [embed.setDescription("1-100 arasında bir rakam belirt.")] })
        .catch((err) => console.log(err));
    }

    // Miktarın geçerli bir sayı olup olmadığını kontrol et
    if (isNaN(args[0])) {
      return message.reply({ embeds: [embed.setDescription("Geçerli bir sayı belirt!")] })
        .catch((err) => console.log(err));
    }

    // Miktarın 1 ile 100 arasında olmasını sağla
    let miktar = parseInt(args[0]);
    if (miktar < 1 || miktar > 100) {
      return message.reply({ embeds: [embed.setDescription("Lütfen 1 ile 100 arasında bir sayı girin!")] })
        .catch((err) => console.log(err));
    }

    // Mesajları silme işlemi
    try {
      // Mesajları sil
      const deletedMessages = await message.channel.bulkDelete(miktar, true); // message.channel kullanılıyor
      const deleteMessage = await message.channel.send({ content: `${message.author} tarafından **${deletedMessages.size}** mesaj silindi.` });

      // 10 saniye sonra mesajı sil
      setTimeout(() => {
        deleteMessage.delete().catch((err) => console.log('Silme hatası:', err)); // hata kontrolü ekledim
      }, 10000); // 10 saniye sonra mesajı sil

    } catch (err) {
      console.error(err);
      return message.reply({ embeds: [embed.setDescription("Mesajları silerken bir hata oluştu!")] })
        .catch((err) => console.log(err));
    }
  }
};