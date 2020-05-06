/*------------------
     UTILITIES
------------------*/

const utils = {
  // Returns true/false if mention text matches the passed simple command (command with no paramters)
  matchSimpleCommand: (cmd, e, ct) => {
    const normalizedText = e.text.toLowerCase().trim();
    const botUserLower = ct.botUserId.toLowerCase();
    const cmdInput = cmd.toLowerCase().trim();
    return (normalizedText === `<@${botUserLower}> ${cmdInput}`);
  },
  // Takes raw message text and extracts user assignment ID in a message-safe format
  getAssignmentMsgTxt: (text) => {
    if (text) {
      return text
        .toUpperCase()                          // Normalize for inconsistency with "assign" text
        .split('ASSIGN ')[1]                    // Split into array and get first segment after "assign"
        .match(/<@U[A-Z0-9|a-z._]+?>/g)[0]      // Match only the first user ID (in case multiple were provided)
        .toString();                            // Array to string
      // Expected output: '<@U01238R77J6>'
    }
  },
  // Returns true if mention text matches properly formatted "assign" command
  isAssign: (e, ct) => {
    const normalizedText = e.text.toUpperCase().trim();
    const assignRegex = /^<@U[A-Z0-9|a-z._]+?> ASSIGN <@U[A-Z0-9|a-z._]+?>/g; // Accommodating to extra characters (lopped off later)
    return (normalizedText.startsWith(`<@${ct.botUserId}>`) && assignRegex.test(normalizedText));
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