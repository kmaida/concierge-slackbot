module.exports = async (app, store, utils, msgText, botToken, channel, channelMsgFormat, errHandler) => {
  try {
    const list = await store.getStoreList();
    if (utils.inList(channel, list)) {
      // If there is an existing concierge for this channel, clear it
      const clear = await store.clearAssignment(channel);
      const result = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: msgText.confirmClear(channelMsgFormat)
      });
    } else {
      // If there's no concierge, send a message saying nothing changed
      const result = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: msgText.clearNoAssignment()
      });
    }
  }
  catch (err) {
    errHandler(app, botToken, channel, msgText, err);
  }
};