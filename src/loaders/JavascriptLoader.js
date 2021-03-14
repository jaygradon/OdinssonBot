const Command = require('../commands/Command.js');

const filesystem = require('fs');
const path = require('path');

class JavascriptLoader {
  /**
   * @param {Logger} logger to log to.
   */
  constructor(logger) {
    this.commands = []

    // Logging providers to log with.
    this.logger = logger;
  }

  /**
   * Recursively loads javascript command objects in a given file into a list returned of commands.
   *
   * @param {string} directory to load the javascript command objects from.
   */
  load(directory) {

    const commands = []

    filesystem.readdir(directory, (_, files) => {
      files.forEach((file) => {
        if (file.match(/\.js$/)) {
          delete require.cache[require.resolve(path.join(directory, file))];
          let commandFile = require(path.join(directory, file));
          this.logger.log(`Found: ${commandFile.name}`);
          if (this.extendsCommand(commandFile)) {
            let command = new commandFile(this.logger);
            commands.push(command);
            this.logger.log(`Loaded: ${command.name}`);
          } else {
            this.logger.log(`Not Loading: ${commandFile.name}`);
          }
        }

        if (filesystem.statSync(path.join(directory, file)).isDirectory()) {
          this.load(path.join(directory, file));
        }
      });
    });

    return commands;
  }

  /**
   * Tests whether the given object extends the Command class.
   *
   * @param {Command} command
   */
  extendsCommand(command) {
    if (command.toString().split('\n')[0].includes(`extends ${Command.name}`)) {
      return true;
    }

    return false;
  }
}

module.exports = JavascriptLoader;
