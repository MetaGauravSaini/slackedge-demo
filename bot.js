
const Botkit = require('botkit');
const mongoProvider = require('./db/mongo-provider')({
    mongoUri: `mongodb+srv://gaurav-saini:${process.env.MONGO_PW}@slackedge-test-skasp.mongodb.net/test?retryWrites=true`
});

const joinTeamListener = require('./listeners/join-team');
const helloListener = require('./listeners/hello');
const saveUserUtil = require('./util/save-user');

let botCfg = {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: ['bot', 'team:read'],
    storage: mongoProvider
};

let controller = Botkit.slackbot(botCfg);
controller.startTicking();

/*
user_channel_join
conversations
*/

saveUserUtil(controller);
joinTeamListener(controller);
helloListener(controller);

module.exports = controller;