const config = require("../../config.js");

module.exports = {
  name: 'say',
  description: 'Sunucu istatistiklerini gösterir.',
  execute: async (client, message, args) => {
    const guild = message.guild;

    const authorizedRoles = config.ustyetkiliid;

    if (!message.member.permissions.has("Administrator") &&
        !authorizedRoles.some(role => message.member.roles.cache.has(role))) {
      return message.reply(`\`Öncelikle geçerli yetkin olmalı!\``).catch(console.log);
    }

    const totalMembers = guild.memberCount;
    const totalBoosts = guild.premiumSubscriptionCount;
    const voiceChannelMembers = guild.members.cache.filter(member => member.voice.channel).size;
    const botCount = guild.members.cache.filter(member => member.user.bot).size;
    const onlineMembers = guild.members.cache.filter(member => member.presence && member.presence.status === 'online').size;
    const idleMembers = guild.members.cache.filter(member => member.presence && member.presence.status === 'idle').size;
    const dndMembers = guild.members.cache.filter(member => member.presence && member.presence.status === 'dnd').size;
    const offlineMembers = totalMembers - onlineMembers - idleMembers - dndMembers;

    // Family rolündeki üye sayısı
    const familyRole = guild.roles.cache.get(config.familyRoleID);
    const familyMembersCount = familyRole ? familyRole.members.size : 0;

    const content = 
`
\`${guild.name}\` Sunucu İstatistikleri

<a:1472whitesparkle:1347949751135375402> Sunucumuzda toplam **${totalMembers}** üye bulunuyor.
<a:1472whitesparkle:1347949751135375402> Sunucumuzda toplam **${totalBoosts}** takviye bulunuyor.
<a:1472whitesparkle:1347949751135375402> Seste aktif olarak **${voiceChannelMembers}** bulunmakta.
<a:1472whitesparkle:1347949751135375402> Sunucuda aktif olarak toplam **${onlineMembers}** kişi bulunuyor.

<a:1472whitesparkle:1347949751135375402> Ailemizde **${familyMembersCount}** kişi bulunuyor.
`;

    const sentMessage = await message.channel.send(content);

    await message.react(config.yesEmoji);

    setTimeout(() => {
      sentMessage.delete().catch(() => {});
    }, 15000);
  },
};
