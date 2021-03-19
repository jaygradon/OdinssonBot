const filesystem = require('fs');
const path = require('path');

/**
 * Acts as a simplified database using a local Json file.
 */
class JsonDatabase {
  /**
   * @param {string} database file to be used as json database. Will be created if it doesn't exist.
   */
  constructor(database, schema, logger ) {
    this.logger = logger;
    this.databaseLocation = database;

    if (!filesystem.existsSync(this.databaseLocation)) {
      filesystem.mkdirSync(this.databaseLocation, { recursive: true });
    }

    if (!filesystem.existsSync(this.databaseLocation)) {
      filesystem.writeFileSync(this.databaseLocation, JSON.stringify(schema, null, 2));
    }

    this.database = require(this.databaseLocation);
  }

  /**
   * Reads data from the database.
   *
   * @param {string} key of data to read.
   */
  read(key) {
    return this.database[key];
  }

  /**
   * Writes data to the database, accessible by key.
   *
   * @param {string} key of data to read.
   * @param {object} data object to write.
   */
  write(key, data) {
    this.database[key] = data;
    // TODO make this smarter than writing the whole file back
    filesystem.writeFileSync(this.databaseLocation, JSON.stringify(this.database, null, 2));
  }
}

module.exports = JsonDatabase;
