const TelegramBot = require('node-telegram-bot-api');
var debug = require('../comandos/globales')
var log = require('../logs.json')
const cron = require('node-cron')
const tokenBot = require('./tokenBot.json')
//var mensa = require('./mensaje')

function notificacion()
{
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
}


async function botTelegram(){
//const url = 'https://api.telegram.org/bot1078795718:AAGuecdHg_e2MWSgm1xIIrYdGMEj19nFCoI/sendMessage?text='+res+'&chat_id=950057203'
// replace the value below with the Telegram token you receive from @BotFather

const token = tokenBot.token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

//Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// bot.sendMessage(msg.chat.id, "Opciones", {
//   "reply_markup": {
//       "keyboard": [["Ultimos Registros", "Second sample"]]
//       }
//   });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msgBot) => {
  const chatId = msgBot.chat.id;
  bot.sendMessage(chatId, 'MENSAJE DEL SERVIDOR:\n'+notificacion());
  // send a message to the chat acknowledging receipt of their message
});

}

module.exports={
  botTelegram:botTelegram,
  notificacion:notificacion
}