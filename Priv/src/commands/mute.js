const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const ms = require("ms"); // ms modülü, süreyi dönüşüme çevirir
const config = require("../../config.js");

module.exports = {
    name: "mute",
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
    
        // Diğer komut işlemleri...
      

        // Mute yapılacak kullanıcıyı bul
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            return message.reply({ content: `${no} Lütfen bir kullanıcı etiketleyin veya geçerli bir ID girin.` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        // Mute süresi kontrolü
        const muteDuration = args[1];
        if (!muteDuration || isNaN(ms(muteDuration))) {
            return message.reply({ content: `${no} Geçerli bir süre girin (örnek: 1m, 2h, 1d).` }).then(msg => {
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

        // Zaten mute olmuşsa uyarı veriyoruz
        if (user.roles.cache.has(muteRole.id)) {
            return message.reply({ content: `${no} Bu kullanıcı zaten mute durumda.` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        try {
            // Mute rolünü kullanıcıya ekliyoruz
            await user.roles.add(muteRole);
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setTitle("🔇 Kullanıcı Mute Edildi")
                .setDescription(`
<@${user.id}> adlı kullanıcıya **Muted** rolü verildi. Bu kullanıcı mute süresi boyunca sohbet edemeyecek.

> 👮 Yetkili: ${message.author}
> ⏳ Süre: ${muteDuration}
                `)
                .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
                .setTimestamp();

            // Log kanalına embed gönderme
            const logKanal = client.channels.cache.get(config.muteLogChannel);
            if (logKanal) logKanal.send({ embeds: [embed] });

            // Komut sahibine tepki
            message.react(yes).catch(() => {});

            // Kullanıcıyı etiketleme ve mute süresi sonrası işlemleri ekliyoruz
            message.reply({ content: `**<@${user.id}>** başarıyla mute edildi! ${message.author}` });

            // Süre bitince mute rolünü kaldırıyoruz
            setTimeout(async () => {
                await user.roles.remove(muteRole);

                // Mute kaldırıldıktan sonra embedli bir mesaj gönderiyoruz
                const unmuteEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                    .setTitle("🔊 Kullanıcının Mute Süresi Bitti")
                    .setDescription(`<@${user.id}> adlı kullanıcının mute süresi bitti. Artık sohbet edebilir.`)
                    .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
                    .setTimestamp();

                // Log kanalına unmute işlemi hakkında bir mesaj gönderiyoruz
                if (logKanal) logKanal.send({ embeds: [unmuteEmbed] });
            }, ms(muteDuration));

        } catch (err) {
            message.reply({ content: `${no} Mute işlemi sırasında bir hata oluştu.` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        setTimeout(() => {
            message.delete().catch(() => {});
        }, 10000);
    }
};
