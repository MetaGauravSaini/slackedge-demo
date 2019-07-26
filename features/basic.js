const dialogflowMiddleware = require('../df-middleware');

module.exports = function(controller) {

    // use a regular expression to match the text of the message
    controller.hears(
        new RegExp(/^\d+$/),
        ['message', 'direct_message'],
        dialogflowMiddleware.hears,
        async (bot, message) => {
            console.log('df response----');
            console.log(message.intent, message.entities, message.fulfillment);
            await bot.reply(message, { text: 'I heard a number using a regular expression.' });
        }
    );

    // match any one of set of mixed patterns like a string, a regular expression
    controller.hears(
        ['allcaps', new RegExp(/^[A-Z\s]+$/)],
        ['message', 'direct_message'],
        async (bot, message) => {
            console.log('df response----');
            console.log(message.intent, message.entities, message.fulfillment);
            await bot.reply(message,{ text: 'I HEARD ALL CAPS!' });
        }
    );

}

/* FULL OAUTH DETAILS { ok: true,
  access_token:
   'xoxp-483103024786-482498576433-707476790775-43fe85ec9506f26035cc1a180d0b6931',
  scope:
   'identify,bot,team:read,users:read,users:read.email,channels:write',
  user_id: 'UE6ENGYCR',
  team_name: 'POR',
  team_id: 'TE7310QP4',
  bot:
   { bot_user_id: 'UEX6Q8RHP',
     bot_access_token: 'xoxb-483103024786-507228297601-VSjDgMNOWsabBJaZkXrLdsRp' } } */