
module.exports = function(controller) {

    /* controller.on('test_event', (p1, p2) => {
        console.log(p1, p2);
    }); */

    controller.on(
        'direct_message',
        async (bot, message) => {
            console.log('nlp response----');
            console.log(message.intent, message.entities, message.fulfillment);
            await bot.reply(message, `intent detected - ${message.intent}`);
        }
    );

    controller.on('oauth_success', async authData => {

        try {
            let existingTeam = await controller.plugins.database.teams.get(authData.team_id);
            let isNew = false;

            if (!existingTeam) {
                isNew = true;
                existingTeam = {
                    id: authData.team_id,
                    name: authData.team_name,
                    is_migrating: false
                };
            }
            existingTeam.bot = {
                token: authData.bot.bot_access_token,
                user_id: authData.bot.bot_user_id,
                app_token: authData.access_token,
                created_by: authData.user_id
            };
            await controller.plugins.database.teams.save(existingTeam);

            if (isNew) {
                let bot = await controller.spawn(authData.team_id);
                controller.trigger('create_channel', bot, authData);
                controller.trigger('onboard', bot, authData.user_id);
            }
        } catch (err) {
            console.log(err);
        }
    });

    controller.on('onboard', async (bot, userId) => {
        await bot.startPrivateConversation(userId);
        await bot.say('Hello, I\'m REbot.');
    });

    controller.on('create_channel', async (bot, authData) => {

        try {
            let result = await bot.api.channels.join({
                token: authData.access_token,
                name: '#crp_team'
            });
            const crpTeamChannel = {
                id: result.channel.id,
                name: result.channel.name,
                team_id: authData.team_id
            };
            await controller.plugins.database.channels.save(crpTeamChannel);
        } catch (err) {
            console.log('error setting up crp_team channel:', err);
        }
    });

    controller.on('app_uninstalled', async (ctrl, event) => {

        try {
            // const existingConn = await connFactory.getConnection(event.team_id, controller);
            const channels = await controller.plugins.database.channels.find({ team_id: event.team_id });

            if (channels && channels.length > 0) {
                await controller.plugins.database.channels.delete(channels[0].id);
            }

            // add org delete code

            /* if (existingConn) {
                let teamData = { removeTeam: event.team_id };
                saveTeamId(existingConn, teamData);
                const revokeResult = await connFactory.revoke({
                    revokeUrl: existingConn.oauth2.revokeServiceUrl,
                    refreshToken: existingConn.refreshToken,
                    teamId: event.team_id
                }, controller);
                console.log('delete org result:', revokeResult);
            } */
            await controller.plugins.database.teams.delete(event.team_id);
        } catch (err) {
            console.log(err);
        }
    });

    controller.on('grid_migration_started', async (ctrl, event) => {

        try {
            let team = await controller.plugins.database.teams.get(event.team_id);

            if (team) {
                team.is_migrating = true;
                await controller.plugins.database.teams.save(team);
            }
        } catch (err) {
            console.log(err);
        }
    });

    controller.on('grid_migration_finished', async (ctrl, event) => {

        try {
            let team = await controller.plugins.database.teams.get(event.team_id);

            if (team) {
                team.is_migrating = false;
                await controller.plugins.database.teams.save(team);
            }
        } catch (err) {
            console.log(err);
        }
    });

}