const execute = require('child_process').exec;

class ValheimWorldSaveUtility {
  constructor(valheimServerScript = "/opt/Dedicated_Valheim_Server_Script/menu.sh") {
    this.valheimServerScript = valheimServerScript;
  }

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

module.exports = ValheimWorldSaveUtility;
