/*------------------
    MESSAGE TEXT
------------------*/

const msgText = {
  confirmAssignment: (assigned, channelMsgFormat) => {
    return `${assigned} is now the concierge for ${channelMsgFormat}.`;
  },
  reportWho: (conciergeNameMsgFormat, channelMsgFormat) => {
    return '`' + conciergeNameMsgFormat + '` is the concierge for ' + channelMsgFormat + '. To notify them directly, mention `@concierge` in your message.';
  },
  reportWhoUnassigned: (channelMsgFormat) => {
    return 'Nobody is currently assigned as concierge for ' + channelMsgFormat + '. To assign someone, use `@concierge assign [@user]`.';
  },
  confirmClear: (channelMsgFormat) => {
    return `Concierge for ${channelMsgFormat} has been unassigned.`;
  },
  clearNoAssignment: () => {
    return 'There is currently nobody assigned as concierge for this channel. Nothing changed.';
  },
  confirmChannelConciergeMsg: (channelMsgFormat, sentByUser) => {
    if (!!sentByUser) {
      return `The ${channelMsgFormat} concierge has been notified about <@${sentByUser}>'s message. :bellhop_bell:`;
    } else {
      return `The ${channelMsgFormat} concierge has been notified about a message. :bellhop_bell:`;
    }
  },
  confirmEphemeralConciergeMsg: () => {
    return ":alarm_clock: The concierge will respond at their earliest convenience. (_Keep in mind: they might be busy or outside working hours._)\n:rotating_light: If it's *very urgent* and nobody replies within 15 minutes, ping the appropriate `[@usergroup]`.\n:fire: If *it's an _emergency_*, use `@here`.";
  },
  noConciergeAssigned: (channelMsgFormat) => {
    return 'Nobody is currently assigned as concierge for ' + channelMsgFormat + '. To assign someone, use `@concierge assign [@user]`.';
  },
  dmToConcierge: (sentByUser, channelMsgFormat, link) => {
    if (!!sentByUser) {
      return `Hi there! <@${sentByUser}> needs your attention in ${channelMsgFormat} (${link}).\n\n`;
    } else {
      return `Hi there! A message needs your attention in ${channelMsgFormat} (${link}).\n\n`;
    }
  },
  errorMsg: (err) => {
    return ':disappointed: Sorry, I couldn\'t do that because an error occurred:\n```' + err + '```';
  }
}

module.exports = msgText;