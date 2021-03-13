const ConsoleLogger = require('../loggers/ConsoleLogger.js');

/**
  * Command objects encapsulate a conversation between the bot and a single user.
  */
class Command {
  /**
   * @param {Array} loggers to log to.
   */
  constructor(loggers = [new ConsoleLogger()]) {
    // Name of the command (for logging and help purposes).
    this.name = "Unnamed";

    // Key to match messages against. Defaults to an unmatchable key.
    this.key = new RegExp("[^\d\D]", 'i');

    // Logging providers to log with. Always logs to console.
    this.loggers = loggers;
  }

  /**
   * Checks whether this command matches (ie. should respond to) the message.
   *
   * @param {string} message Message to test for match with this command.
   */
  match(message) {
    return this.key.test(message);
  }

  /**
   * Responds to the given message.
   *
   * @param {Object} message from the discord server.
   * @param {Array} args from the message match result.
   */
  respond(message, args) {
    // Default to not responding
    return;
  }
}

module.exports = Command;
