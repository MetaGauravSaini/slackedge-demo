
module.exports = (app, controller) => {

    app.post('/slack/receive', (req, res) => {
        // console.log(req.body);

        // handle grid migration - use grid_migration_started, grid_migration_finished events
        
        if (req.body.event && req.body.event.type == 'app_uninstalled') {
            /* controller.storage.teams.delete(req.body.team_id, (err, data) => {
                console.log(err, data);
            }); */
        } else {
            controller.handleWebhookPayload(req, res);
        }
        res.status(200);
    });
}