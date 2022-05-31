//  Funciones generales del programa
const globales = require('./globales');
const fetch = require('node-fetch');// npm i node-fetch@2
const ver_acciones = require('./ver_acciones');
const inserta_log = require('./inserta_log');
var nodemailer = require('nodemailer');//NPM para mandar correos
const conexion = require('../config/db.config.js');
const tokenBot = require('../config/tokenBot.json');
const usuCorreo = require('../config/correo.config.json');
const TelegramBot = require('node-telegram-bot-api');
const { Estados } = require('./acciones');
const { TipusMensajeria, Rechazado } = require('./mensajeria');
const { addMensajeAdminstrador } = require('./correos2');


//  Token del bot
const token = tokenBot.token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

let enProceso = 0;

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  
function multiUsuariosTelegram(mensaje, usuarios, log, alFinalizar){
    var totalUsuarios = usuarios.length;
    var rechazados = [];

    usuarios.forEach(async usuario => {
        // Telegram solo envía mensajes de 1 en 1
        // y un máximo de 30 mensajes/segundo
        enProceso++;
        if(enProceso>30){
            var e = await delay(1000);
            
        }
        
        botTelegram(mensaje, usuario, log).then((rechazado)=>{
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
                alFinalizar(rechazados);
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
        let status = e.response.statusCode;

        // Creamos el objeto rechazado
        var rechazado = new Rechazado(
            TipusMensajeria.telegram,
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