# Concierge

`concierge` is a simple Slackbot I wrote for internal team use at [Gatsby](https://gatsbyjs.com). The inspiration was derived from my time working at [Auth0](https://auth0.com) and using Auth0's extremely useful concierge Slackbot.

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
3. Install the app to your team workspace.
4. Clone this repository locally.
5. Rename the `.env_sample` file to `.env` and add the appropriate configuration.

## Installation

_(Coming soon)_
