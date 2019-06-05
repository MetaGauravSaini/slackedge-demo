const Botkit = require('botkit');
const { WatsonMiddleware } = require('botkit-middleware-watson');
const mongoProvider = require('./db/mongo-provider')({
    mongoUri: process.env.MONGO_CONNECTION_STRING
});

const eventListeners = require('./listeners/events');
const basicListener = require('./listeners/basic-ears');
const interactiveListener = require('./listeners/interactive');
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

const watsonMiddleware = new WatsonMiddleware({
    iam_apikey: process.env.WATSON_API_KEY,
    url: process.env.WATSON_API_URL,
    workspace_id: process.env.WATSON_WS_ID,
    version: '2018-07-10',
});
controller.middleware.receive.use(watsonMiddleware.receive.bind(watsonMiddleware));

eventListeners(controller);
basicListener(controller);
interactiveListener(controller);

module.exports = controller;