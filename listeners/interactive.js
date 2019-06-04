
const logger = require('../common/logger');

module.exports = controller => {

    controller.on('interactive_message_callback', (bot, message) => {
        bot.reply(message, 'Thank you!!');
        logger.log(`selected account id = ${message.payload.callback_id}`);
    });
}