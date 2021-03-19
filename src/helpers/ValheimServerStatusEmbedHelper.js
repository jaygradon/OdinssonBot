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
  async sendOnlineStatus(guilds) {
    this.logger.log('Odinsson is blowing the horns of Valheim!');
    guilds.forEach(async (guild) => {
      // Get the first channel in the guild
      this.logger.log(`Found guild: ${guild.name}, ${guild.id}`);
      // TODO add command to set channel that should be used for the guild
      const channel = guild.channels.cache.filter((channel) => channel.isText()).find(channel => channel.position === 0);
      this.logger.log(`Found channel: ${channel.name}, ${channel.id}`);

      // Delete previous embed as embedding new images is not supported
      await this.deleteEmbed(channel);
      // Send new embedded status
      const embed = await this.makeOnlineEmbed();
      this.sendEmbed(channel, embed);
    });
  }

  /**
   * Sends an offline status message to passed guilds. Will edit an existing online status message if it exists.
   *
   * @param {array} guilds to send offline status to.
   */
  async sendOfflineStatus(guilds) {
    this.logger.log('The path to Valheim is closing!');
    guilds.forEach(async (guild) => {
      // Get the first channel in the guild
      this.logger.log(`Found guild: ${guild.name}, ${guild.id}`);
      // TODO add command to set channel that should be used for the guild
      const channel = guild.channels.cache.filter((channel) => channel.isText()).find(channel => channel.position === 0);
      this.logger.log(`Found channel: ${channel.name}, ${channel.id}`);

      const message = await this.getEmbed(channel);
      const embed = await this.makeOfflineEmbed(message.embeds[0]);
      if (message) {
        this.editEmbed(message, embed)
      } else {
        this.sendEmbed(channel, embed)
      }
    });
  }

  /**
   * Gets a previous status message from the passed channel.
   *
   * @param {GuildChannel} channel to get embed from.
   */
  async getEmbed(channel) {
    const messages = await channel.messages.fetchPinned();
    if (messages.size > 0 ) {
      // Fetch the pinned message made by Odinsson. For now, we assume Odinsson will only pin the server status
      const message = messages.filter(message => message.author.id = this.config.secrets.client_id).first();
      if (message) {
        this.logger.log(`Got pinned message: ${message.id}`);
        return message;
      }
    }
  }

  /**
   * Sends a new (pinned) embedded message to the channel.
   *
   * @param {GuildChannel} channel to send new embed to.
   * @param {MessageEmbed} embed to send.
   */
  async sendEmbed(channel, embed) {
    const message = await channel.send(embed);
    this.logger.log(`Sent new message: ${message.id}`);
    message.pin();
    // TODO delete pin notification message
  }

  /**
   * Edits the message with the provided embed.
   *
   * @param {Message} message to edit.
   * @param {MessageEmbed} embed to edit message with.
   */
  async editEmbed(message, embed) {
    this.logger.log(`Editing pinned message: ${message.id}`);
    await message.edit(embed);
  }

  /**
   * Deletes any existing pinned embeds in the provided channel.
   *
   * @param {GuildChannel} channel to delete pinned embeds in.
   */
  async deleteEmbed(channel) {
    const messages = await channel.messages.fetchPinned();
    if (messages.size > 0 ) {
      // Fetch the pinned message made by Odinsson. For now, we assume Odinsson will only pin the server status
      const message = messages.filter(message => message.author.id = this.config.secrets.client_id).first();
      if (message) {
        this.logger.log(`Deleting pinned message: ${message.id}`);
        await message.delete();
      }
    }
  }

  /**
   * Creates an "online" embed status message.
   */
  async makeOnlineEmbed() {
      const screenshots = filesystem.readdirSync(`${this.config.images}/screenshots`);
      const randomScreenshot = screenshots[Math.floor(Math.random() * screenshots.length)];
      const randomTitle = this.config.status_embed.online_titles[Math.floor(Math.random() * this.config.status_embed.online_titles.length)];
      const randomDescription = this.config.status_embed.descriptions[Math.floor(Math.random() * this.config.status_embed.descriptions.length)];
      const randomFooter = this.config.status_embed.footers[Math.floor(Math.random() * this.config.status_embed.footers.length)];
    try {
      const response = await fetch(this.config.aws.ip_url);
      const text = await response.text();
      return new Discord.MessageEmbed()
        .setColor(this.config.status_embed.online_color)
        .setTitle(randomTitle)
        .setDescription(`${randomDescription} ${text}:2456!`)
        .attachFiles([`${this.config.images}/hugin-sticker_256x205.png`, `${this.config.images}/screenshots/${randomScreenshot}`])
        .setThumbnail("attachment://hugin-sticker_256x205.png")
        .setImage(`attachment://${randomScreenshot}`)
        .setFooter(randomFooter)
        .setTimestamp();
    } catch (error) {
      this.logger.log(error, 'error');
      return new Discord.MessageEmbed()
        .setColor(this.config.status_embed.online_color)
        .setTitle(randomTitle)
        .setDescription(`${randomDescription} steam!`)
        .attachFiles([`${this.config.images}/hugin-sticker_256x205.png`, `${this.config.images}/screenshots/${randomScreenshot}`])
        .setThumbnail("attachment://hugin-sticker_256x205.png")
        .setImage(`attachment://${randomScreenshot}`)
        .setFooter(randomFooter)
        .setTimestamp();
    }
  }

  /**
   * Creates an "offline" embed status message. If an embed is provided, it will be edited.
   *
   * @param {MessageEmbed} embed to edit.
   */
  makeOfflineEmbed(embed) {
    const randomTitle = this.config.status_embed.offline_titles[Math.floor(Math.random() * this.config.status_embed.offline_titles.length)];
    const randomDescription = this.config.status_embed.descriptions[Math.floor(Math.random() * this.config.status_embed.descriptions.length)];
    const randomFooter = this.config.status_embed.footers[Math.floor(Math.random() * this.config.status_embed.footers.length)];

    if (embed) {
      return new Discord.MessageEmbed(embed)
        .setColor(this.config.status_embed.offline_color)
        .setTitle(randomTitle)
        .setDescription(`${randomDescription} ${this.config.status_embed.online_hours_blurb}`)
        .attachFiles()
        .setFooter(randomFooter)
        .setTimestamp();
    } else {
      const screenshots = filesystem.readdirSync("${this.config.images}/screenshots");
      const randomScreenshot = screenshots[Math.floor(Math.random() * screenshots.length)];

      return new Discord.MessageEmbed()
        .setColor(this.config.status_embed.offline_color)
        .setTitle(randomTitle)
        .setDescription(`${randomDescription} ${this.config.status_embed.online_hours_blurb}`)
        .attachFiles([`${this.config.images}/hugin-sticker_256x205.png`, `${this.config.images}/screenshots/${randomScreenshot}`])
        .setThumbnail("attachment://hugin-sticker_256x205.png")
        .setImage(`attachment://${randomScreenshot}`)
        .setFooter(randomFooter)
        .setTimestamp();
    }
  }
}

module.exports = ValheimServerStatusEmbedHelper;
