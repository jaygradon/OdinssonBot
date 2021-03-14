const cron = require('node-cron');
const ValheimWorldSaveUtility = require('../utilities/ValheimWorldSaveUtility.js')

class ValheimWorldBackupJob {
  /**
   * @param {Logger} logger to log to.
   */
  constructor(logger) {
    // Logging provider to log with
    this.logger = logger;

    // Utility used for Valheim save manipulation
    this.saveUtility = new ValheimWorldSaveUtility();
  }

  /**
   * Schedules valheim world backups via a list of cron schedules.
   *
   * @param {array} schedules defined as a list of cron schedules.
   */
  start(schedules) {
    schedules.forEach((schedule) => {
      this.logger.log(`Scheduling backup: ${schedule}`);
      cron.schedule(schedule, () => {
        this.saveUtility.backup()
        .then((stdout, stderr) => {
          this.logger.log(stdout);
          this.logger.log(stderr);
        })
        .catch((err) => {
          this.logger.log(err);
        });
      });
    });
  }
}

module.exports = ValheimWorldBackupJob;
