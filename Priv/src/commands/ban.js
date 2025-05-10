const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const config = require("../../config.js");

module.exports = {
    name: "ban",
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
          

        const user = message.mentions.users.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!user)
            return message.reply({ content: `${no} Lütfen geçerli bir kullanıcı etiketle veya ID yaz.` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });

        const member = message.guild.members.cache.get(user.id);
        if (!member || !member.bannable)
            return message.reply({ content: `${no} Bu kullanıcıyı banlayamıyorum.` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });

        const sure = args[1] || "Belirtilmedi";
        const sebep = args.slice(2).join(" ") || "Sebep belirtilmedi.";

        await member.ban({ reason: `${message.author.tag} tarafından: ${sebep} | Süre: ${sure}` });

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setTitle("🚨 Kullanıcı Banlandı")
            .setDescription(`
${user} adlı kullanıcı sunucudan banlandı!

> 👮 Yetkili: ${message.author}
> 🕒 Süre: \`${sure}\`
> 📝 Sebep: \`${sebep}\`
            `)
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
            .setTimestamp();

        const logKanal = client.channels.cache.get(config.banLogChannel);
        if (logKanal) logKanal.send({ embeds: [embed] });

        message.react(yes).catch(() => {});

        setTimeout(() => {
            message.delete().catch(() => {});
        }, 10000);
    }
};
