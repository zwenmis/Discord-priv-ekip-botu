const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
  
  //name: "rolpanel",
  description: "Burç ve ilişki rol seçim panelini gönderir.",
  execute: async (client, message, args) => {
    // Burç Seçimi için Embed ve Butonlar
    const burcEmbed = new EmbedBuilder()
      .setTitle("Burç Seçimi")
      .setDescription("<a:2653kittypaw:1347595244224385114> Aşağıdaki butonları kullanarak burcunu seçebilirsin.")
      .setColor("Yellow");

    const burcRow1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId("burc_koc").setLabel("Koç").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("burc_boga").setLabel("Boğa").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("burc_ikizler").setLabel("İkizler").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("burc_yengec").setLabel("Yengeç").setStyle(ButtonStyle.Secondary),
      );

    const burcRow2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId("burc_aslan").setLabel("Aslan").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("burc_basak").setLabel("Başak").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("burc_terazi").setLabel("Terazi").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("burc_akrep").setLabel("Akrep").setStyle(ButtonStyle.Secondary),
      );

    const burcRow3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId("burc_yay").setLabel("Yay").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("burc_oglak").setLabel("Oğlak").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("burc_kova").setLabel("Kova").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("burc_balik").setLabel("Balık").setStyle(ButtonStyle.Secondary),
      );

    // İlişki Durumu için Embed ve Butonlar
    const iliskiEmbed = new EmbedBuilder()
      .setTitle("İlişki Durumu Seçimi")
      .setDescription("<a:2653kittypaw:1347595244224385114> Aşağıdaki butonları kullanarak ilişki durumunu seçebilirsin. Ayrıca rolleri temizlemek için butona tıkla.")
      .setColor("Green");

    const iliskiRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId("iliski_var").setLabel("Sevgilim Var").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("iliski_yok").setLabel("Sevgilim Yok").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("rol_temizle").setLabel("Rolleri Temizle").setStyle(ButtonStyle.Secondary),
      );

    // Burç ve İlişki Durumu için Embed ve Butonlar ayrı ayrı gönderilecek
    await message.channel.send({
      embeds: [burcEmbed],  // Burçlar için embed
      components: [burcRow1, burcRow2, burcRow3]  // Burçlar için butonlar
    });

    await message.channel.send({
      embeds: [iliskiEmbed],  // İlişki durumu için embed
      components: [iliskiRow]  // İlişki durumu için butonlar
    });
  }
};
