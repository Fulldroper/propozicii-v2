module.exports.info = {
  "name": "offer",
  "type": 1,
  "dm_permission": false,
  "description": "Створити пропозицію",
  "options": [{
    "name": "text",
    "description": "Текст пропозиції",
    "type": 3,
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

const { WebhookClient: whc } =  require("discord.js")
const { default: axios} = require("axios")

module.exports.run = async function (interaction) {
  // import data from database
  const {
    channel = false, rate_limit = 0, webhook = false, mention = false
  } = await this.db.get(`${this.collection}:${interaction.guildId}`) || {}
  console.log(await this.db.get(`${this.collection}:${interaction.guildId}`));
  // check if channel is created
  if (!channel) {
    interaction.reply({ 
      content: '❌ Канал для пропозицій за замовчуванням не встановлено. Виконайте команду `/init` (тільки для адміністрації)',
      ephemeral: true 
    }).catch(e => this.emit('error', e));
    return
  }
  // import values from command
  let { value: content } = interaction.options.get("text") || {}
  const { id:uid, avatar: uavatar, username, discriminator: utag} = interaction.member.user
  const avatarURL = `https://cdn.discordapp.com/avatars/${uid}/${uavatar}.png`
  // check on mention
  if (mention) {
    // if have mention add to text
    content = `<@${mention}>, ` + content
  }
  // @@@
  const img = interaction.options.get("image")
  // create webhook
  const whook = new whc({url: webhook})
  // send offer
  const { id: whookId } = await whook.send({
    "threadName": "new thread",
    avatarURL, content, username,
    "components": [{
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 3,
          "emoji": { "name": "✅" },
          "label": "Схвалити",
          "custom_id": "accept"
        }, {
          "type": 2,
          "style": 4,
          "emoji": { "name": "❌" },
          "label": "Відхилити",
          "custom_id": "deny"
        }
      ]
    }],
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
    content: `Ваша пропозиція успішно створена [ПРОПОЗИЦІЯ](https://canary.discord.com/channels/${channel}/${whookId}/${whookId})`,
    ephemeral: true
  })
}
// @@@ change tag https://discord.js.org/#/docs/discord.js/main/typedef/ThreadEditOptions
// @@@ parse and add media
// @@@ connect buttons
// @@@ rate_limit