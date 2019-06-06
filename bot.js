const { Botkit } = require('botkit');
import { WatsonMiddleware } from 'botkit-middleware-watson';
const { SlackAdapter } = require('botbuilder-adapter-slack');
const mongoProvider = require('./db/mongo-provider')({
    mongoUri: process.env.MONGO_CONNECTION_STRING
});

// const eventListeners = require('./listeners/events');
// const basicListener = require('./listeners/basic-ears');
// const interactiveListener = require('./listeners/interactive');
// const { getFilterMiddleware } = require('./listeners/middleware/migration-filter');

const adapter = new SlackAdapter({
    clientSigningSecret: process.env.SLACK_SIGNING_SECRET,
    botToken: process.env.SLACK_BOT_TOKEN
});

/* let botCfg = {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: ['bot', 'team:read', 'users:read', 'users:read.email', 'channels:write'],
    storage: mongoProvider,
    clientSigningSecret: process.env.SLACK_SIGNING_SECRET
}; */

// let controller = Botkit.slackbot(botCfg);
const controller = new Botkit({
    adapter,
    storage: mongoProvider
    // ...other options
});
// controller.middleware.receive.use(getFilterMiddleware(controller));

const watsonMiddleware = new WatsonMiddleware({
    iam_apikey: process.env.WATSON_API_KEY,
    url: process.env.WATSON_API_URL,
    workspace_id: process.env.WATSON_WS_ID,
    version: '2018-07-10',
});
controller.middleware.receive.use(watsonMiddleware.receive.bind(watsonMiddleware));

controller.hears(['.*'], ['direct_message', 'direct_mention', 'mention'], async function (bot, message) {
    console.log(message.watsonError);
    console.log(message.watsonData);

    if (message.watsonError) {
        await bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
    } else {
        await bot.reply(message, message.watsonData.output.text.join('\n'));
    }
});

// eventListeners(controller);
// basicListener(controller);
// interactiveListener(controller);

module.exports = controller;