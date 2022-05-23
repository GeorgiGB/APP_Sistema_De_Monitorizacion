const conexion = require('../config/conexion_bd.js');
const debug = require('./globales');

  /*
    Petición a la base de datos de la función ver_usuarios_telegram,
    el bot mandara mensajes automaticos a los chat_id que esten registrados.
  */

async function ver_usuarios_telegram(){
    let res = await conexion.query("SELECT * FROM ver_usuarios_telegram()")
    usuarios = res.rows[0].jresultado;
    //  Creación de un nuevo archivo en el que se guardaran los usuarios_telegram
    debug.crearJSon('usuarios_telegram',JSON.stringify(usuarios))
    return usuarios;
}

module.exports = ver_usuarios_telegram;