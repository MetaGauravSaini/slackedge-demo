

const logger = require('../common/logger');

module.exports = controller => {

    controller.on('create_channel', (auth, bot) => {
        console.log('event received');

        bot.api.channels.create({
            token: auth.access_token,
            name: 'crp_team'
        }, (err, data) => {

            if (err) {
                return logger.log('channel create error:', err);
            }
            const crpTeamChannel = {
                id: data.channel.id,
                name: data.channel.name,
                team_id: auth.identity.team_id
            };
            controller.storage.channels.save(crpTeamChannel, (err, id) => {

                if (err) {
                    logger.log('channel save error:', err);
                }
            });
        });
    });
}