require('dotenv').config();
// Bolt package (github.com/slackapi/bolt)
const { App } = require('@slack/bolt');
// Utility functions
const utils = require('./utils/utils');
const errHandler = require('./utils/error');
// MongoDB
const mongoose = require('mongoose');
const store = require('./data/db');
// Bot responses
const msgText = require('./bot-response/text-concierge-response');
// Commands
const cmdAssign = require('./app-mentions/assign');
const cmdWho = require('./app-mentions/who');
const cmdClear = require('./app-mentions/clear');
const cmdHelp = require('./app-mentions/help');
const message = require('./app-mentions/message');

// Create Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
const port = process.env.PORT || 3000;

/*------------------
      MONGODB
------------------*/
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
const db = mongoose.connection;
// Capture connection errors
db.on('error', console.error.bind(console, 'MongoDB Connection Error. Please make sure that', process.env.MONGO_URI, 'is running.'));
// Open connection
db.once('open', function () {
  console.info('Connected to MongoDB:', process.env.MONGO_URI);
});

/*------------------
    APP MENTIONS
------------------*/
app.event('app_mention', async({ event, context }) => {
  // Gather applicable info
  const text = event.text;                           // raw text from the message mentioning @concierge
  const sentByUser = event.user;                     // ID of user who sent the message
  const channel = event.channel;                     // channel ID
  const channelMsgFormat = `<#${channel}>`;          // channel formatted for in-message display
  const botToken = context.botToken;

  //-- "assign [@user]" for this channel
  if (utils.isAssign(event, context)) {
    cmdAssign(app, store, utils, text, msgText, botToken, channel, channelMsgFormat, errHandler);
  }

  //-- "who" is the concierge for this channel?
  else if (utils.matchSimpleCommand('who', event, context)) {
    cmdWho(app, store, msgText, botToken, channel, channelMsgFormat, errHandler);
  }

  //-- "clear" currently assigned concierge for channel
  if (utils.matchSimpleCommand('clear', event, context)) {
    cmdClear(app, store, utils, msgText, botToken, channel, channelMsgFormat, errHandler);
  }

  //-- "help"
  else if (utils.matchSimpleCommand('help', event, context)) {
    cmdHelp(app, botToken, channel, channelMsgFormat, errHandler);
  }

  //-- "@concierge [message]" sends DM to concierge, notifies channel, and notifies sender via ephemeral
  else if (
    !utils.matchSimpleCommand('who', event, context) && 
    !utils.isAssign(event, context) && 
    !utils.matchSimpleCommand('help', event, context) && 
    !utils.matchSimpleCommand('clear', event, context)
  ) {
    message(app, store, msgText, event.ts, sentByUser, botToken, channel, channelMsgFormat, errHandler);
  }

  // Log useful things
  console.log('Event: ', event);
});

/*------------------
     START APP
------------------*/
(async () => {
  await app.start(port);
  console.log(`⚡️ Concierge is running on ${port}!`);
})();
