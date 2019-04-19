
const connFactory = require('../../util/connection-factory');
const { saveTeamId } = require('../../util/refedge');

module.exports = (app, controller) => {

    app.get('/sfauth/callback', async (req, res) => {

        try {

            if (req.query.error) {
                console.log('error:', req.query.error);
                res.status(400).json({
                    status: 400,
                    ok: false,
                    message: 'auth failed'
                });
            }

            if (req.query.code && req.query.state) {
                let conn = await connFactory.connect(req.query.code, controller, req.query.state);
                saveTeamId(conn, req.query.state);
                res.status(302);
                res.redirect('/auth-success.html');
            }
        } catch (err) {
            console.log('Error:', err);
        }
    });
}