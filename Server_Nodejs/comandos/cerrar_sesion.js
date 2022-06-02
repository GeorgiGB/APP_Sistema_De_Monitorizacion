const conexion = require('../config/db.config.js');
const { msg } = require('./globales');

/*
    -------------------------Cerrar Sesion de Usuario-------------------------
    Cada usuario principal tiene un token asociado el cual solo se usara una vez,
    durante la sesión iniciada ese token estara activo. Hasta que el usuario decida salir de la aplicación,
    el cual cambiara al estado de 'false' y no se volvera a utilizar.
*/

//  Función asincrona para cambiar el estado del token
async function cerrar_sesion(json_sesion){
  /*
    Petición en la base de datos de la función de cerrar_sesion
    la función cambiara el estado del token de 'true' a 'false'
  */
 let res = await conexion.query("SELECT * FROM cerrar_sesion('"+JSON.stringify(json_sesion)+"')")
  return res.rows[0].jresultado;
}

module.exports = cerrar_sesion;