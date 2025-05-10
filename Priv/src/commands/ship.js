const { EmbedBuilder } = require("discord.js");
const config = require("../../config.js");

module.exports = {
    name: "ship",
    aliases: [],

    execute: async (client, message, args) => {
        const shipChannelName = "ship"; // Komutun çalışmasını istediğiniz kanalın adı
        
        if (message.channel.name !== shipChannelName) {
            return message.reply({
                content: `Bu komut sadece #${shipChannelName} kanalında kullanılabilir!`
            }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        const yes = "💘";
        const no = config.noEmoji;

        let shipUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        // Eğer kullanıcı etiketlenmemişse rastgele biri seç
        if (!shipUser) {
            const members = message.guild.members.cache.filter(m => !m.user.bot && m.id !== message.author.id);
            const randomMember = members.random();
            if (!randomMember) {
                return message.reply({
                    content: `${no} Sunucuda eşleştirecek başka kimse yok.`
                }).then(msg => {
                    setTimeout(() => msg.delete().catch(() => {}), 10000);
                });
            }
            shipUser = randomMember;
        }

        const lovePercentage = Math.floor(Math.random() * 100) + 1;

        const loveMessagesLow = [
            "Ah be bebeğim, üzülme ben varım! 💔 Aşkın zamanla büyür ve gelişir, her şey yoluna girecek. 🌸",
            "Unutma, seni seviyorum ve hep yanında olacağım! 💖"
        ];

        const loveMessagesHigh = [
            "Oha, gerçekten birbiriniz için yaratılmışsınız! 💕 Aşkınızın gücü her geçen gün artacak, birlikte çok güzel bir geleceğiniz var! 😍",
            "Birlikte el ele bir ömür boyu mutlu olursunuz, inanın bana! ✨🌹",
            "Aşkınız her geçen gün büyüyecek ve daha da derinleşecek! 🥰",
            "Birbirinize karşı duyduğunuz sevgi, her şeyin önünde olacak! 💖",
            "Birlikte yaşadığınız her an çok değerli! Birbirinize sarılın, sevginiz hiç solmasın! 🌺"
        ];

        let loveMessage = "";
        let embedColor = "Blue";
        if (lovePercentage <= 50) {
            loveMessage = loveMessagesLow[Math.floor(Math.random() * loveMessagesLow.length)];
            embedColor = "Red";
        } else {
            loveMessage = loveMessagesHigh[Math.floor(Math.random() * loveMessagesHigh.length)];
            embedColor = "Green";
        }

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`💖 **Aşkölçer**: ${lovePercentage}%`)
            .setDescription(`
                **${message.author.username}** ve **${shipUser.user.username}** arasındaki aşk oranı: **${lovePercentage}%**
                ${loveMessage}
            `)
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
            .setTimestamp();

        message.reply({
            content: `${yes} Aşkınız ölçüldü! 💖`,
            embeds: [embed]
        });

        setTimeout(() => {
            message.delete().catch(() => {});
        }, 50000);
    }
};
