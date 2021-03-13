/**
 * Logging provider that logs to console.
 */
class ConsoleLogger {
  constructor() {}

  /**
   * Logs the given message to console.
   *
   * @param {string} level of the message to log at e.g. Info, Error
   * @param {string} message to log
   */
  log(level = 'info', message) {
    let now = new Date().toString();
    console.log(`${now} ${level.toUpperCase()} | ${message}`);
  }
}

module.exports = ConsoleLogger;
