module.exports = async (app, store, msgText, ts, sentByUser, botToken, channel, channelMsgFormat) => {
  try {
    const conciergeObj = await store.getConcierge(channel);
    
    if (conciergeObj) {
      // If concierge exists, that means someone must be assigned...
      const oncallUser = conciergeObj.assigned;
      const link = `https://${process.env.SLACK_TEAM}.slack.com/archives/${channel}/p${ts.replace('.', '')}`;
      // Send DM to the concierge notifying them of the message that needs their attention
      const sendDM = await app.client.chat.postMessage({
        token: botToken,
        channel: oncallUser.replace('<@', '').replace('>', ''), // User ID as channel sends a DM
        text: msgText.dmToConcierge(sentByUser, channelMsgFormat, link)
      });
      // Send message to the channel where help was requested notifying that concierge was contacted
      const sendChannelMsg = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: msgText.confirmChannelConciergeMsg(channelMsgFormat, sentByUser)
      });
      // Send ephemeral message (only visible to sender) telling them what to do if urgent
      const sendEphemeralMsg = await app.client.chat.postEphemeral({
        token: botToken,
        channel: channel,
        user: sentByUser,
        text: msgText.confirmEphemeralConciergeMsg()
      });
    } else {
      // No concierge is assigned; give instructions how to assign
      const result = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: msgText.noConciergeAssigned(channelMsgFormat)
      });
    }
  }
  catch (err) {
    console.error(err);
    const errorResult = await app.client.chat.postMessage({
      token: botToken,
      channel: channel,
      text: msgText.errorContactingConcierge(err)
    });
  }
};