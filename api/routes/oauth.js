
module.exports = (app, controller) => {

    let authHandler = {
        login: (req, res) => {
            res.redirect(controller.getAuthorizeURL());
        },
        authorize: (req, res) => {
            let code = req.query.code; // check for error query param - req.query.error
            let state = req.query.state; // use state for verifying genuine requests
            let botInstance = controller.spawn({});

            let options = {
                client_id: controller.config.clientId,
                client_secret: controller.config.clientSecret,
                code: code
            };

            botInstance.api.oauth.access(options, (err, auth) => {

                if (err) {
                    return res.send('auth failed');
                }
                let scopes = auth.scope.split(/\,/);

                botInstance.api.auth.test({ token: auth.access_token }, (err, identity) => {

                    if (err) {
                        return res.send('auth failed');
                    }
                    auth.identity = identity;
                    controller.trigger('oauth:success', [auth]);
                    res.redirect(auth.identity.url);
                });
            });
        }
    };
    app.get('/login', authHandler.login);
    app.get('/oauth', authHandler.authorize);
    return authHandler;
}