const Discord = require('discord.js');

const ValheimWorldBackupJob = require('./jobs/ValheimWorldBackupJob.js');
const ValheimServerStatusEmbedHelper = require('./helpers/ValheimServerStatusEmbedHelper.js');

/*
 *  Odinsson Bot for Discord. Assists in the running of a dedicated Valheim server based on https://github.com/Nimdy/Dedicated_Valheim_Server_Script and AWS EC2.
 */
class OdinssonBot {
  /**
   * @param {Object} config for running bot.
   * @param {array} commands to match and execute against messages.
   * @param {Logger} logger used to log.
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

    // Database for remembering data
    this.database = database;

    // Instantiating jobs
    this.worldBackupJob = new ValheimWorldBackupJob(this.logger);

    // Instantiating helpers
    this.embedHelper = new ValheimServerStatusEmbedHelper(this.config, this.logger);
  }

  /**
   * Prepares Odinsson for the journey ahead.
   * (Starts scheduled jobs and signal handling).
   */
  prepare() {
    this.logger.log('Odinsson is rallying warriors of the 10th world!')

    // Start job to backup valheim world at scheduled times
    if (this.config.schedules.backups.length > 0) {
      this.worldBackupJob.start(this.config.schedules.backups);
    }

    // On process termination, update discord with a server offline message
    process.on('SIGTERM', async () => {
      this.logger.log('Odinsson is off to the mead hall!');
      try {
        await this.embedHelper.sendOfflineStatus(this.bot.guilds.cache);
        this.logger.log('Odinsson is face down in mead!');
      } catch (error) {
        this.logger.log('Odinsson\'s mead has soured!');
        this.logger.log(error, 'error');
      }

      try {
        this.bot.destroy();
        this.logger.log('Odinsson is sleeping in the mead hall!');
      } catch (error) {
        this.logger.log('Odinsson\'s mead has leaked!');
        this.logger.log(error, 'error');
      }

      // make sure to always exit the process!
      process.exit(0);
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
      this.embedHelper.sendOnlineStatus(this.bot.guilds.cache);
    });

    // listen for messages
    this.bot.on('message', (message) => {
      // Bots are unworthy of Odinsson (and can result in infinite bot message loops)
      if (message.author.bot) {
        return;
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
            return false; // Found match, stop iterating
          }
          return true; // Match not yet found, keep iterating
        });
        if (!foundMatch) {
          this.logger.log(`Failed to match: "${content}"`);
        }
      }
    });

    this.bot.login(this.config.secrets.token);
  }
}

module.exports = OdinssonBot;
