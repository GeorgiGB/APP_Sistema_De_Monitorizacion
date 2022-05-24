const TelegramBot = require('node-telegram-bot-api');
var debug = require('../comandos/globales')
var log = require('../logs.json')
const tokenBot = require('./tokenBot.json')
const ust = require('../usuarios_telegram.json')

//  Funcion que manda un mensaje de notificacion tanto en correo como en telegram
function notificacion()
{
  if(log[1]&&log[1].nombre){
    return [
      'Codigo de error: '+log[0].cod_error+
      '\nNombre: '+log[1].nombre+
      '\nId: '+log[1].id_logs+
      '\nRegistro: '+log[1].registros+
      '\nFecha de alta: '+log[1].fecha_alta+
      '\nNombre de la accion: '+log[1].acciones_id+
      '\n-----------------------'+
      '\nResultado: '+log[1].resultado+
      '\n-----------------------',
      ];
  }else{
    //  Si el json esta vacio mandaremos un mensaje predeterminado
    return 'No hay mensajes';
  }
}

async function botTelegram(){
//  Token del bot
const token = tokenBot.token;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

//  Manda un mensaje automático de los errores del dia actual
  debug.msg('Mandando mensaje automatico a los usuarios');
  var chatIds = ust.slice(1);
  
  for (const key in chatIds) {
      const chat_id = chatIds[key].chat_id;
      //debug.msg(chat_id)
      bot.sendMessage(chat_id,'MENSAJE DEL SERVIDOR:\n'+notificacion());
  }
}

module.exports={
  botTelegram:botTelegram,
  notificacion:notificacion
}