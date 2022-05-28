//  Funciones generales del programa
const globales = require('./globales');
const fetch = require('node-fetch');// npm i node-fetch@2
const ver_acciones = require('./ver_acciones');
const inserta_log = require('./inserta_log');
const conexion = require('../config/db.config.js');
const { msg } = require('./globales');
const { Estados } = require('./acciones');


const Desde = new Date(0);

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

function estructuraMensaje(){

}

function enviaMensajeUsuario(mensaje, usuario){
    globales.msg('----------');
    globales.msg(mensaje);
    globales.msg(usuario);
}


function envia(){
    usuarios_mensajeria().then(async (usuarios)=>{
        // ya tengo los usuarios

        var logs = await ver_logs({ desde: Desde, estado: Estados.ko });
        // ahora el log
        return { usuarios: usuarios, logs: logs };

        
    }).then((mens)=>{
        mens.logs.forEach((log, i) => {
            if(i>0){
                globales.msg(log.acc_nombre);
                
                mens.usuarios.forEach((usuario, i) => {
                    if(i>0){
                        enviaMensajeUsuario(log, usuario);
                    }
                    
                });
            }
            
        });
    }).catch((e)=>{
        globales.msg(e);
        //! TODO crear el envío a los usuarios
        //! administradores 
        msg(e)
    });

}


module.exports = {
    envia:envia
}