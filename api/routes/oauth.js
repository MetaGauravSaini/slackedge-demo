
module.exports = controller => {

    /* controller.webserver.get('/test', async (req, res) => {
        res.send({ ok: true });
    }); */

    controller.webserver.get('/login', (req, res) => {
        res.redirect(controller.adapter.getInstallLink());
    });

    controller.webserver.get('/oauth', async (req, res) => {

        try {
            const authData = await controller.adapter.validateOauthCode(req.query.code);
            let newTeam = {
                id: authData.team_id,
                name: authData.team_name,
                is_migrating: false,
                bot: {
                    token: authData.bot.bot_access_token,
                    user_id: authData.bot.bot_user_id,
                    app_token: authData.access_token
                }
            };

            const saveResult = await controller.plugins.database.teams.save(newTeam);
            console.log(saveResult);
            controller.trigger('oauth_success', [newTeam]);
            res.redirect(`https://slack.com/app_redirect?app=${process.env.SLACK_APP_ID}`);
        } catch (err) {
            console.error('OAUTH ERROR: ', err);
            res.status(401);
            res.send(err.message);
        }
    });
}