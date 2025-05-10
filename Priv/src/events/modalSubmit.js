const { Events, EmbedBuilder } = require("discord.js");
const { reklamLogKanal } = require("../../config.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === "reklambildir_modal") {
      const userId = interaction.fields.getTextInputValue("reklambildir_userid");
      const imageUrl = interaction.fields.getTextInputValue("reklambildir_imgurl");
      const description = interaction.fields.getTextInputValue("reklambildir_description");

      const logChannel = interaction.guild.channels.cache.get(reklamLogKanal);

      if (!logChannel) {
        return await interaction.reply({ content: "❌ Log kanalı bulunamadı.", ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle("🚨 Yeni Reklam Bildirimi")
        .addFields(
          { name: "Bildiren", value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
          { name: "Şüpheli Kullanıcı", value: `${userId}`, inline: false },
          { name: "Açıklama", value: description, inline: false }
        )
        .setImage(imageUrl)
        .setTimestamp()
        .setColor("Red");

      await logChannel.send({ embeds: [embed] });
      return await interaction.reply({ content: "✅ Reklam bildirimin başarıyla iletildi.", ephemeral: true });
    }
  }
};
