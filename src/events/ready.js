module.exports = async function() {
  // wait registration
  await (time => new Promise(r => setTimeout(r, time)))(3000)
  // add command builder
  await require("fd-dcc").call(this, 'src/commands/')
  // create site
  // require("fd-dsite").call(this)
  // add desctiption manager
  // await require("fd-desc-changer").call(this)
  // change bot description
  this.description = process.env.npm_package_config_description || 'hi :3'
  // add and connect to db
  this.db = new (require("fd-redis-api"))(process.env.REDIS_URL)
  // listen error from redis and bridge to main event listener
  this.db.on('error', (function (e) {this.emit('error', e)}).bind(this))
  // connecting to database
  await this.db.connect()
  // calc count of users
  this.users_counter = this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
  // get env description
  let description_moded = process.env.npm_package_config_description || 'hi :3'
  // fetch cmds
  const moded_cmds = description_moded.matchAll(/\$[a-z]{1,32}/gm)
  // fetsh envs
  const moded_var = description_moded.matchAll(/\@[a-z]{1,32}/gm)
  // replace command
  for (const t of moded_cmds) {
    const c = t[0].slice(1)
    if (this.commands[c]) {
      description_moded = description_moded.replaceAll(t[0],`</${c}:${this.commands[c].id}>`)
    }
  }
  // replace vars
  for (const t of moded_var) {
    const c = t[0].slice(1)
    if (process.env[`npm_package_config_${c}`]) {
      description_moded = description_moded.replaceAll(t[0], process.env[`npm_package_config_${c}`])
    }
  }
  // change bot description
  this.description = description_moded.slice(0,400 - 3) + "..."
  // log statistic
  this.log(
    `🚀 Start as ${this.user.tag} at `, new Date,
    `\n📊 Servers:`,this.guilds.cache.size,` Users:`, this.users_counter || 0,` Commands:`, Object.keys(this.commands).length,
    `\n📜 Description: \n\t+ ${description_moded} \n\t- ${await this.description}`,
    `\n🗃️  Commands:`, Object.keys(this.commands)
  )
}