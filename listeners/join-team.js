
module.exports = controller => {

    controller.on('onboard', bot => {

        bot.startPrivateConversation({ user: bot.config.createdBy }, (err, convo) => {

            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot. I have joined your workspace!');
            }
        });
    });
}