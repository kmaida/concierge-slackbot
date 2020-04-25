const publicMsgBlocks = (channelMsgFormat, sentByUser) => {
  return [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":speech_balloon: *The " + channelMsgFormat + " concierge has been notified about <@" + sentByUser + ">'s message.* They'll respond at their earliest convenience. _(In the meantime, anyone in the channel can jump in if they want — but no obligations.)_"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":rotating_light: If it's *very urgent* and the concierge doesn't respond in 15 minutes (they might be busy or outside working hours), mention this team's usergroup or `@here`.\n:fire: If everything is on fire and *it's a _huge emergency_*, you can use `@channel`."
      }
    }
  ];
}

module.exports = publicMsgBlocks;