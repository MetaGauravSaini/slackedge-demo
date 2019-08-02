
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

    controller.on('oauth_success', data => {
        console.log(data);
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
                controller.trigger('create_channel', bot, authData.access_token, authData.team_id);
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

    controller.on('create_channel', async (bot, accessToken, teamId) => {

        try {
            let result = await bot.api.channels.create({
                token: accessToken,
                name: 'crp_team'
            });
            const crpTeamChannel = {
                id: result.channel.id,
                name: result.channel.name,
                team_id: teamId
            };
            await controller.plugins.database.channels.save(crpTeamChannel);
        } catch (err) {
            console.log('error setting up crp_team channel:', err);
        }
    });

}