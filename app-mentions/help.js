const helpBlocks = require('./../bot-response/blocks-help');

module.exports = async (app, botToken, channel, channelMsgFormat) => {
  // Send blocks with details on usage of concierge bot
  const result = await app.client.chat.postMessage({
    token: botToken,
    channel: channel,
    blocks: helpBlocks(channelMsgFormat)
  });
};