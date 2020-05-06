/*------------------
     UTILITIES
------------------*/

const utils = {
  // Returns true/false if mention text matches the passed simple command (command with no paramters)
  matchSimpleCommand: (cmd, e, ct) => {
    const normalizedText = e.text.toLowerCase().trim();
    const botUserLower = ct.botUserId.toLowerCase();
    const cmdInput = cmd.toLowerCase().trim();
    return normalizedText.startsWith(`<@${botUserLower}`) && normalizedText.endsWith(`> ${cmdInput}`);
  },
  // Takes raw message text and extracts user assignment ID in a message-safe format
  getAssignmentMsgTxt: (text) => {
    if (text) {
      const usermention = text
        .toUpperCase()                          // Normalize for inconsistency with "assign" text
        .split('ASSIGN ')[1]                    // Split into array and get first segment after "assign"
        .match(/<@U[A-Z0-9|a-z._]+?>/g)[0]      // Match only the first user ID (in case multiple were provided)
        .toString();                            // Array to string
        // Expected output: '<@U01238R77J6>' or '<@U01238R77J6|user.name>'
      return usermention.includes('|') ? `${usermention.split('|')[0]}>` : usermention;
    }
  },
  // Returns true if mention text matches properly formatted "assign" command
  isAssign: (e, ct) => {
    const normalizedText = e.text.toUpperCase().trim();
    const assignRegex = /^<@U[A-Z0-9|._]+?> ASSIGN <@U[A-Z0-9|._]+?>/g;
    return (normalizedText.startsWith(`<@${ct.botUserId}`) && assignRegex.test(normalizedText));
  },
  // Returns boolean indicating whether the channel is in the list
  inList(channel, list) {
    if (list && list.length) {
      return list.filter(item => item.channel === channel).length > 0;
    }
    return false;
  }
};

module.exports = utils;