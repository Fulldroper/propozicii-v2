// aplication runner
(async () => {
  // env configuration
  process.env.NODE_ENV || await require('dotenv').config({ debug: false })
  // req discord framework
  const { Client, GatewayIntentBits } = await require('discord.js');
  const importer = await require('fd-importer');
  // init discord bot && rest obj
  const bot = new Client({ intents: [
    GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildIntegrations
  ] });
  // set datebase collection name
  bot.collection = process.env.npm_package_name
  // log env
  // process.env.DEBUG && console.log(process.env);
  // add event listeners
  let temp = await importer('src/events/', {
    debug: process.env.DEBUG
  })
  for (const event in temp) {
    bot.on(event, temp[event])
  }
  // add custom methods
  temp = await importer('src/methods/', {
    debug: process.env.DEBUG
  })
  for (const method in temp) {
    bot[method] = temp[method]
  }
  // clear data
  delete temp
  // run bot
  bot.login(process.env.TOKEN)
})()