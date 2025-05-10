const { EmbedBuilder } = require('discord.js');
const QuickDB = require("quick.db");
const db = new QuickDB.QuickDB();


module.exports = {
  name: "afk",
  description: "AFK moduna geçersin",
  execute: async (client, message, args) => {
    const reason = args.join(" ") || "Sebep belirtilmedi.";

    const currentNickname = message.member.displayName;

    // AFK'ya al
    await db.set(`afk_${message.author.id}`, {
      reason: reason,
      oldName: currentNickname,
      time: Date.now()
    });

    // AFK takısını ekle
    if (!currentNickname.startsWith("[AFK]")) {
      message.member.setNickname(`[AFK] ${currentNickname}`).catch(() => {});
    }

    const afkEmbed = new EmbedBuilder()
      .setColor("Blurple")
      .setDescription(`✅ Artık AFK modundasın!\n📎 Sebep: \`${reason}\``);

    message.reply({ embeds: [afkEmbed] }).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 10000);
    });
  }
};
