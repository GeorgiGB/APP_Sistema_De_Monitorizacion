const conexion = require('../config/db.config.js');
const globales = require('./globales');

  /*
    Petición a la base de datos de la función ver_usuarios_mensajeria,
    el bot mandara mensajes automaticos a los chat_id que esten registrados.
  */

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

module.exports = usuarios_mensajeria;