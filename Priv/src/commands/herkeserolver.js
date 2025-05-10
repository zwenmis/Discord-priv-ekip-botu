const { PermissionsBitField } = require("discord.js");
const config = require("../../config.js");

module.exports = {
 // name: "herkeserolver",
  description: "Sunucudaki herkese belirli bir rol verir.",
  execute: async (client, message, args) => {
    const tickYes = config.yesEmoji;
    const tickNo = config.noEmoji;
    const authorizedRoles = config.ustyetkiliid;

    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageRoles) &&
      !authorizedRoles.some(role => message.member.roles.cache.has(role))
    ) {
      return message.reply({ content: `${tickNo} Bu komutu kullanamazsın!` }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!role) {
      return message.reply({ content: "Lütfen geçerli bir rol belirtin. @rol veya rol ID girin." }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    const members = (await message.guild.members.fetch()).filter(member => !member.user.bot && !member.roles.cache.has(role.id));
    const membersArray = [...members.values()];

    let index = 0;
    const interval = setInterval(() => {
      const member = membersArray[index];
      if (!member) {
        clearInterval(interval);
        return;
      }

      member.roles.add(role).catch(() => {});
      index++;
    }, 3000); // her 3 saniyede bir

    await message.react(tickYes);
    message.reply({ content: `✅ Herkese ${role.name} rolü veriliyor (3 saniyede bir)...` }).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 10000);
    });

    setTimeout(() => message.delete().catch(() => {}), 10000);
  }
};
