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

  // globales.msg(typeof msgBot)
  // globales.msg("1 " +msgBot)
  // for (const key in msgBot) {
  //   if (Object.hasOwnProperty.call(msgBot, key)) {
  //     const element = msgBot[key];
  //     globales.msg(key+" "+element)
  //   }
  // }

## Mandar mensaje automaticos en telegram

Para la creación de un bot en telegram, accedemos a la aplicación de Telegram y buscamos el bot @botFather, permite la creación de un bot en sencillos pasos. Le identificaremos con un nombre y una descripcion(opcional) y al seguir los pasos el botFather enviara el token del bot y un link directo para poder empezat a interactuar con el. El token se usara para hacer la conexión con nodejs y especificar que queremos que haga.

Se necesita de la instalacion del modulo de telegram en nodejs, npm install node-telegram-bot-api. Creamos un nuevo archivo en donde escribiremos la configuración del bot.

Ejemplo de como seria la inicialización de un bot que cuando reciba un mensaje este responda con un mensaje por defecto.

```js
const TelegramBot = require('node-telegram-bot-api');

// Aqui pondriamos el token que nos ha enviado el botfather
const token = 'TOKEN_BOT';

const bot = new TelegramBot(token, {polling: true});

// Espera la respuesta de cualquier entrada de texto, foto, imagen, etc...
bot.onText(/\/echo (.+)/, (msg, match) => {
  // Desde aqui es donde el bot escucha el mensaje
  // el resultado de la ejecución de la regexp anterior en el contenido del texto

  const chatId = msg.chat.id;
  const resp = match[1]; // recibe cualquier cosa

  bot.sendMessage(chatId, resp);
});

// A la espera para escuchar cualquier mensaje.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // manda el mensaje al chat correspondiente
  bot.sendMessage(chatId, 'Received your message');
});
```

Una vez escrito la configuración del bot nos dirigimos al archivo principal de node e inicializamos el programa. El bot estara constantemente leyendo el json que se ha creado con anterioridad para mandar el mensaje mas reciente al usuario.

```js
const TelegramBot = require('node-telegram-bot-api');
var globales = require('../comandos/globales')
const tokenBot = require('./tokenBot.json')
const notificacion = require('./notificacion')
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
      bot.sendMessage(chat_id,'MENSAJE DEL SERVIDOR:\n'+notificacion()).then(()=>{
        //FUNCION QUE ACTUALICE LA TABLA DE TELEGRAM LOG ENVIADOS
        
      });
  }
}

module.exports=botTelegram;
```

## Motivo del uso del bot de telegram y schedule

Para tener una mayor facilidad de monitorizar el servidor, el bot nos proporciona unas ejecuciones y avisos precisos para saber en cada momento el estado del servidor, si el servidor se encuentra fallido el bot enseguida dara la alerta de en que estado se encuentra y proporcionara el posible fallo que haya ocurrido. El bot esta hecho de forma que cada dia, hora o 5 min pueda estar registrando la base de datos y vaya observando dependiendo el tipo de acciones hayan registradas. Mediante el modulo de node-cron podemos automatizar cualquier tarea del servidor.

```js
var cron = require('node-cron');

cron.schedule('*****', () => {
  console.log('running a task every minute');
});

```

[nodecron](https://github.com/node-cron/node-cron)

Cada "*" representa los meses, dias, horas, minutos y segundos

```
# |-----------  segundos (opcional)

# | |---------  minutos (0-59)

# | | |-------  horas (0-59)

# | | | |-----  dia de la semana(1-31)

# | | | | |---  meses(1-12 o nombres)

# | | | | | |-  dia del mes(0-7 o nombres)

# * * * * * *
```

Para hacer que el bot vaya constantemente haciendo peticiones en la base de datos introduciremos el bot de telegram al modulo schedule inicializandolo en el index.js

```js
const job = cron.schedule('5* * * * *',()=>{
    let res_anterior = []
    logs({desde:"2022-05-17", hasta:"2022-05-20"}).then((x)=>{
      //fechas de ejemplo para realizar acciones creadas desde esos dias
        globales.msg(x)
        let res = x
        if(res_anterior!=res){
            res = res_anterior
            globales.msg("mandando mensaje desde index")
            r = bot()
        }else{
            globales.msg("no hay novedades")
    }
})
},{
    scheduled: true
});

job.start();//inicializacion

```

Indicamos el tiempo que queremos que haga la petición y esperaremos a las acciones asociadas durante esas fechas. El uso de las fechas es indiferente, se puede indicar tanto por id como por nombre de la acción. La base de datos contiene una tabla con información de cada acción que tiene que hacer el servidor. Si dejamos la función vacia, únicamente hara las acciones que tienen registradas en el mismo dia.
