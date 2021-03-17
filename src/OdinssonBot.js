const Discord = require('discord.js');
const ValheimWorldBackupJob = require('./jobs/ValheimWorldBackupJob.js');


/*
 *  Odinsson Bot for Discord. Assists in the running of a dedicated Valheim server based on https://github.com/Nimdy/Dedicated_Valheim_Server_Script and AWS EC2.
 */
class OdinssonBot {
  /**
   * @param {Object} config for running bot.
   * @param {array} commands to match and execute against messages.
   * @param {Logger} logger to log to.
   */
  constructor(config, commands, logger, database) {
    // Initialize bot for interacting with Discord
    this.bot = new Discord.Client();

    // Config for bot behaviour and connecting to Discord
    this.config = config;

    // Top level commands that can be executed via discord messages
    this.commands = commands;

    // Logging provider to log with
    this.logger = logger;

    //
    this.database = database;
    this.guilds = this.database.read('guilds');

    // Instantiating jobs
    this.valheimWorldBackupJob = new ValheimWorldBackupJob(this.logger);
  }

  /**
   * Prepares Odinsson for the journey ahead.
   * (Starts scheduled jobs and signal handling).
   */
  prepare() {
    this.logger.log('Odinsson is rallying warriors of the 10th world!')

    // Start job to backup valheim world at scheduled times
    if (this.config.schedules.backups.length > 0) {
      this.valheimWorldBackupJob.start(this.config.schedules.backups);
    }

    process.on('SIGTERM', () => {
      this.logger.log('Odinsson is off to the mead hall!');
      const statusEmbed = new Discord.MessageEmbed()
        .setColor('#D73A49')
        .setTitle("Facepunch is offline.")
        .attachFiles("./images/valheim-art_256x308.png")
        .setImage("attachment://valheim-art_256x308.png");
      sendStatusEmbed(this.bot.guilds.cache, statusEmbed)
        .then((resolve, reject) => {
          this.logger.log('Odinsson is face down in mead!');
          process.exit(0);
        });
    });
  }

  /**
   * Takes in an array of commands and add it to the bots top level commands.
   *
   * @param {Command[]} commands to be executed on messages received.
   */
  load(commands) {
    this.commands.push.apply(this.commands, commands);
  }

  /**
   * Listens for and responds to messages in discord.
   */
  listen() {
    this.logger.log('Odinsson is lifting the sails!');

    // Wait for bot to be ready to process messages
    this.bot.once('ready', () => {
      this.logger.log('Odinsson is sailing the seas of Valhalla!');
    });

    // listen for messages
    this.bot.on('message', (message) => {
      // Bots are unworthy of Odinsson (and can result in infinite bot message loops)
      if (message.author.bot) {
        return;
      }

      // Remember any new guilds - TODO include guild forget command
      if (!this.guilds.includes(message.guild.id)) {
        this.guilds.push(message.guild.id);
        this.database.write('guilds', this.guilds);
      }

      // Attempt to interpret and respond to messages that mention Odinsson
      if (message.mentions.users.has(this.config.secrets.client_id)) {
        let foundMatch = false;
        let content = message.content.replace(`<@!${this.config.secrets.client_id}>`, '').trim();
        this.commands.every((command) => {
          let args;
          if (args = command.match(content)) {
            this.logger.log(`Matched ${command.name}: "${content}"`);
            command.respond(message, args);
            foundMatch = true;
            return false; // Stop iterating
          }
          return true; // Keep iterating
        });
        if (!foundMatch) {
          this.logger.log(`Failed to match: "${content}"`);
        }
      }
    });

    this.bot.login(this.config.secrets.token)
      .then(() => {
        const statusEmbed = new Discord.MessageEmbed()
          .setColor('#28A745')
          .setTitle("Facepunch is online!")
          .attachFiles("./images/valheim-art_256x308.png")
          .setImage("attachment://valheim-art_256x308.png");
        sendStatusEmbed(this.bot.guilds.cache, statusEmbed);
      });
  }

  /*********** HELPERS :) ***********/

  /**
   * Forces Odinsson to wait.
   *
   * @param {number} ms to sleep for.
   */
  sleep(ms) {
    this.logger.log(`Odinsson is sleeping off ${ms / 1000} mead(s)...`);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sends or updates a pinned embedded message to discord.
   *
   * @param {array} guilds
   * @param {MessageEmbed} embed to send to the guild channel. Will update previously pinned embed if found.
   */
  sendStatusEmbed(guilds, embed) {
    this.logger.log('Odinsson is blowing the horns of Valheim!');
    return new Promise((resolve, reject) => {
      guilds.forEach((guild) => {
        // Get the first channel in the guild
        this.logger.log(`Found guild: ${guild}, ${guild.id}`);
        // TODO add command to set channel that should be used for the guild
        const channel = guild.channels.cache.filter((channel) => channel.isText()).find(channel => channel.position === 0);
        this.logger.log(`Found channel: ${channel.name}, ${channel.id}`);

        channel.messages.fetchPinned()
          .then((messages) => {
            this.logger.log(`Found ${messages.size} pins`);
            if (messages.size > 0 ) {
              // Fetch the pinned message made by Odinsson. For now, we assume Odinsson will only pin the server status
              const message = messages.filter(message => message.author.id = this.config.secrets.client_id).first();
              if (message) {
                this.logger.log(`Found pinned message: ${message.id}`);
                message.edit(embed);
                resolve();
              } else {
                channel.send(embed)
                  .then((message) => {
                    message.pin();
                    this.logger.log(`Sent new message: ${message.id}`);
                    resolve();
                  });
              }
            // TODO consider removing code duplication
            } else {
              channel.send(embed)
                .then((message) => {
                  message.pin();
                  this.logger.log(`Sent new message: ${message.id}`);
                  resolve();
                });
            }
          });
      });
    });
  }
}

module.exports = OdinssonBot;
