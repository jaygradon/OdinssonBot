const Logger = require('./Logger.js');

const filesystem = require('fs');
const path = require('path');

/**
 * Logging provider that logs to file.
 */
class FileLogger extends Logger {
  constructor(file) {
    super();
    this.file = file;

    if (!filesystem.existsSync(path.dirname(this.file))) {
      filesystem.mkdirSync(path.dirname(this.file), { recursive: true });
    }

    if (!filesystem.existsSync(this.file)) {
      filesystem.writeFileSync(this.file, '');
    }
  }

  /**
   * Logs the given message to specified file.
   *
   * @param {string} message to log.
   * @param {string} level of the message to log at e.g. Info, Error.
   */
  log(message, level = 'info') {
    let now = new Date().toString();
    filesystem.appendFileSync(this.file, `${now} ${level.toUpperCase()} | ${message}\n`);
  }
}

module.exports = FileLogger;
