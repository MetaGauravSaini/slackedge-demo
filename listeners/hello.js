
const connFactory = require('../util/connection-factory');
const emitter = require('../common/event-emitter');

module.exports = controller => {

    controller.hears(['^hello$'], 'direct_message,direct_mention,mention', (bot, message) => {
        // console.log(bot.team_info.id == message.team_id);
        bot.reply(message, `hi, i have successfully joined your team!`);
    });

    controller.hears(['connect to a salesforce org'], 'direct_message', (bot, message) => {
        console.log('msg received', message.team_id);
        connFactory.getAuthUrl();

        process.nextTick(() => {
            console.log('event fired', message.team_id);
            emitter.emit('init-sf-auth', { teamId: message.team_id });
        });
    });
}