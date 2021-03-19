const ValheimWorldSaveHelper = require('../helpers/ValheimWorldSaveHelper.js')

const cron = require('node-cron');

class ValheimWorldBackupJob {
  /**
   * @param {Logger} logger used to log.
   */
  constructor(logger) {
    // Logging provider to log with
    this.logger = logger;

    // Helper used for Valheim save manipulation
    this.saveHelper = new ValheimWorldSaveHelper(this.logger);
  }

  /**
   * Schedules valheim world backups via a list of cron schedules.
   *
   * @param {array} schedules defined as a list of cron schedules.
   */
  start(schedules) {
    for (const scheduleKey in schedules) {
      const schedule = schedules[scheduleKey];
      this.logger.log(`Scheduling backup: ${schedule}`);
      cron.schedule(schedule, async () => {
        try {
          this.logger.log('Making a backup!');
          this.saveHelper.backup();
        } catch (error) {
          this.logger.log(error);
        }
      });
    }
  }
}

module.exports = ValheimWorldBackupJob;
