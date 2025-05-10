const { EmbedBuilder } = require('discord.js');
const { prefix } = require('../../config.js');
const QuickDB = require("quick.db");
const db = new QuickDB.QuickDB();
const moment = require("moment");
require("moment-duration-format");

module.exports = {
  name: 'messageCreate',
  execute: async (message) => {
    const client = message.client;
    if (message.author.bot || message.channel.type === 1) return;

    // AFK'dan dönüş
    const afkData = await db.get(`afk_${message.author.id}`);
    if (afkData) {
      const backEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ AFK modundan çıktın, hoş geldin!`);

      message.reply({ embeds: [backEmbed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });

      message.member.setNickname(afkData.oldName).catch(() => {});
      await db.delete(`afk_${message.author.id}`);
    }

    // Etiketlenen kişi AFK mı
    const mention = message.mentions.users.first();
    if (mention) {
      const mentionData = await db.get(`afk_${mention.id}`);
      if (mentionData) {
        const sure = moment.duration(Date.now() - mentionData.time).format("H [saat], m [dk]");
        const afkEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setDescription(`📌 **${mention.tag}** şu anda AFK.\n📎 **Sebep:** \`${mentionData.reason}\`\n⏱️ **Süre:** ${sure}`);

        message.reply({ embeds: [afkEmbed] }).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 10000);
        });
      }
    }

// Komut kontrol
if (!message.content.startsWith(prefix)) return;

const args = message.content.slice(prefix.length).trim().split(/ +/g);
const commandName = args.shift()?.toLowerCase();
if (!commandName) return;

const command = client.commands.get(commandName);
if (!command) return;

// Kanal sınırlandırması
const allowedEverywhere = ["rolpanel", "sil", "buttonpanel", "url"];
const shipOnly = ["ship"];

if (!allowedEverywhere.includes(commandName)) {
  if (shipOnly.includes(commandName)) {
    if (message.channel.name !== "ship") {
      return message.reply({
        content: 'Bu komut sadece <#ship> kanalında kullanılabilir!'
      }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }
  } else {
    if (message.channel.name !== "commands") {
      return message.reply({
        content: 'Bu komutu sadece <#commands> kanalında kullanabilirsin!'
      }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }
  }
}

    // Komutu çalıştır
    try {
      await command.execute(client, message, args);
    } catch (err) {
      console.error(err);
      message.reply('Komutu çalıştırırken bir hata oluştu!').then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }
  }
};
