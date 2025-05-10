const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "avatar", // .avatar ya da .banner fark etmez
  aliases: ["banner"],
  async execute(client, message, args) {
    const target = message.mentions.users.first() || message.author;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`goster_avatar_${target.id}`).setLabel("Avatar").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`goster_banner_${target.id}`).setLabel("Banner").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("iptal_avatarbanner").setLabel("İptal").setStyle(ButtonStyle.Danger)
    );

    message.reply({
      content: `🖼️ **${target.tag}** için bir görsel seç:`,
      components: [row]
    });
  }
};
