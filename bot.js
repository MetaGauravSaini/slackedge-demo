const Botkit = require('botkit');
const mongoProvider = require('./db/mongo-provider')({
    mongoUri: process.env.MONGO_CONNECTION_STRING
});
const dialogflowMiddleware = require('botkit-middleware-dialogflow')({});

// const eventListeners = require('./listeners/events');
// const basicListener = require('./listeners/basic-ears');
// const interactiveListener = require('./listeners/interactive');
const { getFilterMiddleware } = require('./listeners/middleware/migration-filter');

let botCfg = {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: ['bot', 'team:read', 'users:read', 'users:read.email', 'channels:write'],
    storage: mongoProvider,
    clientSigningSecret: process.env.SLACK_SIGNING_SECRET
};

let controller = Botkit.slackbot(botCfg);
controller.startTicking();
controller.middleware.receive.use(getFilterMiddleware(controller));
controller.middleware.receive.use(dialogflowMiddleware.receive);

// eventListeners(controller);
// basicListener(controller);
// interactiveListener(controller);

controller.hears(
    'create_nomination',
    'direct_message,direct_mention',
    dialogflowMiddleware.hears,
    (bot, message) => {
        bot.reply(message, message.fulfillment.text);
        console.log(message.intent);
        console.log(message.entities);
        console.log(message.fulfillment);
        console.log(message.confidence);
    }
);

module.exports = controller;