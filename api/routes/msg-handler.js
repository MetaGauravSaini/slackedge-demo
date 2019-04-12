
module.exports = (app, controller) => {

    app.post('/post-message', (req, res) => {
        // fwd msgs received from SF to slack
        // to get message, team id and org id in req body
        console.log(req.body);
    });
}