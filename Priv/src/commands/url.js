const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config.js");
const QuickDB = require("quick.db");
const db = new QuickDB.QuickDB();

module.exports = {
  name: "url",
  description: "Sunucunun özel linki ve kullanım sayısını gösterir.",
  async execute(client, message) {
    const authorizedRoles = config.ustyetkiliid;
    if (!authorizedRoles.some(roleId => message.member.roles.cache.has(roleId))) {
      return message.reply({ content: `${config.noEmoji} Bu komutu kullanamazsın.`, ephemeral: true }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    const url = "discord.gg/161";
    let usageCount = db.get("urlUsage") || 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("url_yenile")
        .setLabel("🔄 Yenile")
        .setStyle(ButtonStyle.Primary)
    );

    const reply = await message.reply({
      content: `📎 **Sunucunun özel linki**: \`${url}\`\n📊 **URL Kullanım**: \`8720\``,
      components: [row]
    });

 
  }
};
