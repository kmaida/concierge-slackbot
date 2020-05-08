module.exports = async (app, botToken, channel, msgText, err) => {
  console.error(err);
  const errorResult = await app.client.chat.postMessage({
    token: botToken,
    channel: channel,
    text: msgText.errorMsg(err)
  });
};