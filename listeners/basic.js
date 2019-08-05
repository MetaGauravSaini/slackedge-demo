const { BotkitConversation } = require('botkit');

const { checkTeamMigration } = require('./middleware/migration-filter');
// const connFactory = require('../util/connection-factory');

module.exports = controller => {

    const my_dialog = new BotkitConversation('my_dialog', controller);
    my_dialog.say('Hello');
    controller.addDialog(my_dialog);

    controller.on('direct_message', async(bot, message) => {
        await bot.beginDialog('my_dialog');
    });


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

    controller.on('post_message', reqBody => {

        reqBody.messages.forEach(async msg => {

            try {
                let teamIdsArray = reqBody.teamId.split(',');
                const teams = await controller.plugins.database.teams.find({ id: { $in: teamIdsArray } });

                if (!teams || teams.length == 0) {
                    return console.log('team not found for id:', reqBody.teamId);
                }

                for (let index = 0, len = teams.length; index < len; index++) {
                    const isTeamMigrating = await checkTeamMigration(teams[index].id, controller);

                    if (!isTeamMigrating) {
                        const bot = await controller.spawn(teams[index].id);

                        if (msg.userEmail) {

                            let userSearchResult = await bot.api.users.lookupByEmail({
                                token: teams[index].bot.token,
                                email: msg.userEmail
                            });

                            if (!userSearchResult) {
                                return console.log('user not found in team ' + teams[index].id + ' for email:', msg.userEmail);
                            }
                            await bot.startPrivateConversation(userSearchResult.user.id);
                            await bot.say(msg.text);
                        } else {
                            const channels = await controller.plugins.database.channels.find({ team_id: teams[index].id });

                            if (channels && channels.length > 0) {
                                await bot.startConversationInChannel(channels[0].id);
                                await bot.say(msg.text);
                            }
                        }
                    } else {
                        console.log(`cannot post message for team id ${teams[index].id}, this team is in migration `);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        });
    });

}