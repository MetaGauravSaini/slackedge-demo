const Botkit = require('botkit');
const mongoProvider = require('./db/mongo-provider')({
    mongoUri: process.env.MONGO_CONNECTION_STRING
});
const dialogflowMiddleware = require('botkit-middleware-dialogflow')({
    minimumConfidence: 0.5
});

const basicListener = require('./listeners/basic-ears');

let botCfg = {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: ['bot', 'team:read', 'users:read', 'users:read.email', 'channels:write'],
    storage: mongoProvider,
    clientSigningSecret: process.env.SLACK_SIGNING_SECRET
};

let controller = Botkit.slackbot(botCfg);
controller.middleware.receive.use(dialogflowMiddleware.receive);
controller.startTicking();

controller.hears(
    ['Default Welcome Intent'],
    'direct_message',
    dialogflowMiddleware.hears,
    (bot, message) => {
        console.log(message.intent);
        console.log(message.entities);
        console.log(message.fulfillment);
        console.log(message.confidence);
        console.log(message.nlpResponse.queryResult.parameters);
        console.log(message.nlpResponse.queryResult.outputContexts);
        console.log(message.nlpResponse.queryResult.intent);
        replyText = message.fulfillment.text;
        bot.reply(message, replyText);
    }
);

controller.hears(
    ['create_nomination'],
    'direct_message',
    dialogflowMiddleware.hears,
    (bot, message) => {
        console.log(message.intent);
        console.log(message.entities);
        console.log(message.fulfillment);
        console.log(message.confidence);
        console.log(message.nlpResponse.queryResult.parameters);
        console.log(message.nlpResponse.queryResult.outputContexts);
        console.log(message.nlpResponse.queryResult.intent);
        bot.reply(message, 'create nomination intent detected');
    }
);

module.exports = controller;