const TelegramBot = require('node-telegram-bot-api');
var globales = require('../comandos/globales')
const tokenBot = require('./tokenBot.json')

globales.crearJSon('usuarios_telegram','[{}]')
const ust = require('../usuarios_telegram.json')

async function botTelegram(){
//  Token del bot
const token = tokenBot.token;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

//  Manda un mensaje automático de los errores del dia actual
  //globales.msg('Mandando mensaje automatico a los usuarios');
  var chatIds = ust.slice(1);
  
  for (const key in chatIds) {
      const chat_id = chatIds[key].chat_id;
      globales.msg(chat_id.toString())
      bot.sendMessage(chat_id,'MENSAJE DEL SERVIDOR:\n'+notificacion());
  }
}

module.exports={
  botTelegram:botTelegram
}