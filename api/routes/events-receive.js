const checkMigration = require('../../util/check-grid-migration');

module.exports = (app, controller) => {

    const filterMiddleware = async (req, res, next) => {

        if (req.body.event && req.body.event.type != 'app_uninstalled') {
            const isTeamMigrating = await checkMigration(req.body.team_id, controller);

            if (!isTeamMigrating) {
                next();
            } else {
                res.sendStatus(200);
            }
        }
        next();
    }

    app.post('/slack/receive', filterMiddleware, (req, res) => {
        res.status(200);
        controller.handleWebhookPayload(req, res);
    });

    app.post('/slack/interactive', filterMiddleware, (req, res) => {
        res.status(200);
        controller.handleWebhookPayload(req, res);
    });
}