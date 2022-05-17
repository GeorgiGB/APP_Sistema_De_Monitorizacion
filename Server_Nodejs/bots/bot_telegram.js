const TelegramBot = require('node-telegram-bot-api');
var debug = require('../comandos/globales')

function botTelegram(mensaje){
// replace the value below with the Telegram token you receive from @BotFather
const token = '5376651327:AAEkV6M9BYI-FgubYtYQjxSnJuZQyxUQqwM';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  

  const chatId = msg.chat.id;

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, mensaje);

});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, resp);
});

}

module.exports=botTelegram;