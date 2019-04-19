
const connFactory = require('../util/connection-factory');
const refedgeUtil = require('../util/refedge');

module.exports = controller => {

    controller.hears(['^hello$'], 'direct_message,direct_mention', (bot, message) => {
        // console.log(bot.team_info.id == message.team_id);
        bot.reply(message, `hi, you can invite me to the channel for Customer Reference Team to receive updates!`);
    });

    controller.hears(['show accounts'], 'direct_message,direct_mention,mention', async (bot, message) => {
        
        try {
            const accList = await refedgeUtil.getAccounts(message.team_id, controller);
            console.log('accList', accList);
            bot.reply(message, 'accounts found');
        } catch (err) {
            console.log(err);
        }
    });

    controller.hears(['connect to a salesforce org'], 'direct_message', async (bot, message) => {
        console.log('msg received');

        try {
            let existingConn = await connFactory.getConnection(message.team_id, controller);
            console.log('conn1:', existingConn);

            if (!existingConn) {
                connFactory.getAuthUrl(message.team_id);
                console.log('creating new connection...');
            } else {

                bot.startConversation(message, (err, convo) => {
                    convo.addQuestion(
                        `You're already connected to a Salesforce org. Are you sure you want to disconnect from it and connect to another org?`,
                        [{
                            pattern: bot.utterances.yes,
                            callback: async (response, convo) => {
                                convo.say('Ok, Done');

                                try {
                                    const revokeResult = await connFactory.revoke({
                                        revokeUrl: existingConn.oauth2.revokeServiceUrl,
                                        refreshToken: existingConn.refreshToken,
                                        teamId: message.team_id
                                    }, controller);

                                    if (revokeResult === 'success') {
                                        connFactory.getAuthUrl(message.team_id);
                                    } else {
                                        convo.say(revokeResult);
                                    }
                                } catch (err) {
                                    console.log('revoke error:', err);
                                }
                                convo.next();
                            }
                        },
                        {
                            pattern: bot.utterances.no,
                            callback: (response, convo) => {
                                convo.say(`Ok, You're still connected to your old org.`);
                                convo.next();
                            }
                        },
                        {
                            default: true,
                            callback: (response, convo) => {
                                convo.say(`Sorry, I didn't understand that. Please provide a yes or no response.`);
                                convo.repeat();
                                convo.next();
                            }
                        }], {}, 'default');
                });
            }
        } catch (err) {
            console.log('error:', err);
        }
    });
}