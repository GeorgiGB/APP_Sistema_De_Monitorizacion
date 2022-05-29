//  Funciones generales del programa
const globales = require('./globales');
const fetch = require('node-fetch');// npm i node-fetch@2
const ver_acciones = require('./ver_acciones');
const inserta_log = require('./inserta_log');
var nodemailer = require('nodemailer');//NPM para mandar correos
const conexion = require('../config/db.config.js');
const tokenBot = require('../config/tokenBot.json');
const usuCorreo = require('../config/correo.json');
const TelegramBot = require('node-telegram-bot-api');
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
    constructor(tipo, destino, log_cod, usm_cod, usuario, razon){
        this.tipo = tipo;
        this.destino = destino;
        this.log_cod = log_cod;
        this.usm_cod = usm_cod;
        this.usuario = usuario
        this.razon = razon;
        this.emparejado = false;
    }

    mismoLogUsuario(rechazado){
        return this.log_cod == rechazado.log_cod
            && this.usm_cod == rechazado.usm_cod;
    }
}

class Consulta{

    constructor(usm_cod, log_cod, que){
        this.usuario = usm_cod,
        this.log_id = log_cod,
        this.sin_enviar = '{'+que+'}'
    }

    add(tipo){
        this.sin_enviar = this.sin_enviar.replace('}', ','+tipo+'}');
    }
}

class Buff{
    
    #total = 0;
    #finaliza = false;
    #tiposRechazados = {};

    constructor(){
        for (const tipus in TipusMensajeria) {
            this.#tiposRechazados[tipus]=[];
        }
        //globales.msg(this.#tiposRechazados)
    
    }

    inicia(){
        // Estas funciones son promesas por tanto el hilo principal
        // seguirá su camino aunque no hayan finalizado
        usuarios_mensajeria().then((usuarios)=>{
            // ya tengo los usuarios

            // ahora los logs
            ver_logs({ desde: Desde, estado: Estados.ko, enviado:false }).then((logs)=>{

                // Ya podemos enviar
                // El log[0] contiene cod_error, por tanto si hay error sólo tenemos un
                // registro y no se envia nada
                logs.forEach((log, i) => {
                    if(i>0){
                        var mensa = estructuraMensaje(log);
                        this.enviaEmailATodos(mensa, usuarios, log);

                        usuarios.forEach((usuario, k) => {
                            if(k>0){
                                //! Descomenta la siguiente línea
                                this.enviaMensajeUsuario(mensa, usuario, log);
                            }
                            
                        });
                    }
                    
                });
            });

            
        });
    }

    enviaEmailATodos(mensa, usuarios, log){
        this.#total++;
        enviaEmailUsuarios(mensa, usuarios, log, (function (rechazados){
            //globales.msg('Te he encontrado: '+rechazados)
            // añadimos todo el array de los rechazado
            //globales.msg(rechazados)

            this.#tiposRechazados[TipusMensajeria.email].push(...rechazados);
            this.gestionaRechazados();

        }).bind(this));
    }

    enviaMensajeUsuario(mensaje, usuario, log){
        // El tipo de mensajes de correo electrónico "email"
        // va por otro camino
        for (const tipus in usuario.mensajeria) {
            if(tipus==TipusMensajeria.email){
                continue;
            }
            // contador de envios
            this.#total++;
            Mensajerias[tipus](mensaje, usuario, log).then((rechazados)=>{
                if(rechazados){
                    //globales.msg(rechazados);
                    this.#tiposRechazados[tipus].push(rechazados);
                }

            }).finally(()=>{
                this.gestionaRechazados();
            });
        }
    }

    gestionaRechazados(){
        this.#total--;
        //globales.msg('descontando: '+(this.#total==0));
        if(this.#total==0){
            globales.msg('dentro');
            var consultas = [];
            
            //Recorremos los distintos tipos de rechazados
            var grupoRechazados = this.#tiposRechazados;
            for (const tipo in grupoRechazados) {
                var elementos = grupoRechazados[tipo];
                globales.msg(elementos);

                globales.msg(elementos.length)
                // por cada rechazado
                elementos.forEach(rechazado =>{
                    globales.msg(rechazado);

                    // miramos si existe una consulta
                    let consulta = consultas.find( quien =>{
                        return quien.usuario == rechazado.usm_cod && quien.log_id == rechazado.log_cod
                    });
                    //globales.msg('--> '+consulta);

                    if(consulta){

                        // Añadimos el tipo rechazado
                        consulta.add(rechazado.tipo);
                    }else{
                        globales.msg(rechazado)
                        // Creamos la consulta
                        consultas.push(
                            new Consulta(
                                rechazado.usm_cod, rechazado.log_cod, rechazado.tipo
                            )
                        );

                    }
                });
            }

            // ahora Pasamos la matriz de consultas cadena JSON
            registraMensajesNoEnviados(consultas)
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
        to: mailList, //  Se lo manda a la/s personas que están en el listado de correos 
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
                new Rechazado(
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
const bot = new TelegramBot(token, {polling: true});
    
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
        return new Rechazado(
                TipusMensajeria.telegram,
                chatId,
                log.lg_cod,
                usuario.cod,
                usuario.usuario,
                e.toString()
            );
    })
}

Mensajerias[TipusMensajeria.email]=mandaCorreos;
Mensajerias[TipusMensajeria.telegram]=botTelegram;

module.exports = {
    envia:envia
}