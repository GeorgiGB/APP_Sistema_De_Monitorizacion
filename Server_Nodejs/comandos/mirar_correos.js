const conexion = require('../config/conexion_bd.config');
const debug = require('./globales');

async function llamar_correo(){

    let res_correos = await conexion.query("SELECT * FROM mirar_correos()")

    debug.msg(res_correos.rows[0].jresultado);
    return res_correos.rows[0].jresultado;
}

module.exports = llamar_correo;