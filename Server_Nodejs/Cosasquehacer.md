# NPM para instalar

npm install express

npm install nodemon

//Manda mensaje al correo
npm install nodemailer

npm install node-telegram-bot-api

bot de telegram para configurar uno nuevo

## Mandar mensajes bot JAVASCRIPT

<https://tecnops.es/crear-un-bot-en-telegram-y-enviar-mensajes-usando-javascript/>

<https://www.w3schools.com/nodejs/nodejs_email.asp>

Al sincronizar desde otro dispositivo el bot de mandar correos dara constantes fallos ya que no contiene un correo y contraseña, se ha de crear un archivo .json. Y se le indicara la ruta del archivo
Comprobar el tipo de elemento:

  // debug.msg(typeof msgBot)
  // debug.msg("1 " +msgBot)
  // for (const key in msgBot) {
  //   if (Object.hasOwnProperty.call(msgBot, key)) {
  //     const element = msgBot[key];
  //     debug.msg(key+" "+element)
  //   }
  // }

## Mandar mensaje automaticos en telegram

Para la creación de un bot en telegram, necesitamos acceder a la aplicación de Telegram y hablar con @botFather, permite crear un bot en sencillos pasos. Al seguir los pasos el botFather te dara el token del bot. El cual se usara para la configuración en node para la conexión.

Necesitas instalar el modulo de telegram, npm install node-telegram-bot-api. Creamos un nuevo archivo en donde ira nuestro bot.

```js
const TelegramBot = require('node-telegram-bot-api');

async function botTelegram(){
//  Token del bot
const token = token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

//  Manda un mensaje
bot.sendMessage(msgBot.chat.id,'Mensaje de prueba');

}
```
