
module.exports = (app, controller) => {

    app.post('/post-message', (req, res) => {
        // to get message, teamId, userEmail/channelId and orgId in req body
        controller.trigger('post-message', [req.body]);
        res.status(200).json({ ok: true });
    });
}