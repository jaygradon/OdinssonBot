const execute = require('child_process').exec;

class ValheimWorldSaveHelper {
  /**
   * @param {string} valheimServerScript path
   */
  constructor(logger, valheimServerScript = "/opt/Dedicated_Valheim_Server_Script/menu.sh") {
    this.valheimServerScript = valheimServerScript;
    this.logger = logger;
  }

  /**
   * Backs up the valheim server world.
   * Utilizes the Dedicated Valheim server bash scripts.
   */
  async backup() {
    execute(`echo 'y' | ${this.valheimServerScript} backup`, (err, stdout, stderr) => {
      if (err) {
        this.logger.log(err, 'error');
      } else {
        this.logger.log(stdout);
        this.logger.log(stderr, 'error');
      }
    });
  }
}

module.exports = ValheimWorldSaveHelper;
