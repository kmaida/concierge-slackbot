require('dotenv').config();
// Bolt package (github.com/slackapi/bolt)
const { App } = require('@slack/bolt');
// Utility functions
const utils = require('./utils');
// Reading / writing to filesystem store
const store = require('./filesys');
// Blocks
const homeBlocks = require('./blocks/blocks-home');
const helpBlocks = require('./blocks/blocks-help');
const publicMsgBlocks = require('./blocks/blocks-message-concierge');

/*------------------
      ON INIT
------------------*/

// Create Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
const port = process.env.PORT || 3000;
// Check if store exists; if not, create it
store.initStore();

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

  /*-- "assign [@user]" for this channel --*/
  if (utils.isAssign(event, context)) {
    try {
      const assigned = utils.getAssignmentMsgTxt(text);
      store.saveAssignment(channel, assigned);
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

  /*-- "who" is the concierge for this channel? --*/
  else if (utils.matchSimpleCommand('who', event, context)) {
    try {
      const conciergeNameMsgFormat = store.getAssignment(channel);

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

  /*-- "clear" currently assigned concierge for channel --*/
  if (utils.matchSimpleCommand('clear', event, context)) {
    try {
      const list = store.getStoreList();

      if (list[channel]) {
        store.clearAssignment(channel);

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
  /*-- "help" -*/
  else if (utils.matchSimpleCommand('help', event, context)) {
    const result = await app.client.chat.postMessage({
      token: botToken,
      channel: channel,
      blocks: helpBlocks(channelMsgFormat)
    });
  }

  /*-- "@concierge [message]" sends DM to concierge and notifies public channel --*/
  else if (
    !utils.matchSimpleCommand('who', event, context) && 
    !utils.isAssign(event, context) && 
    !utils.matchSimpleCommand('help', event, context) && 
    !utils.matchSimpleCommand('clear', event, context)
  ) {
    try {
      const oncallUser = store.getAssignment(channel);

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
     START APP
------------------*/

(async () => {
  await app.start(port);
  console.log(`⚡️ Concierge is running on ${port}!`);
})();
