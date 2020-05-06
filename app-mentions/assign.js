module.exports = async (app, store, utils, text, msgText, botToken, channel, channelMsgFormat) => {
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
    console.error(err);
    const errorResult = await app.client.chat.postMessage({
      token: botToken,
      channel: channel,
      text: msgText.errorAssignment(err)
    });
  }
};