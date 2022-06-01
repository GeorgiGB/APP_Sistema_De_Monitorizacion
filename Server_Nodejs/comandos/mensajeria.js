//  Funciones generales del programa
const globales = require('./globales');
const conexion = require('../config/db.config.js');
//const { mandaCorreos } = require('./correos2');





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

function estructuraMensaje(log){
    with(log){
        if(lg_fecha_envio==null){
            lg_fecha_envio = (new Date()).toString();
        }
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
    }
}

class Consulta{

    constructor(usm_cod, log_cod, tipo){
        this.usuario = usm_cod;
        this.log_id = log_cod;
        this.sin_enviar = '{'+tipo+'}';
    }

    add(tipo){
        this.sin_enviar = this.sin_enviar.replace('}', ','+tipo+'}');
    }
}

class ActualizaNoEnviado{

    constructor(men_cod, tipo){
        this.men_cod = men_cod;
        this.sin_enviar = '{'+tipo+'}';
    }

    add(tipo){
        this.sin_enviar = this.sin_enviar.replace('}', ','+tipo+'}');
    }
}

class EliminaNoEnviado{
    constructor(men_cod){
        this.men_cod = men_cod
    }
}

/*Mensajerias[TipusMensajeria.email]=mandaCorreos;
Mensajerias[TipusMensajeria.telegram]=botTelegram;*/

module.exports = {
    //envia:envia,
    TipusMensajeria:TipusMensajeria,
    Rechazado:Rechazado,
    Consulta:Consulta,
    ActualizaNoEnviado:ActualizaNoEnviado,
    EliminaNoEnviado:EliminaNoEnviado,
    estructuraMensaje:estructuraMensaje,
    //enviaEmailUsuarios:enviaEmailUsuarios
}