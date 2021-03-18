const execute = require('child_process').exec;

class ValheimWorldSaveHelper {
  /**
   * @param {string} valheimServerScript path
   */
  constructor(valheimServerScript = "/opt/Dedicated_Valheim_Server_Script/menu.sh") {
    this.valheimServerScript = valheimServerScript;
  }

  /**
   * Backs up the valheim server world.
   * Utilizes the Dedicated Valheim server bash scripts.
   */
  async backup() {
    return new Promise((resolve, reject) => {
      execute(`echo 'y' | ${this.valheimServerScript} backup`, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout, stderr);
        }
      });
    });
  }
}

module.exports = ValheimWorldSaveHelper;
