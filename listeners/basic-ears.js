
const connFactory = require('../util/connection-factory');
const logger = require('../common/logger');
const refedgeUtil = require('../util/refedge');

module.exports = controller => {

    /* controller.hears(['.*'], ['direct_message', 'direct_mention', 'mention'], async function (bot, message) {
        logger.log('err', message.watsonError, 'data', message.watsonData);

        if (message.watsonError) {
            await bot.reply(message, `I'm sorry, but for technical reasons I can't respond to your message`);
        } else {
            await bot.reply(message, message.watsonData.output.text.join('\n'));
        }
    }); */

    controller.hears('', 'direct_message,direct_mention', async (bot, message) => {

        try {
            const supportUrl = `https://www.point-of-reference.com/contact/`;

            if (message.text.includes('hello')) {
                bot.reply(message, `Hi, you can invite me to the channel for Customer Reference Team to receive updates!`);
            } else if (message.text == 'connect to a salesforce instance') {
                let existingConn = await connFactory.getConnection(message.team_id, controller);

                if (!existingConn) {
                    const authUrl = connFactory.getAuthUrl(message.team_id);
                    bot.reply(message, `click this link to connect\n<${authUrl}|Connect to Salesforce>`);
                } else {

                    bot.startConversation(message, (err, convo) => {
                        convo.addQuestion(
                            `You are already connected to a Salesforce instance. Are you sure you want to disconnect from it and connect to another instance?`,
                            [{
                                pattern: bot.utterances.yes,
                                callback: async (response, convo) => {

                                    try {
                                        const revokeResult = await connFactory.revoke({
                                            revokeUrl: existingConn.oauth2.revokeServiceUrl,
                                            refreshToken: existingConn.refreshToken,
                                            teamId: message.team_id
                                        }, controller);

                                        if (revokeResult === 'success') {
                                            const authUrl = connFactory.getAuthUrl(message.team_id);
                                            bot.reply(message, `click this link to connect\n<${authUrl}|Connect to Salesforce>`);
                                        } else {
                                            logger.log(revokeResult);
                                        }
                                    } catch (err) {
                                        logger.log('revoke error:', err);
                                    }
                                    convo.next();
                                }
                            },
                            {
                                pattern: bot.utterances.no,
                                callback: (response, convo) => {
                                    convo.say(`Ok, You are still connected to your old Salesforce instance.`);
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
            } else if (message.text.includes('show accounts')) {
                let existingConn = await connFactory.getConnection(message.team_id, controller);

                if (!existingConn) {
                    const authUrl = connFactory.getAuthUrl(message.team_id);
                    bot.reply(message, `You are not conected to a Salesforce instance. Click this link to connect now
<${authUrl}|Connect to Salesforce>`);
                } else {
                    const accList = await refedgeUtil.getAccounts(message.team_id, controller);
                    let replyBody = {
                        text: 'Here are the top 3 accounts.',
                        attachments: []
                    };

                    accList.records.forEach(acc => {
                        replyBody.attachments.push({
                            title: acc.Name,
                            callback_id: acc.Id,
                            attachment_type: 'default',
                            actions: [
                                { name: 'request', text: 'Request', value: 'yes', type: 'button' }
                            ]
                        });
                    });
                    bot.reply(message, replyBody);
                }
            } else if (message.text.includes('help')) {
                bot.reply(message, `I can connect you to a salesforce instance.
Just type 'connect to a salesforce instance' to get started.
Please visit the <${supportUrl}|Support Page> if you have any further questions.`);
            } else {
                bot.reply(message, `Sorry, I didn't understand that.`);
            }
        } catch (err) {
            logger.log(err);
        }
    });
}