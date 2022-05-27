const TelegramBot = require('node-telegram-bot-api');
var globales = require('../comandos/globales')
const tokenBot = require('./tokenBot.json')
const notificacion = require('./notificacion')
const usu_mensajeria = require('../usuarios_mensajeria.json')

async function botTelegram(){
//  Token del bot
const token = tokenBot.token;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

//  Manda un mensaje automático de los errores del dia actual
  //globales.msg('Mandando mensaje automatico a los usuarios');
  var chatIds = usu_mensajeria.slice(1);
  //globales.msg(JSON.stringify(chatIds[0].telegram))
  for (const key in chatIds) {
      const chat_id = chatIds[key].telegram;
      //globales.msg(JSON.stringify(chat_id))
      
      bot.sendMessage(chat_id,'MENSAJE DEL SERVIDOR:\n'+notificacion()).then((x)=>{
        globales.msg(x)
      }).catch((e)=>{
        //FUNCION PARA DETECTAR ERRORES
        globales.msg()
      })
  }
}

module.exports=botTelegram;