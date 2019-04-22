
module.exports = (app, controller) => {
    
    app.post('/slack/receive', (req, res) => {
        // console.log(req.body.event);
        res.status(200);
        controller.handleWebhookPayload(req, res);
    });

    app.post('/slack/interactive', (req, res) => {
        console.log('interactive payload:', req.body);
        res.status(200);
        controller.handleWebhookPayload(req, res);
    });
}