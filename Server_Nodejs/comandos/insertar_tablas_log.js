const conexion = require('../config/conexion_bd.js');
const globales = require('./globales');

async function insertar_tablas_log(json){
    globales.msg(json)
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM insert_log_envia('"+JSON.stringify(json)+"');");
    
    let jresultado = res_logs.rows[0].jresultado;

    return jresultado;
}

module.exports = insertar_tablas_log;