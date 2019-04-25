
const Botkit = require('botkit');
const mongoProvider = require('./db/mongo-provider')({
    mongoUri: `mongodb+srv://gaurav-saini:${process.env.MONGO_PW}@slackedge-test-skasp.mongodb.net/${process.env.DB_NAME}?retryWrites=true`
});

const saveTeamUtil = require('./util/save-team');
const eventListeners = require('./listeners/events');
const basicListener = require('./listeners/basic-ears');
const interactiveListener = require('./listeners/interactive');
const { checkTeamMigration } = require('./listeners/middleware/migration-filter');

let botCfg = {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: ['bot', 'team:read', 'users:read', 'users:read.email'],
    storage: mongoProvider,
    clientSigningSecret: process.env.SLACK_SIGNING_SECRET
};

let controller = Botkit.slackbot(botCfg);
controller.startTicking();

controller.middleware.receive.use(async (bot, message, next) => {

    try {
        console.log('receive middleware called');
        const isTeamMigrating = await checkTeamMigration(message.team_id);
    
        if (!isTeamMigrating) {
            next();
        }
    } catch (err) {
        logger.log(err);
    }
});

controller.middleware.send.use(async (bot, message, next) => {

    try {
        console.log('send middleware called');
        const isTeamMigrating = await checkTeamMigration(message.team_id);
    
        if (!isTeamMigrating) {
            next();
        }
    } catch (err) {
        logger.log(err);
    }
});

saveTeamUtil(controller);
eventListeners(controller);
basicListener(controller);
interactiveListener(controller);

module.exports = controller;