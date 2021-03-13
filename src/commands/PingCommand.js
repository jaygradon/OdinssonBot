const Command = require('./Command.js');
const ConsoleLogger = require('../loggers/ConsoleLogger.js');

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
   * @param {Array} loggers to log to.
   */
  constructor(loggers = [new ConsoleLogger()]) {
    super(loggers);

    // Name of the command (for logging and help purposes).
    this.name = "Ping";

    // Key to match messages against. Defaults to an unmatchable key.
    this.key = new RegExp("^(ping|hey)$", 'i');
  }

  /**
   * Responds to the given message with a random 'pong-like' string .
   *
   * @param {Object} message from the discord server.
   * @param {Array} args from the message match result.
   */
  respond(message, args) {
    // Return a random string from pongStrings
    message.channel.send(pongStrings[Math.floor(Math.random() * (pongStrings.length - 1))]);
  }
}

module.exports = PingCommand;
