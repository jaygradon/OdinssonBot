const Discord = require('discord.js');

const fetch = require("node-fetch");
const filesystem = require('fs');

/**
 * A helper to create, send, and manage Valheim server status embeds sent to discord.
 */
class ValheimServerStatusEmbedHelper {
  /**
   * @param {object} config used to create messages.
   * @param {Logger} logger used to log.
   */
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Sends a new online status message to the passed guilds. Message is pinned.
   *
   * Previously pinned message will be deleted to prevent build up.
   *
   * @param {array} guilds to send online status to.
   */
  sendOnlineStatus(guilds) {
    this.logger.log('Odinsson is blowing the horns of Valheim!');
    return new Promise((resolve, reject) => {
      guilds.forEach((guild) => {
        // Get the first channel in the guild
        this.logger.log(`Found guild: ${guild.name}, ${guild.id}`);
        // TODO add command to set channel that should be used for the guild
        const channel = guild.channels.cache.filter((channel) => channel.isText()).find(channel => channel.position === 0);
        this.logger.log(`Found channel: ${channel.name}, ${channel.id}`);

        // Delete previous embed as embedding new images is not supported
        this.deleteEmbed(channel)
          .then(() => {
            // Send new embedded status
            this.makeOnlineEmbed()
              .then((embed) => {
                this.sendEmbed(channel, embed)
                  .then(() => {
                    resolve();
                  });
              });
          });
      });
    });

  }

  /**
   * Sends an offline status message to passed guilds. Will edit an existing online status message if it exists.
   *
   * @param {array} guilds to send offline status to.
   */
  sendOfflineStatus(guilds) {
    this.logger.log('The path to Valheim is closing!');
    return new Promise((resolve, reject) => {
      guilds.forEach((guild) => {
        // Get the first channel in the guild
        this.logger.log(`Found guild: ${guild.name}, ${guild.id}`);
        // TODO add command to set channel that should be used for the guild
        const channel = guild.channels.cache.filter((channel) => channel.isText()).find(channel => channel.position === 0);
        this.logger.log(`Found channel: ${channel.name}, ${channel.id}`);

        this.getEmbed(channel)
          .then((message) => {
            this.makeOfflineEmbed(message.embeds[0])
              .then((embed) => {
                if (message) {
                  this.editEmbed(message, embed)
                    .then(() => {
                      resolve()
                    });
                } else {
                  this.sendEmbed(channel, embed)
                    .then(() => {
                      resolve();
                    });
                }
              });
          });
      });
    });
  }

  /**
   * Gets a previous status message from the passed channel.
   *
   * @param {GuildChannel} channel to get embed from.
   */
  getEmbed(channel) {
    return new Promise((resolve, reject) => {
      channel.messages.fetchPinned()
        .then((messages) => {
          if (messages.size > 0 ) {
            // Fetch the pinned message made by Odinsson. For now, we assume Odinsson will only pin the server status
            const message = messages.filter(message => message.author.id = this.config.secrets.client_id).first();
            if (message) {
              this.logger.log(`Got pinned message: ${message.id}`);
              resolve(message);
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });
    });
  }

  /**
   * Sends a new (pinned) embedded message to the channel.
   *
   * @param {GuildChannel} channel to send new embed to.
   * @param {MessageEmbed} embed to send.
   */
  sendEmbed(channel, embed) {
    return new Promise((resolve, reject) => {
        channel.send(embed)
          .then((message) => {
            this.logger.log(`Sent new message: ${message.id}`);
            message.pin();
            // TODO delete pin notification message
            resolve();
          });
    });
  }

  /**
   * Edits the message with the provided embed.
   *
   * @param {Message} message to edit.
   * @param {MessageEmbed} embed to edit message with.
   */
  editEmbed(message, embed) {
    return new Promise((resolve, reject) => {
        this.logger.log(`Editing pinned message: ${message.id}`);

        message.edit(embed)
          .then(() => {
            resolve();
          });
    });
  }

  /**
   * Deletes any existing pinned embeds in the provided channel.
   *
   * @param {GuildChannel} channel to delete pinned embeds in.
   */
  deleteEmbed(channel) {
    return new Promise((resolve, reject) => {
      channel.messages.fetchPinned()
        .then((messages) => {
          if (messages.size > 0 ) {
            // Fetch the pinned message made by Odinsson. For now, we assume Odinsson will only pin the server status
            const message = messages.filter(message => message.author.id = this.config.secrets.client_id).first();
            if (message) {
              this.logger.log(`Deleting pinned message: ${message.id}`);
              message.delete();
            }
          }
          resolve();
        });
    });
  }

  /**
   * Creates an "online" embed status message.
   */
  makeOnlineEmbed() {
    return new Promise((resolve, reject) => {
      const screenshots = filesystem.readdirSync(`${this.config.images}/screenshots`);
      const randomScreenshot = screenshots[Math.floor(Math.random() * screenshots.length)];
      const randomTitle = this.config.status_embed.online_titles[Math.floor(Math.random() * this.config.status_embed.online_titles.length)];
      const randomDescription = this.config.status_embed.descriptions[Math.floor(Math.random() * this.config.status_embed.descriptions.length)];
      const randomFooter = this.config.status_embed.footers[Math.floor(Math.random() * this.config.status_embed.footers.length)];

      fetch(this.config.aws.ip_url)
        .then((response) => response.text())
        .then((text) => {
          resolve(new Discord.MessageEmbed()
            .setColor(this.config.status_embed.online_color)
            .setTitle(randomTitle)
            .setDescription(`${randomDescription} ${text}:2456!`)
            .attachFiles([`${this.config.images}/hugin-sticker_256x205.png`, `${this.config.images}/screenshots/${randomScreenshot}`])
            .setThumbnail("attachment://hugin-sticker_256x205.png")
            .setImage(`attachment://${randomScreenshot}`)
            .setFooter(randomFooter)
            .setTimestamp()
          );
        })
        .catch((error) => {
          this.logger.log(error, 'error');
          resolve(new Discord.MessageEmbed()
            .setColor(this.config.status_embed.online_color)
            .setTitle(randomTitle)
            .setDescription(`${randomDescription} steam!`)
            .attachFiles([`${this.config.images}/hugin-sticker_256x205.png`, `${this.config.images}/screenshots/${randomScreenshot}`])
            .setThumbnail("attachment://hugin-sticker_256x205.png")
            .setImage(`attachment://${randomScreenshot}`)
            .setFooter(randomFooter)
            .setTimestamp()
          );
        });
    });
  }

  /**
   * Creates an "offline" embed status message. If an embed is provided, it will be edited.
   *
   * @param {MessageEmbed} embed to edit.
   */
  makeOfflineEmbed(embed) {
    return new Promise((resolve, reject) => {
      const randomTitle = this.config.status_embed.offline_titles[Math.floor(Math.random() * this.config.status_embed.offline_titles.length)];
      const randomDescription = this.config.status_embed.descriptions[Math.floor(Math.random() * this.config.status_embed.descriptions.length)];
      const randomFooter = this.config.status_embed.footers[Math.floor(Math.random() * this.config.status_embed.footers.length)];

      if (embed) {
        resolve(new Discord.MessageEmbed(embed)
          .setColor(this.config.status_embed.offline_color)
          .setTitle(randomTitle)
          .setDescription(`${randomDescription} `)
          .attachFiles()
          .setFooter(randomFooter)
          .setTimestamp()
        );
      } else {
        const screenshots = filesystem.readdirSync("${this.config.images}/screenshots");
        const randomScreenshot = screenshots[Math.floor(Math.random() * screenshots.length)];

        resolve(new Discord.MessageEmbed()
          .setColor(this.config.status_embed.offline_color)
          .setTitle(randomTitle)
          .setDescription(`${randomDescription} ${this.config.status_embed.online_hours_blurb}`)
          .attachFiles(["${this.config.images}/hugin-sticker_256x205.png", `${this.config.images}/screenshots/${randomScreenshot}`])
          .setThumbnail("attachment://hugin-sticker_256x205.png")
          .setImage(`attachment://${randomScreenshot}`)
          .setFooter(randomFooter)
          .setTimestamp()
        );
      }
    });
  }
}

module.exports = ValheimServerStatusEmbedHelper;
