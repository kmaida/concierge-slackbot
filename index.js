require('dotenv').config();
// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require('@slack/bolt');
const fs = require('fs');
const rotaFile = './concierge.json';

// Create Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
const port = process.env.PORT || 3000;

/*------------------
     UTILITIES
------------------*/

const getAssignmentId = (text) => {
  if (text) {
    return text
      .toUpperCase()            // Normalize for inconsistency with "assign" text
      .split('ASSIGN ')[1]      // Split into array and get first segment after "assign"
      .match(/\<(.*?)\>/g)[0]   // Match only the first user ID (in case multiple were provided)
      .toString();              // Array to string
    // Expected output: '<@U01238R77J6>'
  }
}

/*------------------
    APP MENTIONS
------------------*/

app.event('app_mention', async({ event, context }) => {
  // Gather applicable info
  const text = event.text;                           // raw text from the message mentioning @concierge
  const normalizedText = text.toLowerCase().trim();  // normalizes format in commands
  const sentByUser = event.user;                     // user ID
  const channel = event.channel;                     // channel ID
  const channelMsgFormat = `<#${channel}>`;          // channel formatted for message display
  const botToken = context.botToken;

  /*------------------
    "assign [@user]"
    Assign a user to be the concierge for whatever channel the message was sent in
  ------------------*/
  if (normalizedText.includes('> assign <@')) {
    try {
      const assigned = getAssignmentId(text);
      const list = JSON.parse(fs.readFileSync(rotaFile));
      list[channel] = assigned;
      fs.writeFileSync(rotaFile, JSON.stringify(list, null, 2));

      const result = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: `${assigned} is now the concierge for ${channelMsgFormat}.`
      });
    }
    catch (err) {
      console.error(err);
      const errorResult = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: 'An error has occurred while trying to assign the concierge for this channel:\n```' + JSON.stringify(err) + '```'
      });
    }
  }

  /*------------------
    "who"
    Find out who the concierge is right now for the channel the message was sent in
  ------------------*/
  else if (normalizedText.includes('> who') && normalizedText.endsWith(' who')) {
    try {
      const list = JSON.parse(fs.readFileSync(rotaFile));
      const conciergeNameMsgFormat = list[channel];

      if (conciergeNameMsgFormat) {
        const result = await app.client.chat.postMessage({
          token: botToken,
          channel: channel,
          text: '`' + conciergeNameMsgFormat + '` is the concierge. To notify them directly, mention `@concierge` in your message.'
        });
      } else {
        const result = await app.client.chat.postMessage({
          token: botToken,
          channel: channel,
          text: 'Nobody is currently assigned as concierge for ' + channelMsgFormat + '. To assign someone, use `@concierge assign [@user]`.'
        });
      }
    }
    catch (err) {
      console.error(err);
      const errorResult = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: 'An error occurred trying to determine the concierge:\n```' + JSON.stringify(err) + '```'
      });
    }
  }

  /*------------------
    "clear"
    Assign a user to be the Twitter rotation concierge
  ------------------*/
  if (normalizedText.endsWith('> clear')) {
    try {
      const list = JSON.parse(fs.readFileSync(rotaFile));

      if (list[channel]) {
        delete list[channel];
        fs.writeFileSync(rotaFile, JSON.stringify(list, null, 2));

        const result = await app.client.chat.postMessage({
          token: botToken,
          channel: channel,
          text: `Concierge for ${channelMsgFormat} has been unassigned.`
        });
      } else {
        const result = await app.client.chat.postMessage({
          token: botToken,
          channel: channel,
          text: 'There is currently nobody assigned as concierge for this channel. Nothing changed.'
        });
      }
    }
    catch (err) {
      console.error(err);
      const errorResult = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: 'An error has occurred while trying to assign the concierge:\n```' + JSON.stringify(err) + '```'
      });
    }
  }

  /*------------------
    Send a message directly to the concierge
    - Sends a DM to the concierge notifying them where they're needed
    - Notify in channel if there is no concierge assigned
  ------------------*/
  else if (
    !normalizedText.endsWith('> who') && 
    !normalizedText.includes('> assign <@') && 
    !normalizedText.endsWith('> help') && 
    !normalizedText.endsWith('> clear'))
  {
    try {
      const list = JSON.parse(fs.readFileSync(rotaFile));
      const oncallUser = list[channel];

      if (oncallUser) {
        const link = `https://${process.env.SLACK_TEAM}.slack.com/archives/${channel}/p${event.ts.replace('.', '')}`;
        const sendDM = await app.client.chat.postMessage({
          token: botToken,
          channel: oncallUser.replace('<@', '').replace('>', ''),
          text: `Hi there! <@${sentByUser}> needs your attention in ${channelMsgFormat} (${link}).\n\n`
        });
        const sendPublicMsg = await app.client.chat.postMessage({
          token: botToken,
          channel: channel,
          text: 'A message has been sent to the concierge. If your message is urgent and you don\'t receive a reply within 15 minutes, please use `@here` or `@channel`.'
        });
      } else {
        const result = await app.client.chat.postMessage({
          token: botToken,
          channel: channel,
          text: 'Nobody is currently assigned as concierge for ' + channelMsgFormat + '. To assign someone, use `@concierge assign [@user]`.'
        });
      }
    }
    catch (err) {
      console.error(err);
      const errorResult = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        text: 'An error occurred contacting the concierge:\n```' + JSON.stringify(err) + '```'
      });
    }
  }

  /*------------------
    "help"
  ------------------*/
  else if (normalizedText.endsWith('> help')) {
    const result = await app.client.chat.postMessage({
      token: botToken,
      channel: channel,
      text: 'Hi there, I\'m the *concierge bot*! Here\'s what I can do:\n• Ask `@concierge who` to check who is currently assigned as concierge in ' + channelMsgFormat + '.\n• Type `@concierge assign [@username]` to assign someone to concierge for this channel.\n• Mention `@concierge` in a message to send a DM to the concierge.\n• Say `@concierge clear` to reset the concierge and unassign the person currently on call.'
    });
  }
  // Log useful things
  console.log('Event: ', event, 'Context: ', context);
});

/*------------------
     START APP
------------------*/

(async () => {
  await app.start(port);
  console.log(`⚡️ Concierge is running on ${port}!`);
})();
