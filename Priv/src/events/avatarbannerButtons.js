const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const [action, type, userId] = interaction.customId.split("_");

    if (action === "goster") {
      const user = await interaction.client.users.fetch(userId).catch(() => null);
      if (!user) return interaction.reply({ content: "Kullanıcı bulunamadı.", ephemeral: true });

      if (type === "avatar") {
        const embed = new EmbedBuilder()
          .setTitle(`${user.tag} - Avatar`)
          .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
          .setColor("Blurple");

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (type === "banner") {
        const userData = await interaction.client.users.fetch(user.id, { force: true });
        const bannerURL = userData.bannerURL({ dynamic: true, size: 4096 });

        if (!bannerURL) {
          return interaction.reply({ content: "❌ Bu kullanıcının banner'ı yok.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setTitle(`${user.tag} - Banner`)
          .setImage(bannerURL)
          .setColor("Blurple");

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    if (interaction.customId === "iptal_avatarbanner") {
      return interaction.message.delete().catch(() => null);
    }
  },
};
