const conexion = require('../config/db.config.js');
const globales = require('./globales');

async function inserta_log(json){
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM inserta_log('"+JSON.stringify(json)+"');");
    globales.msg(res_logs);
    
    let jresultado = res_logs.rows[0].jresultado;

    return jresultado;
}

module.exports = inserta_log;