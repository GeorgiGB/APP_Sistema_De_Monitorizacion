const conexion = require('../config/conexion_bd.config');
const debug = require('./globales');

async function llamar_correo(json_correos){

    let res = await conexion.query("SELECT * FROM mirar_correos('"+JSON.stringify(json_correos)+"')")
    
    debug.msg(res);
    return res.rows[0].jresultado;
}

module.exports = llamar_correo;