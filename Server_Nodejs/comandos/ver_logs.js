const conexion = require('../config/conexion_bd.config');
const debug = require('./globales');

async function ver_logs(json_logs){
    
    debug.msg(JSON.stringify(json_logs))

    let res_logs = await conexion.query("SELECT * FROM ver_logs('"+JSON.stringify(json_logs)+"');");
    //si el estado esta vacio, mandara los registros del dia actual

    debug.msg(res_logs.rows[0])
    return res_logs.rows[0].jresultado;
}

module.exports = ver_logs;