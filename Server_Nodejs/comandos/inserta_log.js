const conexion = require('../config/db.config.js');
const globales = require('./globales');


// Función utilizada para insertar los registros del
// resultado de las diferentes acciones
async function inserta_log(json){
    //si el estado esta vacio, mandara los registros del dia actual
    let consulta = "SELECT * FROM inserta_log($1)"; 
    let res_logs = await conexion.query(consulta, [JSON.stringify(json)]);
    
    let jresultado = res_logs.rows[0].jresultado;

    return jresultado;
}

module.exports = inserta_log;