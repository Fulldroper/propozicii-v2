module.exports.info = {
  "name": "offer",
  "type": 1,
  "dm_permission": false,
  "description": "Створити пропозицію",
  "options": [{
    "name": "text",
    "description": "Текст пропозиції (мінімум 15 символів)",
    "type": 3,
    "min_length": 15,
    "max_length": 741,
    "required": true
  },
  {
    "name": "image",
    "description": "Додадкове зображення до пропозиції",
    "type": 11,
    "channel_types": 0,
    "required": false
  }]
}

const { WebhookClient: whc , AttachmentBuilder: attach} =  require("discord.js")
const { default: axios} = require("axios")
const exploit = "||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||_ _ _ _ _ _ _ "
module.exports.run = async function (interaction) {
  // Check if the user who triggered the interaction has the "Administrator" permission
  if (!interaction.member.permissions.serialize().Administrator) {
    // If not, send a reply indicating that the command is only available to administrators
    interaction.reply({ content: 'Команда дозволена тільки адміністрації, ви маєте мати право `ADMINISTRATOR`', ephemeral: true })
    return
  }
  // import data from database
  const {
    channel = false, rate_limit = 0, webhook = false, mention = false, tags = false
  } = await this.db.get(`${this.collection}:${interaction.guildId}`) || {}
  // check if channel is created
  if (!channel) {
    interaction.reply({ 
      content: '❌ Канал для пропозицій за замовчуванням не встановлено. Виконайте команду `/init` (тільки для адміністрації)',
      ephemeral: true 
    }).catch(e => this.emit('error', e));
    return
  }
  const ch = await interaction.guild.channels.fetch(channel) || false
  // check if channel is exist
  if (!ch) {
    interaction.reply({ 
      content: '❌ Канал для пропозицій не існує. Виконайте команду `/init` (тільки для адміністрації)',
      ephemeral: true 
    }).catch(e => this.emit('error', e));
    return
  }

  // @@@ rate_limit
  // import values from command
  let { value: content } = interaction.options.get("text") || {}
  const { id:uid, avatar: uavatar, username, discriminator: utag} = interaction.member.user
  const avatarURL = `https://cdn.discordapp.com/avatars/${uid}/${uavatar}.png`
  // check on mention
  if (mention) {
    // if have mention add to text
    content = `<@${mention}>, ` + content
  }
  // create webhook
  const whook = new whc({url: webhook})
  // send offer
  const message = {
    "threadName": content.slice(0, 100 - 3) + '...',
    avatarURL, content, username: username + utag,
    "attachments": [],
    "components": [{
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 3,
          // "emoji": { "name": "✅" },
          "label": "Схвалити",
          "custom_id": `offer:accept:${uid}`
        }, {
          "type": 2,
          "style": 4,
          // "emoji": { "name": "❌" },
          "label": "Відхилити",
          "custom_id": `offer:deny:${uid}`
        }
      ]
    }],
  }
  // parse and add media
  const media = interaction.options.get("image") || false
  // if have attachment add to message
  if (media) {
    message.content += exploit + media.attachment.url
  }
  const { id: whookId } = await whook.send(message)
  // get thread
  const thread = await ch.threads.fetch(whookId)
  // add thread tag
  // set delay archive
  thread.edit({
    appliedTags: [tags.wait],
    autoArchiveDuration: 10080,
    reason: "Встановлення авто-архівування на 1 тиждень, та додання тегу"
  })
  // react on message
  await axios({
    method: 'PUT',
    url: `https://discord.com/api/v9/channels/${whookId}/messages/${whookId}/reactions/✅/@me?location=Forum Toolbar&burst=false`,
    headers:{
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }).catch(e => this.emit('error', e));
  await axios({
    method: 'PUT',
    url: `https://discord.com/api/v9/channels/${whookId}/messages/${whookId}/reactions/❌/@me?location=Forum Toolbar&burst=false`,
    headers:{
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }).catch(e => this.emit('error', e));
  // aswer to req
  interaction.reply({
    content: `Ваша пропозиція успішно створена [ПРОПОЗИЦІЯ](https://canary.discord.com/channels/${interaction.guildId}/${whookId}/${whookId})`,
    ephemeral: true
  })
}
// connect buttons
module.exports.component = async function (interaction) {
  // import data from database
  const {
    channel = false, tags = false, alert = false, webhook = false
  } = await this.db.get(`${this.collection}:${interaction.guildId}`) || {}
  // parce type of command
  const type = interaction.meta[1]
  // check if channel is exist
  const ch = await interaction.guild.channels.fetch(channel) || false
  if (!ch) {
    interaction.reply({ 
      content: '❌ Канал для пропозицій не існує. Виконайте команду `/init` (тільки для адміністрації)',
      ephemeral: true 
    }).catch(e => this.emit('error', e));
    return
  }
  // get thread
  const thread = await ch.threads.fetch(interaction.channelId)
  // change message (clear buttons)
  // add thread tag & archive
  const whook = new whc({url: webhook})
  await whook.editMessage(interaction.message.id, {
    content: interaction.message.content,
    threadId: interaction.message.id,
    username: interaction.meta[2],
    avatarURL: `https://cdn.discordapp.com/avatars/${interaction.meta[2]}/${interaction.message.author.avatar}.png`,
    components: []
  }) 
  await thread.edit({
    archived: true,
    appliedTags: [tags[type]],
    reason: `змінення статусу пропозиції на '${type}' та архівування`
  })
  // alert if can
  if (alert) {
    const usr = await interaction.guild.members.fetch(interaction.meta[2])
    console.log(usr);
    usr.send(`Ваша пропозиція була [${type === 'accept' ?  'прийнята' : 'відхилена'}](https://canary.discord.com/channels/${interaction.guildId}/${interaction.message.id}/${interaction.message.id})`)
    .catch(e => this.emit('error', e));
  }
  // close interaction
  interaction.deferUpdate()
}
// @@@ add admin coments