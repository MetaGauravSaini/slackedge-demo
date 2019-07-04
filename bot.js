const Botkit = require('botkit');
const mongoProvider = require('./db/mongo-provider')({
    mongoUri: process.env.MONGO_CONNECTION_STRING
});
const dialogflowMiddleware = require('botkit-middleware-dialogflow')({
    keyFilename: './dialogflow-key.json',
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

basicListener(controller);

module.exports = controller;