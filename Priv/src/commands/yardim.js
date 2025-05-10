const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.js");

module.exports = {
  name: "yardım",
  aliases: ["help"],
  execute: async (client, message) => {
    const komutKlasoru = path.join(__dirname);
    const komutDosyalari = fs.readdirSync(komutKlasoru).filter(file => file.endsWith(".js") && file !== "yardim.js");

    const komutIsimleri = komutDosyalari.map(file => {
      const komut = require(`./${file}`);
      return `\`${komut.name}\``;
    });

    const embed = new EmbedBuilder()
      .setTitle("📜 Yardım Menüsü")
      .setColor("Blue")
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription("Aşağıda botta bulunan komutların listesi yer alır:")
      .addFields(
        { name: "📦 Komutlar", value: komutIsimleri.join(" • ") || "Hiç komut bulunamadı." }
      )
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
      .setTimestamp();

    // ✅ Emojili tepki
    await message.react(config.yesEmoji).catch(() => {});

    // Embedli cevap
    message.reply({ embeds: [embed] }).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 15000);
    });

    // Komut mesajını sil
    setTimeout(() => {
      message.delete().catch(() => {});
    }, 15000);
  }
};
