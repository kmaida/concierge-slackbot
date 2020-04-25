/*------------------
     UTILITIES
------------------*/

// Returns true/false if mention text matches the passed simple command (command with no paramters)
const matchSimpleCommand = (cmd, e, ct) => {
  const normalizedText = e.text.toLowerCase().trim();
  const botUserLower = ct.botUserId.toLowerCase();
  const cmdInput = cmd.toLowerCase().trim();
  return (normalizedText === `<@${botUserLower}> ${cmdInput}`);
}

// Returns true if mention text matches properly formatted "assign" command
const isAssign = (e, ct) => {
  const normalizedText = e.text.toUpperCase().trim();
  const assignRegex = /^<@U[A-Z0-9]+?> ASSIGN <@U[A-Z0-9]+?>/g; // Accommodating to extra characters (lopped off later)
  return (normalizedText.startsWith(`<@${ct.botUserId}>`) && assignRegex.test(normalizedText));
}

// Takes raw message text and extracts user assignment ID in a message-safe format
const getAssignmentMsgTxt = (text) => {
  if (text) {
    return text
      .toUpperCase()                  // Normalize for inconsistency with "assign" text
      .split('ASSIGN ')[1]            // Split into array and get first segment after "assign"
      .match(/<@U[A-Z0-9]+?>/g)[0]    // Match only the first user ID (in case multiple were provided)
      .toString();                    // Array to string
    // Expected output: '<@U01238R77J6>'
  }
}

module.exports = { matchSimpleCommand, isAssign, getAssignmentMsgTxt };