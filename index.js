const { Client, GatewayIntentBits, EmbedBuilder, AuditLogEvent } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const LOG_CHANNEL_ID = "1495022566644125806";

// 🧠 READY
client.once('clientReady', () => {
  console.log(`Bot hidup sebagai ${client.user.tag}`);
});

// 🗑️ DELETE LOG
client.on('messageDelete', async (message) => {
  if (!message.guild || message.author?.bot) return;

  const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;

  let executor = "Tidak diketahui";

  try {
    const logs = await message.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageDelete
    });

    const log = logs.entries.first();
    if (log && log.target.id === message.author.id) {
      executor = log.executor;
    }
  } catch {}

  const embed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle("🗑️ Pesan Dihapus")
    .setThumbnail(message.author.displayAvatarURL())
    .addFields(
      { name: "User", value: `${message.author}`, inline: true },
      { name: "Channel", value: `${message.channel}`, inline: true },
      { name: "Dihapus oleh", value: `${executor}`, inline: true },
      { name: "Isi", value: message.content || "(kosong)" }
    )
    .setTimestamp();

  logChannel.send({ embeds: [embed] });
});

// ✏️ EDIT LOG
client.on('messageUpdate', (oldMsg, newMsg) => {
  if (!oldMsg.guild || oldMsg.author?.bot) return;
  if (oldMsg.content === newMsg.content) return;

  const logChannel = oldMsg.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setColor(0xFFFF00)
    .setTitle("✏️ Pesan Diedit")
    .setThumbnail(oldMsg.author.displayAvatarURL())
    .addFields(
      { name: "User", value: `${oldMsg.author}`, inline: true },
      { name: "Channel", value: `${oldMsg.channel}`, inline: true },
      { name: "Sebelum", value: oldMsg.content || "(kosong)" },
      { name: "Sesudah", value: newMsg.content || "(kosong)" }
    )
    .setTimestamp();

  logChannel.send({ embeds: [embed] });
});

// 👤 ROLE LOG
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const logChannel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;

  const addedRoles = newMember.roles.cache.filter(
    role => !oldMember.roles.cache.has(role.id)
  );

  if (addedRoles.size === 0) return;

  let executor = "Tidak diketahui";

  try {
    const logs = await newMember.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberRoleUpdate
    });

    const log = logs.entries.first();
    if (log) executor = log.executor;
  } catch {}

  addedRoles.forEach(role => {
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle("➕ Role Ditambahkan")
      .setThumbnail(newMember.author.displayAvatarURL())
      .addFields(
        { name: "User", value: `${newMember.user}`, inline: true },
        { name: "Role", value: `${role}`, inline: true },
        { name: "Diberikan oleh", value: `${executor}`, inline: true }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
});

client.login(process.env.TOKEN);