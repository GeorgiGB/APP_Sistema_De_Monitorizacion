const conexion = require('../config/db.config.js');
const globales = require('./globales');

async function ver_acciones(json){
    let consulta = "SELECT * FROM ver_acciones($1)"; 
    let res_acciones = await conexion.query(consulta, [JSON.stringify(json)]);

    let jresultado = res_acciones.rows[0].jresultado;
    return jresultado;
}

module.exports = ver_acciones;