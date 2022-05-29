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



async function usuarios_mensajeria(){
    let res = await conexion.query("SELECT * FROM ver_usuarios_mensajeria()")
    var usuarios = res.rows[0].jresultado; 
    var error = usuarios[0].cod_error
    lista_mensajeria = [];

    if(error === '0'){
        for (var i= 0; i < usuarios.length ;i++) {
            lista_mensajeria.push(usuarios[i])
        }
    }
    
    //  Creación de un nuevo archivo en el que se guardaran los usuarios_mensajeria
    // globales.crearJSon('usuarios_mensajeria',JSON.stringify(usuarios))

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

async function logEnviado(json_logs){
    
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM log_enviado('"+JSON.stringify(json_logs)+"');");
    
    let jresultado = res_logs.rows[0].jresultado;

    //  Creación de un nuevo archivo en el que se guardaran los logs
    globales.crearJSon('logs',JSON.stringify(jresultado))

    return jresultado;
}

function estructuraMensaje(log){
    with(log){
        var msg = ' --- Acción --- '
            +'\nNombre: '+acc_nombre+',  Id: '+lg_acc_cod
            +'\nAcción: '+acc_accion
            +'\n-----------------------'
            +'\nDescripción: '+acc_descripcion
            +'\n-----------------------'
            +'\n'
            +'\n --- Log ---'
            +'\nId: '+lg_cod+',  Estado: '+lg_estado
            +'\nFecha: '+lg_fecha_alta
            +'\nEnviado: '+lg_fecha_envio
            +'\n-----------------------'
            +'\nDescripción: '+lg_descripcion
            +'\n-----------------------';
        return msg;
    }
}



const Desde = new Date(0);
const Mensajerias = {};
const TipusMensajeria = {
    email:'email',
    telegram:'telegram'
}

// imortante para otro tipo de servicios mira en https://nodemailer.com/smtp/well-known/
// para la configuración completa
const Service = 'gmail';

class Rechazado{
    constructor(tipo, destino, log_cod, usm_cod, razon){
        this.tipo = tipo;
        this.destino = destino;
        this.log_cod = log_cod;
        this.usm_cod = usm_cod;
        this.razon = razon;
    }

    mismoLogUsuario(rechazado){
        return this.log_cod == rechazado.log_cod
            && this.usm_cod == rechazado.usm_cod;
    }
}

class Buff{
    
    #total = 0;

    constructor(){
        this.finaliza = false;
        this.tiposRechazados = {};
        for (const tipus in TipusMensajeria) {
            this.tiposRechazados[tipus]=[];
            this.#total ++;
        }
    
    }

    async inicia(){
        var usuLogs = {logs:[], usuarios:[]};
        usuarios_mensajeria().then(async (usuarios)=>{
            // ya tengo los usuarios
            usuLogs.usuarios = usuarios;

            // ahora los logs
            usuLogs.logs = await ver_logs({ desde: Desde, estado: Estados.ko });

            
        }).then(()=>{
            // El log[0] contiene cod_error, por tanto si hay error sólo tenemos un
            // registro y no se envia nada
            usuLogs.logs.forEach((log, i) => {
                if(i==1){
                    var mensa = estructuraMensaje(log);
                    // this.enviaEmailATodos(mensa, usuLogs.usuarios, log);

                    usuLogs.usuarios.forEach((usuario, k) => {
                        if(k==3){
                            //! Descomenta la siguiente línea
                            this.enviaMensajeUsuario(mensa, usuario, log);
                        }
                        
                    });
                }
                
            });
            
        });
    }

    enviaEmailATodos(mensa, usuarios, log){
        enviaEmailUsuarios(mensa, usuarios, log)
            .then((rechazados)=>{
                this.tiposRechazados[TipusMensajeria.email] = rechazados
                this.gestionaRechazados();
            });
    }

    enviaMensajeUsuario(mensaje, usuario, log){
        for (const tipus in usuario.mensajeria) {
            if(tipus==TipusMensajeria.email || tipus=='emailo'){
                continue;
            }

            this.#total++;
            Mensajerias[tipus](mensaje, usuario, log).then((rechazados)=>{
                this.tiposRechazados[tipus].push(rechazados);
                globales.msg(rechazados);
                this.gestionaRechazados();
            });
        }
    }

    gestionaRechazados(){
        this.#total--;
        if(this.#total==0){

        }
    }
}

async function enviaEmailUsuarios(mensaje, usuarios, log){

    var mailList = [];
    var mailUsuarioCod = {}
    usuarios.forEach(usuario => {
        var email = usuario.mensajeria.email;
        if(email){
            mailList.push(email);
            mailUsuarioCod[email] = usuario.cod;
        }
    });

    if(mailList.length==0){
        return mailList;
    }

    Mensajerias[TipusMensajeria.email](mensaje, mailList, log,
        function(error, info){
            
            if (error) {
    
                //! Enviar este error?
                //! no deberia dar error
                globales.msg('Error node mailer -------');
                globales.msg(error);
                return[];
            } else {
                // El mensaje se ha enviado
                var lgEnviado = {cod:log.lg_cod, fecha: new Date(), enviado:true};
                
                // Marcamos en la BBDD los mensajes enviado
                logEnviado(lgEnviado).catch((e)=>{
                    //! Enviar este error?
                    //! no deberia dar error
                    globales.msg(e)
                });
                var rechazados = info.rejectedErrors;
                for (var i=0; i<rechazados.length; i++){
                    var rechazado = rechazados[i];
                    var email = info.rejected;
                    rechazados.push(
                        new Rechazado(
                            TipusMensajeria.email,
                            email,
                            log.lg_cod,
                            mailUsuarioCod[email],
                            rechazado.response)
                    );
                }
                return rechazados;
            }
    });
}


function envia(){

    var buff = new Buff();
    buff.inicia().catch((e)=>{
        globales.msg('Catch Envia ----------');
        globales.msg(e);
        //! TODO crear el envío a los usuarios
        //! administradores 
    });
    

}

async function mandaCorreos(mensaje, mailList, log, alFinalizar){
    //Creamos el objeto de que mandara el correo y elegiremos el servicio que queramos
    var transporter = nodemailer.createTransport({
        // imortante 
        service: Service,
        auth: {
            user: usuCorreo.user,
            pass: usuCorreo.pwd
        }
    })
    
    //  Cuerpo del mensaje enviante
    var mailOptions = {
        from: usuCorreo.user, // Recoge el usuario escrito en el archivo json
        to: mailList, //  Se lo manda a la/s personas que esten en el listado de correos !CAMBIAR
        subject: log.acc_nombre+': '+log.lg_estado, // El asunto sera el nombre del error del servidor
        text: mensaje// El mensaje sera toda la estructura del error
    };
    
    //  Comando para mandar el correo junto con mailOptions
    transporter.sendMail(mailOptions, function(error, info){
        alFinalizar(error, info)
        transporter.close();
      });
}

    
async function botTelegram(mensaje, usuario, log){
    if(usuario.usuario!='joan')
        return;

    //  Token del bot
    const token = tokenBot.token;

    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {polling: true});
    
    //  Manda un mensaje automático de los errores del dia actual
    var chatId = usuario.mensajeria.telegram;
        
    return bot.sendMessage(chatId+1,mensaje).then((x)=>{
        globales.msg('Telegram enviado ---------');
        globales.msg(x)
        return [];
    }).catch((e)=>{
        return [ 
            new Rechazado(
                TipusMensajeria.telegram,
                chatId,
                log.lg_cod,
                usuario.cod,
                e.toString())
        ];
    })
}

Mensajerias[TipusMensajeria.email]=mandaCorreos;
Mensajerias[TipusMensajeria.telegram]=botTelegram;

module.exports = {
    envia:envia
}