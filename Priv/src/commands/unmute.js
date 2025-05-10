const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const config = require("../../config.js");

module.exports = {
    name: "unmute",
    aliases: [],
     execute: async (client, message, args) => {
           const yes = config.yesEmoji;
           const no = config.noEmoji;
           // Çoklu rol ID'leri kontrolü (config.js'deki muteyetkili rollerini alıyoruz)
           const authorizedRoles = config.muteyetkili; // ["role_id_1", "role_id_2", ...]
       
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

        // Unmute yapılacak kullanıcıyı bul
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            return message.reply({ content: `${no} Lütfen bir kullanıcı etiketleyin veya geçerli bir ID girin.` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        // Mute rolünü alıyoruz
        const muteRole = message.guild.roles.cache.get(config.muteRole);
        if (!muteRole) {
            return message.reply({ content: `${no} Mute rolü bulunamadı!` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        // Kullanıcı zaten unmuted durumdaysa
        if (!user.roles.cache.has(muteRole.id)) {
            return message.reply({ content: `${no} Bu kullanıcı zaten muteli değil!` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        try {
            // Unmute işlemi
            await user.roles.remove(muteRole);
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setTitle("🔊 Kullanıcı Unmute Edildi")
                .setDescription(`
<@${user.id}> adlı kullanıcının mute süresi bitti ve unmute edildi.

> 👮 Yetkili: ${message.author}
                `)
                .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
                .setTimestamp();

            // Log kanalına embed gönderme
            const logKanal = client.channels.cache.get(config.muteLogChannel);
            if (logKanal) logKanal.send({ embeds: [embed] });

            // Komut sahibine tepki
            message.react(yes).catch(() => {});

            // Kullanıcıya unmute mesajı
            message.reply({ content: `**<@${user.id}>** başarıyla unmute edildi! ${message.author}` });

        } catch (err) {
            message.reply({ content: `${no} Unmute işlemi sırasında bir hata oluştu.` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        setTimeout(() => {
            message.delete().catch(() => {});
        }, 10000);
    }
};
