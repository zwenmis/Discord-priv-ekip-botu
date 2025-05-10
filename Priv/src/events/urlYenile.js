const { Events } = require("discord.js");
const config = require("../../config.js");
const QuickDB = require("quick.db");
const db = new QuickDB.QuickDB();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId === "url_yenile") {
      const authorizedRoles = config.ustyetkiliid;
      if (!authorizedRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
        return interaction.reply({ content: `${config.noEmoji} Bu butonu kullanamazsın.`, ephemeral: true });
      }

      let usageCount = db.get("urlUsage") || 0;

      await interaction.update({
        content: `📎 **Sunucunun özel linki**: \`discord.gg/161\`\n📊 **URL Kullanım**: \`8720\``,
        components: interaction.message.components
      });
    }
  }
};
