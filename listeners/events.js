
const logger = require('../common/logger');

module.exports = controller => {

    controller.on('app_uninstalled', data => {
        console.log('app uninstalled:', data);
    });

    controller.on('onboard', bot => {

        bot.startPrivateConversation({ user: bot.config.createdBy }, (err, convo) => {

            if (err) {
                logger.log(err);
            } else {
                convo.say('I am a bot. I have joined your workspace!');
            }
        });
    });

    controller.on('post-message', async data => {

        try {

            if (data.teamId) {
                const team = await controller.storage.teams.get(data.teamId);

                if (!team) {
                    return logger.log(`team not found, provided id: ${data.teamId}`);
                }
                const bot = controller.spawn(team.bot);

                bot.api.users.lookupByEmail({
                    token: team.bot.token,
                    email: data.userEmail
                }, (err, result) => {

                    if (err) {
                        logger.log(err);
                    }

                    if (!result) {
                        logger.log(`user not found, provided email: ${data.userEmail}`);
                    }

                    bot.startPrivateConversation({ user: result.user.id }, (err, convo) => {

                        if (err) {
                            logger.log(err);
                        } else {
                            convo.say(data.message);
                        }
                    });
                });
            }
        } catch (err) {
            logger.log(err);
        }
    });
}