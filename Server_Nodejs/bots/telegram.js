//  Funciones generales del programa
const globales = require('../comandos/globales');
const tokenBot = require('../config/tokenBot.json');
const TelegramBot = require('node-telegram-bot-api');
const { Estados } = require('../comandos/acciones');
const { TipoMensajeria: TipoMensajeria, Rechazado } = require('../mensajeria/mensajeria');
const { addMensajeAdminstrador } = require('./correos');


//  Token del bot
const token = tokenBot.token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Contamos los proceso de envío de telegram
let enProceso = 0;

// Telegram sólo permite enviar 30 mensajes/segundo 
// por lo que creamos un retraso
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }


// Función para enviar un mismo mensaje a múltiples usuarios
function multiUsuariosTelegram(mensaje, usuarios, log, alFinalizar){
    var totalUsuarios = usuarios.length;
    var rechazados = [];

    usuarios.forEach(async usuario => {
        // Telegram solo envía mensajes de 1 en 1
        // y un máximo de 30 mensajes/segundo
        // aquí realizamos el control de la cantidad de mensajes que
        // se han enviado en un segundo
        // así que toca esperar
        if(enProceso>=30){
            var e = await delay(1000);
            
        }
        // ya podemos iniciar el proceso
        enProceso++;
        

        //Enviamos el telegram
        botTelegram(mensaje, usuario, log).then((rechazado)=>{
            // Si es rechazado lo ponemos en la lista de rechazados
            if(rechazado){
                rechazados.push(rechazado);
            }
        }).catch((e)=>{
            globales.msg(e)
            //! un error no contemplado
            //! enviar a administrador?
        }).finally(()=>{
            totalUsuarios--;
            if(totalUsuarios<=0){
                // devolvemos una copia de rechazados y lo vaciamos
                if(alFinalizar){
                    alFinalizar(rechazados, log);
                }
                rechazados = [];
            }
            // una vez finalizado el proceso lo descontamos;
            enProceso--;
        });
    });
}
    
async function botTelegram(mensaje, usuario, log){

    //globales.msg('esoty enviando');
    //  Manda un mensaje automático de los errores del dia actual
    var chatId = usuario.mensajeria.telegram;
        
        //globales.msg(usuario.usuario)
    return bot.sendMessage(chatId,mensaje).then((x)=>{
        /*globales.msg('Telegram enviado ---------');
        globales.msg(x)*/
        return false;
    }).catch((e)=>{
        //globales.msg(e)
        let status = e.response? e.response.statusCode:-1;

        // Creamos el objeto rechazado
        var rechazado = new Rechazado(
            TipoMensajeria.telegram,
            chatId,
            log.lg_cod,
            usuario.cod,
            usuario.usuario,
            e.toString()
        );

        // No se encuentra el chat o cualquier otro error
        if(status>=300&&status<500){
            
            // por tanto no lo vamos a devolver como
            // rechazado pero si informar al administrador
            globales.msg("informa al administrador");
            addMensajeAdminstrador(rechazado);
            //addMensajeAdminstrador(rechazado);
            return false;
        }
        return rechazado;
    })
}

var yy = 0;

module.exports = {
    multiUsuariosTelegram:multiUsuariosTelegram,
}