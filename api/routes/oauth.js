
module.exports = controller => {

    controller.webserver.get('/test', async (req, res) => {

        /* const param1 = 'hello';
        const param2 = 'world';
        controller.trigger('test_event', param1, param2); */

        /* try {
            const teamData = await controller.plugins.database.teams.get('TE7310QP4');
            console.log('teams ', teamData);
            const channelData = await controller.plugins.database.channels.all();
            console.log('channels ', channelData);
            const orgData = await controller.plugins.database.orgs.find({ id: 'test' });
            console.log('orgs ', orgData);
        } catch (err) {
            console.log(err);
        } */
        res.send({ ok: true });
    });

    controller.webserver.get('/login', (req, res) => {
        res.redirect(controller.adapter.getInstallLink());
    });

    controller.webserver.get('/oauth', async (req, res) => {

        try {
            const authData = await controller.adapter.validateOauthCode(req.query.code);
            controller.trigger('oauth_success', authData);
            res.redirect(`https://slack.com/app_redirect?app=${process.env.SLACK_APP_ID}`);
        } catch (err) {
            console.error('OAUTH ERROR: ', err);
            res.status(401);
            res.send(err.message);
        }
    });
}