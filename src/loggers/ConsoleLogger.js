const Logger = require('./Logger.js');

/**
 * Logging provider that logs to console.
 */
class ConsoleLogger extends Logger {
  constructor() {
    super();
  }

  /**
   * Logs the given message to console.
   *
   * @param {string} message to log
   * @param {string} level of the message to log at e.g. Info, Error
   */
  log(message, level = 'info') {
    let now = new Date().toString();
    console.log(`${now} ${level.toUpperCase()} | ${message}`);
  }
}

module.exports = ConsoleLogger;
