require('dotenv').config();
// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require('@slack/bolt');
const fs = require('fs');
const storeFilepath = './concierge.json';
// Blocks
const homeBlocks = require('./blocks/blocks-home');
const helpBlocks = require('./blocks/blocks-help');
const publicMsgBlocks = require('./blocks/blocks-message-concierge');

// Create Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
const port = process.env.PORT || 3000;

/*------------------
      ON INIT
------------------*/

// If store file doesn't exist, create it
if (fs.existsSync(storeFilepath)) {
  console.log('Local store exists');
} else {
  fs.writeFile(storeFilepath, '{}', (error) => {
    if (error) {
      console.error('ERROR: Failed to create local store file:', error);
    } else {
      console.log('Local store created successfully');
    }
  });
}

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
  const normalizedText = e.text.toLowerCase().trim();
  const botUserLower = ct.botUserId.toLowerCase();
  return (normalizedText.startsWith(`<@${botUserLower}> assign <@`) && normalizedText.endsWith('>'));
}

// Takes raw message text and extracts user assignment ID in a message-safe format
const getAssignmentMsgTxt = (text) => {
  if (text) {
    return text
      .toUpperCase()                  // Normalize for inconsistency with "assign" text
      .split('ASSIGN ')[1]            // Split into array and get first segment after "assign"
      .match(/<@U[A-Z0-9]*?>/g)[0]    // Match only the first user ID (in case multiple were provided)
      .toString();                    // Array to string
    // Expected output: '<@U01238R77J6>'
  }
}

/*------------------
    APP MENTIONS
------------------*/

app.event('app_mention', async({ event, context }) => {
  // Gather applicable info
  const text = event.text;                           // raw text from the message mentioning @concierge
  const sentByUser = event.user;                     // user ID
  const channel = event.channel;                     // channel ID
  const channelMsgFormat = `<#${channel}>`;          // channel formatted for message display
  const botToken = context.botToken;

  /*------------------
    "assign [@user]"
    Assign a user to be the concierge for whatever channel the message was sent in
  ------------------*/
  if (isAssign(event, context)) {
    try {
      const assigned = getAssignmentMsgTxt(text);
      const list = JSON.parse(fs.readFileSync(storeFilepath));
      list[channel] = assigned;
      fs.writeFileSync(storeFilepath, JSON.stringify(list, null, 2));

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
  else if (matchSimpleCommand('who', event, context)) {
    try {
      const list = JSON.parse(fs.readFileSync(storeFilepath));
      const conciergeNameMsgFormat = list[channel];

      if (conciergeNameMsgFormat) {
        const result = await app.client.chat.postMessage({
          token: botToken,
          channel: channel,
          text: '`' + conciergeNameMsgFormat + '` is the concierge for ' + channelMsgFormat + '. To notify them directly, mention `@concierge` in your message.'
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
  if (matchSimpleCommand('clear', event, context)) {
    try {
      const list = JSON.parse(fs.readFileSync(storeFilepath));

      if (list[channel]) {
        delete list[channel];
        fs.writeFileSync(storeFilepath, JSON.stringify(list, null, 2));

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
    "help"
  ------------------*/
  else if (matchSimpleCommand('help', event, context)) {
    const result = await app.client.chat.postMessage({
      token: botToken,
      channel: channel,
      blocks: helpBlocks(channelMsgFormat)
    });
  }

  /*------------------
    Send a message directly to the concierge
    - Sends a DM to the concierge notifying them where they're needed
    - Notify in channel if there is no concierge assigned
  ------------------*/
  else if (
    !matchSimpleCommand('who', event, context) && 
    !isAssign(event, context) && 
    !matchSimpleCommand('help', event, context) && 
    !matchSimpleCommand('clear', event, context)
  ) {
    try {
      const list = JSON.parse(fs.readFileSync(storeFilepath));
      const oncallUser = list[channel];

      if (oncallUser) {
        const link = `https://${process.env.SLACK_TEAM}.slack.com/archives/${channel}/p${event.ts.replace('.', '')}`;
        const sendDM = await app.client.chat.postMessage({
          token: botToken,
          channel: oncallUser.replace('<@', '').replace('>', ''), // User ID as channel sends a DM
          text: `Hi there! <@${sentByUser}> needs your attention in ${channelMsgFormat} (${link}).\n\n`
        });
        const sendPublicMsg = await app.client.chat.postMessage({
          token: botToken,
          channel: channel,
          blocks: publicMsgBlocks(channelMsgFormat, sentByUser)
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
  // Log useful things
  console.log('Event: ', event, 'Context: ', context);
});

/*------------------
     APP HOME
------------------*/

app.event('app_home_opened', async ({ event, context, payload }) => {
  // Display App Home
  const homeView = await appHome.createHome(event.user);
  
  try {
    const result = await app.client.views.publish({
      token: context.botToken,
      user_id: event.user,
      view: homeView
    });
  } catch(e) {
    app.error(e);
  }
});

/*------------------
     START APP
------------------*/

(async () => {
  await app.start(port);
  console.log(`⚡️ Concierge is running on ${port}!`);
})();
