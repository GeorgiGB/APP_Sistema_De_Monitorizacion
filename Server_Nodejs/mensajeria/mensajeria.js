//  Funciones generales del programa
const globales = require('../comandos/globales');
const conexion = require('../config/db.config.js');
//const { mandaCorreos } = require('./correos2');





const Desde = new Date(0);
const Mensajerias = {};
const TipoMensajeria = {
    email:'email',
    telegram:'telegram'
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


module.exports = {
    Mensajerias:Mensajerias,
    TipoMensajeria:TipoMensajeria,
    Rechazado:Rechazado,
    Consulta:Consulta,
    ActualizaNoEnviado:ActualizaNoEnviado,
    EliminaNoEnviado:EliminaNoEnviado,
    estructuraMensaje:estructuraMensaje,
}