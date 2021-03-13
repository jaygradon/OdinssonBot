const Discord = require('discord.js');
const ConsoleLogger = require('./loggers/ConsoleLogger.js');

/*
 *  Odinsson Bot for Discord. Assists in the running of a Valheim server based on https://github.com/Nimdy/Dedicated_Valheim_Server_Script and AWS EC2.
 */
class OdinssonBot {
  /**
   * @param {Object} config for running bot.
   * @param {Array} commands to match and execute against messages.
   * @param {Array} loggers to log to.
   */
  constructor(config, commands, loggers = [new ConsoleLogger()]) {
    // Initialize bot for interacting with Discord
    this.bot = new Discord.Client();

    // Config for bot behaviour and connecting to Discord
    this.config = config;

    // Top level commands that can be executed via discord messages
    this.commands = commands;

    // Logging providers to log with.
    this.loggers = loggers;
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
    this.log('info', 'Odinsson is lifting the sails!');
    // Wait for bot to be ready to process messages
    this.bot.once('ready', () => {
      this.log('info', 'Odinsson is sailing the seas of Valhalla!');
    });

    // listen for messages
    this.bot.on('message', (message) => {
      // Bots are unworthy of Odinsson (and can result in infinite bot message loops)
      if (message.author.bot) {
        return;
      }

      if (message.mentions.users.has(this.config.client_id)) {
        var messageContent = message.content.replace(`<@${this.config.client_id}>`, '').trim();
        this.commands.every((command) => {
          let args;
          if (args = command.match(messageContent)) {
            this.log('info', `Matched command ${command.name} with message: ${message.content}`);
            command.respond(message, args);
            return false; // Stop iterating
          }
          return true; // Keep iterating
        });
        this.log('info', `Failed to match message: ${message.content}`);
      }
    });

    this.bot.login(this.config.token);
  }

  /**
   * Logs the given message to all loggers.
   *
   * @param {string} level of the message to log at e.g. Info, Error
   * @param {string} message to log
   */
  log(level, message) {
    this.loggers.forEach((logger) =>  {
      logger.log(level, message);
    });
  }
}

module.exports = OdinssonBot;
