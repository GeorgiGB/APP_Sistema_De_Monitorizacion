//  Funciones generales del programa
const globales = require('./globales');
const fetch = require('node-fetch');// npm i node-fetch@2
const ver_acciones = require('./ver_acciones');
const inserta_log = require('./inserta_log');
var nodemailer = require('nodemailer');//NPM para mandar correos
const conexion = require('../config/db.config.js');
const tokenBot = require('../config/tokenBot.json');
const usuCorreo = require('../config/correo.config.json');
const {multiUsuariosTelegram} = require('./telegram2');
const {mandaCorreos, enviaFallos} = require('./correos2');
const { Estados } = require('./acciones');

const mensajeria = require('./mensajeria');
//const { enviaFallos,  } = require('./administrador');





const Desde = new Date(0);
const Mensajerias = {};
const TipusMensajeria = {
    email:'email',
    telegram:'telegram'
}


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

    return lista_mensajeria;
}

async function ver_logs(json_logs){
    
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM ver_logs('"+JSON.stringify(json_logs)+"');");
    
    let jresultado = res_logs.rows[0].jresultado;


    return jresultado;
}

async function logEnviado(jsonLogEnviado){
    
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM log_enviado('"+JSON.stringify(jsonLogEnviado)+"');");
    
    let jresultado = res_logs.rows[0].jresultado;


    return jresultado;
}

async function registraMensajesNoEnviados(json_logs){
    
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM registra_mensajes_no_enviados('"+JSON.stringify(json_logs)+"');");
    
    let jresultado = res_logs.rows[0].jresultado;

    return jresultado;
}


class Buff{
    
    #total = 0;
    #rechazados = [];

    constructor(){
    
    }

    inicia(){
        // Estas funciones son promesas por tanto el hilo principal
        // seguirá su camino aunque no hayan finalizado
        usuarios_mensajeria().then((usuarios)=>{
            // ya tengo los usuarios
            // elimino el primer usuario que hace referencia al cod_error
            usuarios.shift();

            // ahora los logs
            ver_logs({ desde: Desde, estado: Estados.ko, enviado:false }).then((logs)=>{

                // Ya podemos enviar
                // El log[0] contiene cod_error, por tanto si hay error sólo tenemos un
                // registro y no se envia nada
                logs.forEach((log, i) => {
                    if(i>0){
                        var mensa = mensajeria.estructuraMensaje(log);

                        this.#total++;
                        mandaCorreos(mensa, usuarios, log,
                            (this.finalizaEnvio).bind(this));

                        this.#total++;
                        multiUsuariosTelegram(mensa, usuarios, log,
                            (this.finalizaEnvio).bind(this));
                    }
                    
                });
            });

            
        });
    }

    async finalizaEnvio(rechazados, log){
        
        if(log){
            // El mensaje se ha enviado
            var lgEnviado = {cod:log.lg_cod, fecha: new Date(), enviado:true};
            // Marcamos en la BBDD los mensajes enviado
            logEnviado(lgEnviado).catch((e)=>{
                //! Enviar este error?
                //! no deberia dar error
            });
        }
        if(rechazados.length>0){
            this.#rechazados.push(...rechazados);
        }
        
        this.#total--;
        globales.msg(this.#total);
        //globales.msg('descontando: '+(this.#total==0));
        if(this.#total==0){
            globales.msg('dentro');
            var consultas = [];
            
                this.#rechazados.forEach(rechazado =>{

                    // miramos si existe una consulta
                    let consulta = consultas.find( quien =>{
                        return quien.usuario == rechazado.usm_cod && quien.log_id == rechazado.log_cod
                    });

                    if(consulta){
                        // Añadimos el tipo rechazado
                        consulta.add(rechazado.tipo);
                    }else{
                        // Creamos la consulta
                        consultas.push(
                            new mensajeria.Consulta(
                                rechazado.usm_cod, rechazado.log_cod, rechazado.tipo
                            )
                        );

                    }
                });

            // ahora Pasamos la matriz de consultas cadena JSON
            // globales.msg(consultas);
            registraMensajesNoEnviados(consultas).then((x)=>{
                globales.msg(x);
            }).catch(e=>{
                globales.msg(e);
                //! Enviar este error?
                //! no deberia dar error
            });
            enviaFallos();
            //globales.msg(JSON.stringify(consultas));


        }
    }
}

function enviaEmailUsuarios(mensaje, usuarios, log, alFinalizar){

    Mensajerias[TipusMensajeria.email](mensaje, usuarios, log, alFinalizar);
}


function envia(){
    
    var buff = new Buff();
    try{
        buff.inicia();
    }catch(e){
        globales.msg('Catch Envia ----------');
        globales.msg(e);
        //! TODO crear el envío a los usuarios
        //! administradores }
    }
}
/*
function mandaCorreos(mensaje, usuarios, log, alFinalizar){

    var mailList = [];
    var mailUsuario = {}
    for(var i = 1; i<usuarios.length; i++){
        var usuario = usuarios[i];
        var email = usuario.mensajeria.email;
        if(email){
            mailList.push(email);
            mailUsuario[email] = usuario;
            //globales.msg(mailUsuario[email])
        }
    }

    globales.msg(mailList);

    if(mailList.length==0){
        return mailList;
    }

    //Creamos el objeto de que mandara el correo y elegiremos el servicio que queramos
    var transporter = nodemailer.createTransport({
        // importante 
        service: Service,
        auth: {
            user: usuCorreo.user,
            pass: usuCorreo.pwd
        }
    })
    
    //  Cuerpo del mensaje enviante
    var mailOptions = {
        from: usuCorreo.user, // Recoge el usuario escrito en el archivo json
        bcc: mailList, //  Se lo manda a la/s personas que están en el listado de correos 
        subject: log.acc_nombre+': '+log.lg_estado, // El asunto será el nombre la acción 
        text: mensaje// El mensaje sera toda la estructura del error
    };
    
    //  Comando para mandar el correo junto con mailOptions
    transporter.sendMail(mailOptions, function(error, info){
        transporter.close();

        // El mensaje se ha enviado
        var lgEnviado = {cod:log.lg_cod, fecha: new Date(), enviado:true};
        
        // Marcamos en la BBDD los mensajes enviado
        logEnviado(lgEnviado).catch((e)=>{
            //! Enviar este error?
            //! no deberia dar error
        });


        // Pero puede que no a todos o a ninguno
        // pero esto se deja constancia en la tabla
        // de los mensajes no enviados

        // Objetos de errores en el envio
        var errores = [];
        var rejected = [];

        // Almacenamos los rechazados
        var rechazados = [];

        if (error) {
            // No se ha enviado a nadie
            errores = error.rejectedErrors;
            rejected = error.rejected;
        } else {
            // Se ha enviado a los destinatarios el correo
            // pero puede que no a todos
            errores = info.rejectedErrors;
            rejected = info.rejected;
        }

        // Montamos la estructura de los envios rechazados
        for (var i=0; i<errores.length; i++){
            var rechazado = errores[i];
            var email = rejected[i];
            var usuario = mailUsuario[email];
            rechazados.push(
                new mensajeria.Rechazado(
                    TipusMensajeria.email,
                    email,
                    log.lg_cod,
                    usuario.cod,
                    usuario.usuario,
                    rechazado.response
                )
            );
        }

        if(alFinalizar){
            //Avisamos de que hemos finalizado
            alFinalizar(rechazados);
        }
    });
}

//  Token del bot
const token = tokenBot.token;

// Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(token, {polling: true});
    
async function botTelegram(mensaje, usuario, log){

    //globales.msg('esoty enviando');
    //  Manda un mensaje automático de los errores del dia actual
    var chatId = usuario.mensajeria.telegram;
        
        //globales.msg(usuario.usuario)
    return bot.sendMessage(chatId+1,mensaje).then((x)=>{
        globales.msg('Telegram enviado ---------');
        globales.msg(x)
        return false;
    }).catch((e)=>{
        return new mensajeria.Rechazado(
                TipusMensajeria.telegram,
                chatId,
                log.lg_cod,
                usuario.cod,
                usuario.usuario,
                e.toString()
            );
    })
}*/

/*Mensajerias[TipusMensajeria.email]=mandaCorreos;
Mensajerias[TipusMensajeria.telegram]=botTelegram;*/


module.exports = {
    envia:envia
}