const conexion = require('../config/conexion_bd.config');
const debug = require('./globales');

async function ver_logs(){

    let res_logs = await conexion.query("SELECT * FROM ver_logs()")

    //debug.msg(res_correos.rows[0])
    return res_logs.rows[0].jresultado;
}

module.exports = ver_logs;