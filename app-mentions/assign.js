module.exports = async (app, store, utils, text, msgText, botToken, channel, channelMsgFormat, errHandler) => {
  try {
    const assigned = utils.getAssignmentMsgTxt(text);
    const save = await store.saveAssignment(channel, assigned);
    // Post message to channel confirming concierge assignment
    const result = await app.client.chat.postMessage({
      token: botToken,
      channel: channel,
      text: msgText.confirmAssignment(assigned, channelMsgFormat)
    });
  }
  catch (err) {
    errHandler(app, botToken, channel, msgText, err);
  }
};