const { EmbedBuilder } = require("discord.js");
const config = require("../../config.js");

module.exports.sendLog = async function (type, options) {
  const client = require("../index"); // botun client'ını al
  const channelId = config.logKanallari[type];

  if (!channelId) return;

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(options.title || "Log")
    .setTimestamp();

  if (options.fields) embed.addFields(options.fields);
  if (options.image) embed.setImage(options.image);

  await channel.send({ embeds: [embed] });
};
