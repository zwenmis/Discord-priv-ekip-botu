const { EmbedBuilder } = require("discord.js");
const config = require("../../config.js");

module.exports = {
  name: "family",
  execute: async (client, message, args) => {
    const tickYes = config.yesEmoji;
    const tickNo = config.noEmoji;

    // Üst yetkili rol ID'lerini alıyoruz
    const authorizedRoles = config.ustyetkiliid; // ["role_id_1", "role_id_2", ...]

    // Kullanıcının gerekli yetkiye sahip olup olmadığını kontrol et
    if (
      !authorizedRoles.some(role => message.member.roles.cache.has(role))
    ) {
      return message.reply({ content: `${tickNo} Bu komutu kullanmak için gerekli yetkiye sahip değilsin.` })
        .then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 10000); // 10 saniye sonra mesajı sil
        });
    }

    // Etiketlenen kişiyi al
    const taggedUser = message.mentions.members.first(); // İlk etiketlenen kişiyi alıyoruz

    // Etiketlenen kişi yoksa, geçerli bir uyarı mesajı gönder
    if (!taggedUser) {
      return message.reply({ content: `${tickNo} Lütfen bir kullanıcı etiketleyin.` })
        .then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 10000); // 10 saniye sonra mesajı sil
        });
    }

    // Family rolünü al
    const familyRole = message.guild.roles.cache.get(config.familyRoleID); // config.js'den rol ID'sini alıyoruz
    if (!familyRole) {
      return message.reply({ content: `${tickNo} "family" rolü bulunamadı.` });
    }

    try {
      // Etiketlenen kişiye family rolünü ver
      await taggedUser.roles.add(familyRole);
      await message.react(tickYes);

      const replyEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ ${taggedUser} kullanıcısına \`family\` rolü verildi.`);
      message.reply({ embeds: [replyEmbed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 15000);
      });

      // Log işlemi
      const logEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("📌 Family Rolü Verildi")
        .addFields(
          { name: "👤 Kullanıcı", value: `${taggedUser} (\`${taggedUser.id}\`)` },
          { name: "🎭 Rol", value: "`family`" }
        )
        .setTimestamp();

      const logChannel = message.guild.channels.cache.get(config.rollog);
      if (logChannel) logChannel.send({ embeds: [logEmbed] });

    } catch (err) {
      console.error("Family rolü verme hatası:", err);
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
