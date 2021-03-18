const cron = require('node-cron');
const ValheimWorldSaveHelper = require('../helpers/ValheimWorldSaveHelper.js')

class ValheimWorldBackupJob {
  /**
   * @param {Logger} logger used to log.
   */
  constructor(logger) {
    // Logging provider to log with
    this.logger = logger;

    // Helper used for Valheim save manipulation
    this.saveHelper = new ValheimWorldSaveHelper();
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
        this.saveHelper.backup()
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
