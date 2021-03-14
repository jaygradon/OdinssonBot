/**
 * Base class which defines logger expectations.
 */
class Logger {
  constructor() {}

  /**
   * Logs the given message.
   *
   * @param {string} message to log
   * @param {string} level of the message to log at e.g. Info, Error
   */
  log(message, level = 'info') {
    return;
  }
}

module.exports = Logger;
