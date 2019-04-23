
const connFactory = require('../../util/connection-factory');
const controller = require('../../bot');
const logger = require('../../common/logger');

module.exports = async (req, res, next) => {

    if (req.body.team_id && req.body.event && req.body.event.type == 'app_uninstalled') {

        try {
            const existingConn = await connFactory.getConnection(req.body.team_id, controller);

            if (existingConn) {
                const revokeResult = await connFactory.revoke({
                    revokeUrl: existingConn.oauth2.revokeServiceUrl,
                    refreshToken: existingConn.refreshToken,
                    teamId: req.body.team_id
                }, controller);
                logger.log(`delete org data result: ${revokeResult}`);
            }
            const delResult = await controller.storage.teams.delete(req.body.team_id);
            logger.log(`delete org team result: ${delResult}`);
        } catch (err) {
            return logger.log(err);
        }
        res.status(200);
        res.end('');
    } else {
        next();
    }
}