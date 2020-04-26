# Concierge

`concierge` is a Slackbot I wrote for internal team use at [Gatsby](https://gatsbyjs.com). The inspiration was derived from my time working at [Auth0](https://auth0.com) and using [Auth0's extremely useful concierge Slackbot](https://auth0.engineering/education-through-automation-slack-concierge-ab97c03ef794). This app was built with the [Bolt JavaScript Slack app framework](https://github.com/slackapi/bolt).

## Usage

* `@concierge assign [@user]` assigns someone to concierge for the channel the message was sent in
* `@concierge clear` removes the current assignment for the channel
* `@concierge who` reports the name of the assigned concierge in the current channel
* `@concierge help` shows the list of available commands
* `@concierge [some other message]` sends a direct message to the concierge for the channel, notifying them that your message needs attention

## Development

**Prerequisite**: A Slack workspace that you can test in (without disturbing or spamming your coworkers 😛). You can [create a new Slack workspace for free here](https://slack.com/get-started#/create).

1. [Create a new Slack app](https://api.slack.com/apps/new).
2. Name your app `Slack App Name` and select your preferred development Slack workspace.
3. Under **Incoming Webhooks**, click the toggle to turn webhooks `On`.
4. In the **OAuth & Permissions** section, add Bot Token Scopes for `app_mentions:read`, `chat:write`, and `incoming-webhook`.
5. Under **Install App**, click the button to install the app to your team workspace. When prompted, choose a channel to install to (it can be any channel.) This will generate a bot user OAuth access token (which you will need to configure your local environment variables).
6. Clone this repository locally.
7. Rename the `.env_sample` file to `.env` and add the appropriate configuration from your Slack app settings.
8. From your cloned directory, run `$ npm install` to install dependencies.
9. Run `$ npm start` to start the app on the port you specified in your `.env` file.
10. Download and use [ngrok](https://ngrok.com) to expose a public URL for your local web server.
11. Once you have ngrok pointing to your Slack app's local development environment and the server is running, enable **Event Subscriptions** for your Slack app in the App settings. For the Request URL, provide `https://your-ngrok-url/slack/events`.
12. Subscribe to `app_mentions` in the Event Subscriptions Bot Events.

**Note:** If you change scopes during development, you may need to _reinstall_ the app to your workspace.

## Usage Ideas

Here are some ways you can use the `concierge` bot in conjunction with other Slack features / third party apps.

### Rotating the Concierge

If your concierge responsibility rotates through several people, you can set a recurring reminder with Slack's `/remind` slash command to remind the concierge to assign the next person. E.g.:

```
/remind [#channel] Assign the next person in the @concierge rotation using `@concierge assign [@user]` every Monday
```

**Note:** You can't directly remind "`@concierge`" to do something. I.e., `/remind @concierge do something` will _not_ work because it will send a direct message to the _bot user_, not any specific channel's _assigned human user_. When using `/remind`, you need to send the reminder in the _channel_ where you want the assigned concierge to receive the message.

### Scheduling Messages

You can also schedule messages to be delivered later. This works with both the built-in `/remind` slash task (similar to above), and also with third party Slack apps like [Gator](https://www.gator.works/) and [/schedule](https://slackscheduler.com/). Just schedule the message in the channel whose concierge you'd like to reach. E.g.:

```
/gator Hey @concierge I need some help with task XYZ please
```

## Deployment

Follow the development instructions again to create a new Slack app, but in your production workspace.

The Slack app should be deployed with the following:

* Node server stays running (e.g., a free plan on Heroku will not work because the app will sleep and cause long delays when it wakes)
* SSL
* Public URL (you do _not_ need an elegant URL, since the URL is never displayed, it's only for Slack app configuration)

If you're very comfortable with Linux devops, Let's Encrypt, and have a domain name, I recommend [DigitalOcean](https://www.digitalocean.com/pricing/). If you want fast, easy deployments with CI/CD features and don't want to deal with devops, domains, or configuring SSL, I recommend a hobby dyno on [Heroku](https://www.heroku.com/pricing).

If using DigitalOcean, input your production environment variables in a `.env` file on your server.

If using Heroku, input your production environment variables in your Heroku app settings.

Whatever deployment option you choose, once you have a public domain for your Slack app with SSL, go into your production Slack app settings and update the **Event Subscription** Request URL to `https://your-public-url/slack/events`.

[MIT License](LICENSE)
