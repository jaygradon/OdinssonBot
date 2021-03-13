const filesystem = require('fs');
const path = require('path');
const Command = require('../commands/Command.js');
const ConsoleLogger = require('../loggers/ConsoleLogger.js');

class JavascriptLoader {
  /**
   * @param {Array} loggers to log to.
   */
  constructor(loggers = [new ConsoleLogger()]) {
    this.commands = []

    // Logging providers to log with.
    this.loggers = loggers;
  }

  /**
   * Recursively loads javascript command objects in a given file into a list returned of commands.
   *
   * @param {string} directory to load the javascript command object from.
   */
  load(directory) {

    const commands = []

    filesystem.readdir(directory, (_, files) => {
      files.forEach((file) => {
        if (file.match(/\.js$/)) {
          delete require.cache[require.resolve(path.join(directory, file))];
          let commandFile = require(path.join(directory, file));
          this.log('info', `Found: ${commandFile.name}`);
          if (this.extendsCommand(commandFile)) {
            let command = new commandFile(this.loggers);
            commands.push(command);
            this.log('info', `Loaded: ${command.name}`);
          } else {
            this.log('info', `Not Loading: ${commandFile.name}`);
          }
        }

        if (filesystem.statSync(path.join(directory, file)).isDirectory()) {
          this.load(path.join(directory, file));
        }
      });
    });

    return commands;
  }

  extendsCommand(command) {
    if (command.toString().split('\n')[0].includes(`extends ${Command.name}`)) {
      return true;
    }

    return false;
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

module.exports = JavascriptLoader;
