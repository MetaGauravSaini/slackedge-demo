require('dotenv').config();

const { Botkit } = require('botkit');
const { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } = require('botbuilder-adapter-slack');

const { getFilterMiddleware } = require('./listeners/middleware/migration-filter');
const dialogflowMiddleware = require('./df-middleware');
const mongoProvider = require('./db/mongo-provider')({
    mongoUri: process.env.MONGO_CONNECTION_STRING
});
const authRouter = require('./api/routes/oauth');

const adapter = new SlackAdapter({
    clientSigningSecret: process.env.SLACK_SIGNING_SECRET,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: ['bot', 'team:read', 'users:read', 'users:read.email', 'channels:write'],
    redirectUri: process.env.SLACK_REDIRECT_URI,
    getTokenForTeam: getTokenForTeam,
    getBotUserByTeam: getBotUserByTeam
});
adapter.use(new SlackEventMiddleware());
adapter.use(new SlackMessageTypeMiddleware());

const controller = new Botkit({
    webhook_uri: '/slack/receive',
    adapter,
    webserver_middlewares: []
});

controller.addPluginExtension('database', mongoProvider);

controller.middleware.receive.use(dialogflowMiddleware.receive);
controller.middleware.receive.use(getFilterMiddleware(controller));

controller.ready(() => {
    controller.loadModules(__dirname + '/listeners');
});

controller.on('oauth_success', newTeam => {
    console.log(newTeam);
});

authRouter(controller);

async function getTokenForTeam(teamId) {

    try {
        const teamData = await controller.plugins.database.teams.get(teamId);
        return teamData.bot.token;
    } catch (err) {

        if (err.name === 'TypeError') {
            console.log('team not found: ', teamId);
        } else {
            console.log('error fetching team: ', err);
        }
    }
}

async function getBotUserByTeam(teamId) {

    try {
        const teamData = await controller.plugins.database.teams.get(teamId);
        return teamData.bot.user_id;
    } catch (err) {

        if (err.name === 'TypeError') {
            console.log('team not found: ', teamId);
        } else {
            console.log('error fetching team: ', err);
        }
    }
}

process.on('uncaughtException', err => {
    logger.log('uncaught exception encountered, exiting process', err.stack);
    process.exit(1);
});