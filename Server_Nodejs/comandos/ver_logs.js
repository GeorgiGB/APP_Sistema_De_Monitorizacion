const conexion = require('../config/db.config.js');
const globales = require('./globales');

async function ver_logs(json_logs){

    //si el estado esta vacio, mandara los registros del dia actual
    let consulta = "SELECT * FROM ver_logs($1)"; 
    let res_logs = await conexion.query(consulta, [JSON.stringify(json_logs)]);
    
    let jresultado = res_logs.rows[0].jresultado;

    return jresultado;
}

module.exports = ver_logs