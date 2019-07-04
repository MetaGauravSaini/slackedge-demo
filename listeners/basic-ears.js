
module.exports = controller => {

    controller.hears(
        ['Default Welcome Intent'],
        'direct_message',
        dialogflowMiddleware.hears,
        (bot, message) => {
            console.log(message);
            replyText = message.fulfillment.text;
            bot.reply(message, replyText);
        }
    );
}