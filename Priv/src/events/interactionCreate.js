const { EmbedBuilder, InteractionType, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { readdirSync } = require("fs");
const { owner } = require("../../config.js");
const { sendLog } = require("./sendLog.js");
const commandFiles = readdirSync('./src/commands').filter(file => file.endsWith('.js'));

const cooldowns = new Map(); // booster cooldown

module.exports = {
  name: Events.InteractionCreate,
  execute: async (interaction) => {
 
    let client = interaction.client;


    if (interaction.type === InteractionType.ApplicationCommand) {
      if (interaction.user.bot) return;

      for (const file of commandFiles) {
        const command = require(`../../src/commands/${file}`);
        if (!command?.data?.name) continue;
        if (interaction.commandName && interaction.commandName.toLowerCase() === command.data.name.toLowerCase()) {
          try {
            await command.execute(interaction, client);
          } catch (error) {
            console.error('Komut çalıştırılamadı:', error);
            await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
          }
        }
      }
    }

    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    const member = interaction.member;

    // Reklam Bildir Modalı
    if (interaction.customId === "panel_reklambildir") {
      const modal = new ModalBuilder()
        .setCustomId("reklambildir_modal")
        .setTitle("🚨 Reklam Bildir");

      const userInput = new TextInputBuilder()
        .setCustomId("reklambildir_userid")
        .setLabel("Kullanıcı ID")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("123456789012345678")
        .setRequired(true);

      const imageInput = new TextInputBuilder()
        .setCustomId("reklambildir_imgurl")
        .setLabel("Ekran Görüntüsü Linki")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("https://cdn.discordapp.com/...")
        .setRequired(true);

      const descriptionInput = new TextInputBuilder()
        .setCustomId("reklambildir_description")
        .setLabel("Açıklama")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Kullanıcı nerede ne şekilde reklam yaptı?")
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(userInput),
        new ActionRowBuilder().addComponents(imageInput),
        new ActionRowBuilder().addComponents(descriptionInput)
      );

      return await interaction.showModal(modal);
    }

    // Reklam Modal Cevabı
    if (interaction.customId === "reklambildir_modal") {
      const userId = interaction.fields.getTextInputValue("reklambildir_userid");
      const imgUrl = interaction.fields.getTextInputValue("reklambildir_imgurl");
      const description = interaction.fields.getTextInputValue("reklambildir_description");

      await interaction.reply({ content: "✅ Reklam bildirimin alındı, yetkililere iletildi.", ephemeral: true });

      sendLog("reklamLog", {
        title: "🚨 Reklam Bildirimi",
        fields: [
          { name: "Bildirimi Gönderen", value: `<@${interaction.user.id}> - \`${interaction.user.id}\`` },
          { name: "Şüpheli Kullanıcı ID", value: `\`${userId}\`` },
          { name: "Açıklama", value: description }
        ],
        image: imgUrl
      });
    }

    // Booster isim değiştirme
    if (interaction.customId === "panel_boosterisim") {
      const boosterRole = interaction.guild.premiumSubscriberRole;

      if (!interaction.member.roles.cache.has(boosterRole?.id)) {
        return interaction.reply({
          content: "🚫 Bu özelliği sadece sunucuyu boostlayan üyeler kullanabilir.",
          ephemeral: true
        });
      }

      const now = Date.now();
      const cooldownAmount = 3 * 60 * 1000;

      if (cooldowns.has(interaction.user.id)) {
        const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const remaining = Math.ceil((expirationTime - now) / 1000);
          return interaction.reply({
            content: `⏳ Bu işlemi tekrar kullanmak için **${remaining} saniye** beklemelisin.`,
            ephemeral: true
          });
        }
      }

      cooldowns.set(interaction.user.id, now);
      setTimeout(() => cooldowns.delete(interaction.user.id), cooldownAmount);

      try {
        const modal = new ModalBuilder()
          .setCustomId("booster_modal")
          .setTitle("🎮 Booster İsim Değiştirme");

        const newNameInput = new TextInputBuilder()
          .setCustomId("booster_newname")
          .setLabel("Yeni İsim")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Yeni takma isminizi girin")
          .setRequired(true);

        const firstRow = new ActionRowBuilder().addComponents(newNameInput);
        modal.addComponents(firstRow);

        return await interaction.showModal(modal);
      } catch (err) {
        console.error("Modal gösterilirken hata oluştu:", err);
        if (!interaction.replied) {
          await interaction.reply({
            content: "❌ Bir hata oluştu.",
            ephemeral: true
          });
        }
      }
    }

    // Sunucu Bilgisi
    if (interaction.customId === "panel_sunucubilgi") {
      const guild = interaction.guild;

      const embed = new EmbedBuilder()
        .setTitle("📊 Sunucu Bilgisi")
        .addFields(
          { name: "Sunucu Adı", value: guild.name, inline: true },
          { name: "Toplam Üye", value: `${guild.memberCount}`, inline: true },
          { name: "Kuruluş Tarihi", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
        )
        .setColor("Blurple");

      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Ceza puanı (örnek veri)
    if (interaction.customId === "panel_cekincezapuan") {
      const cezapuani = 15;
      return await interaction.reply({ content: `📛 Ceza puanın: **${cezapuani}**`, ephemeral: true });
    }

    // Katılma Tarihi
    if (interaction.customId === "panel_katilmatarihi") {
      const joinedTimestamp = interaction.member.joinedTimestamp;
      return await interaction.reply({
        content: `📅 Sunucuya katıldığın tarih: <t:${Math.floor(joinedTimestamp / 1000)}:D>`,
        ephemeral: true
      });
    }

    // Üzerindeki Roller
    if (interaction.customId === "panel_rollerin") {
      const roles = interaction.member.roles.cache
        .filter(role => role.id !== interaction.guild.id)
        .map(role => `<@&${role.id}>`)
        .join(", ") || "Yok";

      return await interaction.reply({ content: `🎭 Üzerindeki roller:\n${roles}`, ephemeral: true });
    }
  }
};

 