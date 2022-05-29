//  Funciones generales del programa
const globales = require('./globales');
const fetch = require('node-fetch');// npm i node-fetch@2
const ver_acciones = require('./ver_acciones');
const inserta_log = require('./inserta_log');
var nodemailer = require('nodemailer');//NPM para mandar correos
const conexion = require('../config/db.config.js');
const tokenBot = require('../config/tokenBot.json');
const usuCorreo = require('../config/correo.json');const TelegramBot = require('node-telegram-bot-api');
const { Estados } = require('./acciones');


const Desde = new Date(0);
const Mensajerias = {};
const TipusMensajeria = {
    email:'email',
    telegram:'telegram'
}

// imortante para otro tipo de servicios mira en https://nodemailer.com/smtp/well-known/
// para la configuración completa
const Service = 'gmail';


async function usuarios_mensajeria(){
    let res = await conexion.query("SELECT * FROM ver_usuarios_mensajeria()")
    var usuarios = res.rows[0].jresultado; 
    var error = usuarios[0].cod_error
    lista_mensajeria = [];

    if(error === '0'){
        for (var i= 1; i < usuarios.length ;i++) {
            lista_mensajeria.push(usuarios[i])
        }
    }
    
    //  Creación de un nuevo archivo en el que se guardaran los usuarios_mensajeria
    // globales.crearJSon('usuarios_mensajeria',JSON.stringify(usuarios))
    
    //globales.msg(lista_mensajeria)

    return lista_mensajeria;
}

async function ver_logs(json_logs){
    
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM ver_logs('"+JSON.stringify(json_logs)+"');");
    
    let jresultado = res_logs.rows[0].jresultado;

    //  Creación de un nuevo archivo en el que se guardaran los logs
    globales.crearJSon('logs',JSON.stringify(jresultado))

    return jresultado;
}

function estructuraMensaje(log){
    with(log){
        var msg = ' --- Acción --- '
            +'\nNombre: '+acc_nombre+',  Id: '+lg_acciones_id
            +'\nAcción: '+acc_accion
            +'\n-----------------------'
            +'\nDescripción: '+acc_descripcion
            +'\n-----------------------'
            +'\n'
            +'\n --- Log ---'
            +'\nId: '+lg_id_logs+',  Estado: '+lg_estado
            +'\nFecha: '+lg_fecha_alta
            +'\nEnviado: '+lg_fecha_envio
            +'\n-----------------------'
            +'\nDescripción: '+lg_descripcion
            +'\n-----------------------';
        return msg;
    }
}

function enviaMensajeUsuario(mensaje, usuario, log){
    //globales.msg(mensaje);
    globales.msg(usuario);
    for (const tipus in usuario.mensajeria) {
        Mensajerias[tipus](mensaje, usuario, log);
    }
}


function envia(){
    usuarios_mensajeria().then(async (usuarios)=>{
        // ya tengo los usuarios

        var logs = await ver_logs({ desde: Desde, estado: Estados.ko });
        // ahora el log
        return { usuarios: usuarios, logs: logs };

        
    }).then((mens)=>{
        mens.logs.forEach((log, i) => {
            if(i==1){
                var mensa = estructuraMensaje(log);

                mens.usuarios.forEach((usuario, k) => {
                    if(k==1){
                        enviaMensajeUsuario(mensa, usuario, log);
                    }
                    
                });
            }
            
        });
    }).catch((e)=>{
        globales.msg(e);
        //! TODO crear el envío a los usuarios
        //! administradores 
        //msg(e)
    });

}

async function mandarCorreo(mensaje, usuario, log){
    return;
    globales.msg('Envía email');
    //Creamos el objeto de que mandara el correo y elegiremos el servicio que queramos
    var transporter = nodemailer.createTransport({
        // imortante 
        service: Service,
        auth: {
            user: usuCorreo.user,
            pass: usuCorreo.pwd
        }
    })
    /*return
    var usu_correos = usuarios_mensajeria.slice(1);
    
    for (const key in usu_correos) {
      var correo = usu_correos[key].email;
      globales.msg(JSON.stringify(correo))
    }*/

    globales.msg(log? usuario.email:'no');
    
    //  Cuerpo del mensaje enviante
    var mailOptions = {
        from: usuCorreo.user, // Recoge el usuario escrito en el archivo json
        to: usuario.mensajeria.email+'l', //  Se lo manda a la/s personas que esten en el listado de correos !CAMBIAR
        subject: log.acc_nombre+': '+log.lg_estado, // El asunto sera el nombre del error del servidor
        text: mensaje// El mensaje sera toda la estructura del error
    };

    if(usuario.usuario!='joan')
        return;
    
    //  Comando para mandar el correo junto con mailOptions
    transporter.sendMail(mailOptions, function(error, info){
        for (const key in info) {
            globales.msg(info);
        }
        
        if (error) {


            globales.msg(error);
        } else {

            // hay que mirar info las respuestas que da
            globales.msg('Email enviado: ' + info);
        }
        transporter.close();
      });
}

    
async function botTelegram(mensaje, usuario, log){
    globales.msg('Envía telegram')

    if(usuario.usuario!='joan')
        return;

    //  Token del bot
    const token = tokenBot.token;

    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {polling: true});
    
    //  Manda un mensaje automático de los errores del dia actual
    //globales.msg('Mandando mensaje automatico a los usuarios');
    var chatId = usuario.mensajeria.telegram;
    //globales.msg(JSON.stringify(chatIds[0].telegram))
        
        bot.sendMessage(chatId,mensaje).then((x)=>{
            globales.msg(x)
        }).catch((e)=>{
            //FUNCION PARA DETECTAR ERRORES
            globales.msg()
        })
}

Mensajerias[TipusMensajeria.email]=mandarCorreo;
Mensajerias[TipusMensajeria.telegram]=botTelegram;

module.exports = {
    envia:envia
}