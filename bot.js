
const Botkit = require('botkit');
const mongoProvider = require('./db/mongo-provider')({
    mongoUri: `mongodb+srv://gaurav-saini:${process.env.MONGO_PW}@slackedge-test-skasp.mongodb.net/${process.env.DB_NAME}?retryWrites=true`
});

const saveTeamUtil = require('./util/save-team');
const eventListeners = require('./listeners/events');
const basicListener = require('./listeners/basic-ears');

let botCfg = {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: ['bot', 'team:read', 'users:read', 'users:read.email'],
    storage: mongoProvider
};

let controller = Botkit.slackbot(botCfg);
controller.startTicking();

saveTeamUtil(controller);
eventListeners(controller);
basicListener(controller);

module.exports = controller;