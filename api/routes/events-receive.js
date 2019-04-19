
module.exports = (app, controller) => {

    app.post('/slack/receive', (req, res) => {
        // console.log(req.body.event);
        res.status(200);
        controller.handleWebhookPayload(req, res);
    });
}