/*------------------
     UTILITIES
------------------*/

const utils = {
  removeUsernames(input) {
    return input.replace(/\|[a-z0-9._\-]+?>/g, '>');
  },
  // Returns true/false if mention text matches the passed simple command (command with no paramters)
  matchSimpleCommand(cmd, e, ct) {
    const stripUsernames = this.removeUsernames(e.text);
    const normalizedText = stripUsernames.toUpperCase().trim();
    const cmdInput = cmd.toUpperCase();
    return (normalizedText === `<@${ct.botUserId}> ${cmdInput}`);
  },
  // Takes raw message text and extracts user assignment ID in a message-safe format
  getAssignmentMsgTxt(text) {
    if (text) {
      const stripUsernames = this.removeUsernames(text);  // Remove any |user.name from the string
      const usermention = stripUsernames
        .toUpperCase()                          // Normalize for inconsistency with "assign" text
        .split('ASSIGN ')[1]                    // Split into array and get first segment after "assign"
        .match(/<@U[A-Z0-9]+?>/g)[0]            // Match only the first user ID (in case multiple were provided)
        .toString();                            // Array to string
        // Expected output: '<@U01238R77J6>'
      return usermention;
    }
  },
  // Returns true if mention text matches properly formatted "assign" command
  isAssign(e, ct) {
    const stripUsernames = this.removeUsernames(e.text);
    const normalizedText = stripUsernames.toUpperCase().trim();
    const assignRegex = /^<@U[A-Z0-9]+?> ASSIGN <@U[A-Z0-9]+?>/g;
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