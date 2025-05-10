const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const config = require("../../config.js");

module.exports = {
    name: "unban",
    aliases: [],
    execute: async (client, message, args) => {
        const yes = config.yesEmoji;
        const no = config.noEmoji;
        // Çoklu rol ID'leri kontrolü (config.js'deki muteyetkili rollerini alıyoruz)
        const authorizedRoles = config.banRole; // ["role_id_1", "role_id_2", ...]
    
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
      

        const userID = args[0];
        if (!userID || isNaN(userID)) {
            return message.reply({ content: `${no} Lütfen geçerli bir kullanıcı ID'si yaz.` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        const sebep = args.slice(1).join(" ") || "Sebep belirtilmedi.";

        try {
            await message.guild.members.unban(userID, sebep);

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setTitle("🔓 Kullanıcı Unbanlandı")
                .setDescription(`
<@${userID}> adlı kullanıcının banı kaldırıldı.

> 👮 Yetkili: ${message.author}
> 📝 Sebep: \`${sebep}\`
                `)
                .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
                .setTimestamp();

            const logKanal = client.channels.cache.get(config.banLogChannel);
            if (logKanal) logKanal.send({ embeds: [embed] });

            message.react(yes).catch(() => {});
        } catch (err) {
            message.reply({ content: `${no} Bu ID'ye sahip bir kullanıcı banlı değil veya bir hata oluştu.` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        setTimeout(() => {
            message.delete().catch(() => {});
        }, 10000);
    }
};
