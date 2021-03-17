const Logger = require('./Logger.js');

/**
 * Logging provider that logs to a provided array of logging providers.
 */
class MasterLogger extends Logger {
  /**
   * @param {array} loggers to log to.
   */
  constructor(loggers = [new ConsoleLogger()]) {
    super();

    // Logging providers to log with
    this.loggers = loggers;
  }

  /**
   * Logs the given message to all loggers.
   *
   * @param {string} message to log.
   * @param {string} level of the message to log at e.g. Info, Error.
   */
  log(message, level='info') {
    this.loggers.forEach((logger) =>  {
      logger.log(message, level);
    });
  }
}

module.exports = MasterLogger;
