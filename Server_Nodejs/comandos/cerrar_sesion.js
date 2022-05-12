const conexion = require('../config/conexion_bd.config');
const { msg } = require('./globales');
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