const Discord = require('discord.js');
const ValheimWorldBackupJob = require('./jobs/ValheimWorldBackupJob.js');

/*
 *  Odinsson Bot for Discord. Assists in the running of a Valheim server based on https://github.com/Nimdy/Dedicated_Valheim_Server_Script and AWS EC2.
 */
class OdinssonBot {
  /**
   * @param {Object} config for running bot.
   * @param {array} commands to match and execute against messages.
   * @param {Logger} logger to log to.
   */
  constructor(config, commands, logger) {
    // Initialize bot for interacting with Discord
    this.bot = new Discord.Client();

    // Config for bot behaviour and connecting to Discord
    this.config = config;

    // Top level commands that can be executed via discord messages
    this.commands = commands;

    // Logging provider to log with
    this.logger = logger;

    // Instantiating jobs
    this.ValheimWorldBackupJob = new ValheimWorldBackupJob(this.logger);
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
   * Prepares the server for upcoming Valheim sessions.
   */
  prepare() {
    this.logger.log('Odinsson is remembering tales of the 10th world!')
    this.ValheimWorldBackupJob.start(this.config.backup_schedules.split(','));
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

      if (message.mentions.users.has(this.config.client_id)) {
        let foundMatch = false;
        let content = message.content.replace(`<@!${this.config.client_id}>`, '').trim();
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

    this.bot.login(this.config.token);
  }
}

module.exports = OdinssonBot;
