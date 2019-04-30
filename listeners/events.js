
const logger = require('../common/logger');
const connFactory = require('../util/connection-factory');

module.exports = controller => {

    controller.on('grid_migration_started', async (ctrl, event) => {
        console.dir(ctrl);
        console.dir(event);

        try {
            let team = await controller.storage.teams.get(event.team_id);

            if (team) {
                team.is_migrating = true;
                controller.storage.teams.save(team);
            }
        } catch (err) {
            logger.log(err);
        }
    });

    controller.on('grid_migration_finished', async (ctrl, event) => {
        console.dir(ctrl);
        console.dir(event);

        try {
            let team = await controller.storage.teams.get(event.team_id);

            if (team) {
                team.is_migrating = false;
                controller.storage.teams.save(team);
            }
        } catch (err) {
            logger.log(err);
        }
    });

    controller.on('app_uninstalled', async (ctrl, event) => {

        try {
            console.log('event team id:', event.team_id);
            const existingConn = await connFactory.getConnection(event.team_id, controller);
            console.log('old conn:', existingConn);

            if (existingConn) {
                const revokeResult = await connFactory.revoke({
                    revokeUrl: existingConn.oauth2.revokeServiceUrl,
                    refreshToken: existingConn.refreshToken,
                    teamId: event.team_id
                }, controller);
                logger.log('delete org data result:', revokeResult);
            }
            const delResult = await controller.storage.teams.delete(event.team_id);
            logger.log('delete org team result:', delResult);
        } catch (err) {
            logger.log(err);
        }
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
                    return logger.log('team not found, provided id:', data.teamId);
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
                        return logger.log('user not found, provided email:', data.userEmail);
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