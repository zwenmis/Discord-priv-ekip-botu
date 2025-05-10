const config = require("../../config.js");

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");


module.exports = {
  name: "buttonpanel",
  description: "Kullanıcı buton panelini kurar",
  execute: async (client, message) => {
    // Yetkili kontrolü
const authorizedRoles = config.ownerroleid;
if (!authorizedRoles.some(roleId => message.member.roles.cache.has(roleId))) {
  return sendReply(`${config.noEmoji} Bu komutu kullanmaya yetkiniz yok.`).then(msg => {
    setTimeout(() => msg.delete().catch(() => {}), 10000);
  })}
    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("🎛️ Kullanıcı Paneli")
      .setDescription([
        "Aşağıdaki butonlardan dilediğini kullanabilirsin:",
        "",
        "**🎯 Panel Özellikleri:**",
        "• İsim değiştirme (Sadece Booster)",
        "• Sunucu bilgisi",
        "• Ceza puanı sorgulama",
        "• Katılma tarihi",
        "• Üzerindeki roller",
        "",
        "**🚨 Reklam Bildirim Sistemi:**",
        "`Reklam Bildir` butonunu kullanarak sunucuda reklam yapan kullanıcıları yetkililere bildirebilirsin.",
        "Bildirim sırasında kullanıcı ID, ekran görüntüsü linki ve kısa açıklama girmen istenir."
      ].join("\n"));

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("panel_boosterisim")
        .setLabel("Booster İsim Değiştir")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("panel_sunucubilgi")
        .setLabel("Sunucu Hakkında")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("panel_cekincezapuan")
        .setLabel("Ceza Puanın")
        .setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("panel_katilmatarihi")
        .setLabel("Katılma Tarihin")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("panel_rollerin")
        .setLabel("Rollerin")
        .setStyle(ButtonStyle.Secondary)
    );
const row3 = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("panel_reklambildir")
.setLabel("🚨 Reklam Bildir")
.setStyle(ButtonStyle.Danger)
    );

    await message.channel.send({
      embeds: [embed],
      components: [row1, row2, row3]
    });
  }
};
