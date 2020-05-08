module.exports = async (app, store, msgText, botToken, channel, channelMsgFormat, errHandler) => {
  try {
    const conciergeObj = await store.getConcierge(channel);

    if (conciergeObj) {
      const conciergeNameMsgFormat = conciergeObj.assigned;
      const result = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: msgText.reportWho(conciergeNameMsgFormat, channelMsgFormat)
      });
    } else {
      const result = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: msgText.reportWhoUnassigned(channelMsgFormat)
      });
    }
  }
  catch (err) {
    errHandler(app, botToken, channel, msgText, err);
  }
};