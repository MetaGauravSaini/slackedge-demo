
const connFactory = require('../../util/connection-factory');
const { saveTeamId } = require('../../util/refedge');
const logger = require('../../common/logger');

module.exports = (app, controller) => {

    app.get('/sfauth/callback', async (req, res) => {

        try {

            if (req.query.error) {
                logger.log('salesforce auth error:', req.query.error);
                res.status(401);
                res.redirect('/auth-failed.html');
            }

            if (req.query.code && req.query.state) {
                let conn = await connFactory.connect(req.query.code, controller, req.query.state);
                let channels = await controller.storage.channels.find({ team_id: req.query.state });

                if (channels && channels.length > 0) {
                    saveTeamId(conn, req.query.state, channels[0].id);
                } else {
                    saveTeamId(conn, req.query.state);
                }
                res.status(302);
                res.redirect('/auth-success.html');
            }
        } catch (err) {
            logger.log('salesforce auth error:', err);
        }
    });
}