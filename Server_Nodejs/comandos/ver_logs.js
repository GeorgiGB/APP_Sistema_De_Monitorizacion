const conexion = require('../config/conexion_bd.js');
const globales = require('./globales');

async function ver_logs(json_logs){
    
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM ver_logs('"+JSON.stringify(json_logs)+"');");
    
    let jresultado = res_logs.rows[0].jresultado;

    //  Creación de un nuevo archivo en el que se guardaran los logs
    globales.crearJSon('logs',JSON.stringify(jresultado))

    return jresultado;
}

module.exports = ver_logs