/**
  * Command objects encapsulate a conversation between the bot and a single user.
  */
class Command {
  /**
   * @param {Logger} logger to log to.
   */
  constructor(logger) {
    // Name of the command (for logging and help purposes).
    this.name = "Unnamed";

    // Key to match messages against. Defaults to an unmatchable key.
    this.key = new RegExp("[^\d\D]", 'i');

    // Logging provider to log with.
    this.logger = logger;
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
   * @param {array} args from the message match result.
   */
  respond(message, args) {
    // Default to not responding
    return;
  }
}

module.exports = Command;
