
module.exports = function(controller) {

    controller.on(
        'direct_message',
        async (bot, message) => {
            console.log('nlp response----');
            console.log(message.intent, message.entities, message.fulfillment);
            await bot.reply(message, `intent detected - ${message.intent}`);
        }
    );

    controller.on('test_ev', data => {
        console.log(data);
    });

    controller.on('oauth_success', data => {
        console.log(data);
    });

}