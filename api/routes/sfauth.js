
const connFactory = require('../../util/connection-factory');
const emitter = require('../../common/event-emitter');

module.exports = (app, controller) => {

    app.get('/sfauth/callback', (req, res) => {
        console.log('auth callback');
        let conn = connFactory.connect(req.query.code, controller, );
        res.redirect(conn.instanceUrl);

        emitter.on('init-sf-auth', data => {
            console.log(data);
        });
    });
}