const { Client, Collection, GatewayIntentBits, Partials, ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ChannelType } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent
  ],
  shards: "auto",
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember
  ]
});
const { prefix, owner, token, voicechannel } = require("./config.js");
const moment = require("moment");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

client.commands = new Collection();  // Yani burada Collection kullanabilirsin.

const rest = new REST({ version: '10' }).setToken(token);

const log = l => { console.log(`[${moment().format("DD-MM-YYYY HH:mm:ss")}] ${l}`) };

// Komutları yükle
const { readdirSync } = require("fs");
const commandFiles = readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  try {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`Komut yüklendi: ${command.name}`);
  } catch (err) {
    console.error(`Komut yüklenemedi: ${file}`, err);
  }
}

// Eventleri yükle
const eventFiles = readdirSync('./src/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  try {
    const event = require(`./src/events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`Event yüklendi: ${file}`);
  } catch (err) {
    console.error(`Event yüklenemedi: ${file}`, err);
  }
}
// index.js
const interactionHandler = require('./src/events/interactionCreate');

client.on('interactionCreate', async (interaction) => {
  interactionHandler.execute(interaction);
});

// Durum mesajları
const statuses = [
  { name: 'Created by Zwen', type: ActivityType.Playing },
  { name: 'Zwen was here', type: ActivityType.Listening },
  { name: '1 6 1', type: ActivityType.Watching },
  { name: 'Zwen', type: ActivityType.Competing },
  { name: 'Developed by Zwen', type: ActivityType.Watching },
  { name: 'çok eskide kaldın, ama hala dün gibisin', type: ActivityType.Playing },
];

client.on('ready', () => {
  console.log(`${client.user.tag} aktif!`);

  let i = 0;
  function updateStatus() {
    const status = statuses[i % statuses.length];
    client.user.setActivity(status.name, { type: status.type });
    i++;
    setTimeout(updateStatus, 10_000); // 10 saniyede bir değişir
  }
  updateStatus(); // Başlat
});

// Ses kanalına bağlan
const { joinVoiceChannel } = require('@discordjs/voice');
client.on('ready', () => {
  const channel = client.channels.cache.get(voicechannel);
  if (channel) {
    const VoiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator
    });
    console.log(`Ses kanalına bağlanıldı: ${channel.name}`);
  } else {
    console.log('Ses kanalı bulunamadı.');
  }
});

// Unhandled rejection ve uncaught exception hatalarını yakala
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});

// Botu başlat
client.login(token).catch(err => {
  console.error('Bot giriş hatası:', err);
});


//hosgeldin

client.on("guildMemberAdd", async (member) => {
  try {
    const totalMembers = member.guild.memberCount;
    const invites = await member.guild.invites.fetch();
    const inviteUsed = invites.find(invite => invite.uses > 0);

    const inviteLink = inviteUsed ? inviteUsed.url : "Bilinmiyor";
    const inviter = inviteUsed ? inviteUsed.inviter : "Bilinmiyor";

    const welcomeMessage = `<@${member.id}>, Sunucumuza Hoşgeldin! Seninle beraber **${totalMembers}** kişiye ulaştık! :tada: :tada:`;

    // Hoş geldin mesajına buton ekleme
    const welcomeButton = new ButtonBuilder()
      .setCustomId("greet_user") // Buton ID'si
      .setLabel("Selamla!") // Buton üzerine yazılacak metin
      .setStyle(ButtonStyle.Primary) // Butonun stili (Primary, Secondary, Danger, Link)
      .setDisabled(true); // Başlangıçta buton tıklanamaz (kendi kendisini selamlayamasın)

    const actionRow = new ActionRowBuilder().addComponents(welcomeButton);
    const config = require("./config.js");
    // Yeni üye geldiğinde otomatik rol ver
    const memberRoleId = config.memberrole; // Buraya kendi 'member_role_id' rol ID'nizi yazın
    const memberRole = member.guild.roles.cache.get(memberRoleId);
    if (memberRole) {
      await member.roles.add(memberRole);
    }

 
    
    // HG-BB log kanalına mesaj gönderme
    const logChannel = member.guild.channels.cache.get(config.invitelog);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Yeni Üye Katıldı!")
        .setDescription(`${member.user.tag} (${member.id}) sunucuya katıldı.`)
        .addFields(
          { name: "Toplam Üye Sayısı", value: `${totalMembers}`, inline: true },
          { name: "Davet Eden", value: `${inviter.tag}`, inline: true },
          { name: "Davet Linki", value: `[Davet Linki](${inviteLink})`, inline: true }
        )
        .setFooter({ text: `Yeni Üye: ${member.user.tag}` })
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] });
    } else {
      console.log('Log kanalı bulunamadı!');
    }

    // Hoş geldin mesajını yazma ve buton ekleme
    const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (welcomeChannel) {
      const message = await welcomeChannel.send({
        content: welcomeMessage,
        components: [actionRow],
      });

      // Butona tıklanması işlemi
      const filter = (interaction) => interaction.customId === "greet_user" && interaction.user.id === member.id;
      const collector = message.createMessageComponentCollector({
        filter,
        time: 20000, // Buton 20 saniye süreyle geçerli olacak
      });

      collector.on("collect", async (interaction) => {
        const channel = interaction.channel; // Kanalı interaction'dan alıyoruz
        if (channel.type === ChannelType.GuildText) {
          // Kendisini selamlamasına engel ol
          await interaction.reply({ content: `Selam, <@${member.id}>! Hoş geldin!`, ephemeral: true });
        } else {
          // Kanal metin tabanlı değilse farklı bir işlem
          await interaction.reply({ content: "Kanal metin tabanlı değil!", ephemeral: true });
        }

        // 20 saniye sonra hoş geldin mesajını sil
        setTimeout(() => {
          message.delete().catch((err) => console.error("Mesaj silinemedi:", err));
        }, 20000);
      });

      collector.on("end", () => {
        // Eğer 20 saniye içinde butona tıklanmazsa, mesaj otomatik silinir
        message.delete().catch((err) => console.error("Mesaj silinemedi:", err));
      });
    } else {
      console.log('Hoş geldin kanalı bulunamadı!');
    }
  } catch (error) {
    console.error("Hoş geldin mesajı hatası:", error);
  }

  const interactionCreate = require('./src/events/interactionCreate.js'); 
client.on('interactionCreate', interactionCreate.execute);

});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const selamlar = ["sa", "selam", "slm", "merhaba", "mrb", "hi", "hello"];
  const msgLower = message.content.toLowerCase();

  if (selamlar.some(s => msgLower === s || msgLower.startsWith(s + " "))) {
    const reply = await message.reply("Aleyküm selam aşkım, hoş geldin 😘");

    try {
      await message.react("<a:1921littletwinstarsheart:1347949915904671888>");
    } catch (err) {
      console.error("Tepki eklenirken hata:", err);
    }
  }

  // Diğer komutlar / sistemler burada olabilir...
});
