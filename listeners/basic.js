
module.exports = function(controller) {

    controller.on(
        'direct_message',
        async (bot, message) => {
            console.log('nlp response----');
            console.log(message.intent, message.entities, message.fulfillment);
            await bot.reply(message, `intent detected - ${message.intent}`);
        }
    );

}