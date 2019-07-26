const dialogflowMiddleware = require('../df-middleware');

module.exports = function(controller) {

    controller.hears(
        ['can you nominate an account?'],
        ['message', 'direct_message'],
        dialogflowMiddleware.hears,
        async (bot, message) => {
            console.log('df response----');
            console.log(message.intent, message.entities, message.fulfillment);
            await bot.reply(message,{ text: 'I HEARD ALL CAPS!' });
        }
    );

    controller.on(
        'direct_message',
        async (bot, message) => {
            console.log('df response----');
            console.log(message.intent, message.entities, message.fulfillment);
            await bot.reply(message, 'I heard a private message');
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