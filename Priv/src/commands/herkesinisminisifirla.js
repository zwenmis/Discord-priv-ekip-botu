const { PermissionsBitField } = require("discord.js");
const config = require("../../config.js");

module.exports = {
  //name: "herkesinisminisifirla",
  description: "Sunucudaki herkesin takma ismini sıfırlar.",
  execute: async (client, message) => {
    const tickYes = config.yesEmoji;
    const tickNo = config.noEmoji;
    const authorizedRoles = config.ustyetkiliid;

    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames) &&
      !authorizedRoles.some(role => message.member.roles.cache.has(role))
    ) {
      return message.reply({ content: `${tickNo} Bu komutu kullanamazsın!` }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    const members = (await message.guild.members.fetch()).filter(member =>
      !member.user.bot && message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)
    );
    const membersArray = [...members.values()];

    let index = 0;
    const interval = setInterval(() => {
      const member = membersArray[index];
      if (!member) {
        clearInterval(interval);
        return;
      }

      member.setNickname(null).catch(() => {});
      index++;
    }, 3000); // her 3 saniyede bir

    await message.react(tickYes);
    message.reply({ content: `✅ Herkesin takma ismi sıfırlanıyor (3 saniyede bir)...` }).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 10000);
    });

    setTimeout(() => message.delete().catch(() => {}), 10000);
  }
};
