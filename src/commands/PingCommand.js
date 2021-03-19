const Command = require('./Command.js');

const pongStrings = [
  "I sail the seas of Valhalla!",
  "ODIIIIINN!",
  "Eikthyr, please stop your rambling..."
]

/**
 * Responds to simple users pings with pre-defined set of messages.
 */
class PingCommand extends Command {
  /**
   * @param {Logger} logger used to log.
   */
  constructor(logger) {
    super(logger);

    // Name of the command (for logging and help purposes).
    this.name = "Ping";

    // Key to match messages against. Defaults to an unmatchable key.
    this.key = new RegExp(".*", 'i');
  }

  /**
   * Responds to the given message with a random 'pong-like' string .
   *
   * @param {Object} message from the discord server.
   * @param {array} args from the message match result.
   */
  respond(message, args) {
    // Return a random string from pongStrings
    message.channel.send(pongStrings[Math.floor(Math.random() * (pongStrings.length - 1))]);
  }
}

module.exports = PingCommand;
