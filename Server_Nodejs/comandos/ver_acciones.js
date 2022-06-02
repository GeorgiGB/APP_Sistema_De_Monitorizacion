const conexion = require('../config/db.config.js');
const globales = require('./globales');

async function ver_acciones(json){
    let res_acciones = await conexion.query("SELECT * FROM ver_acciones('"+JSON.stringify(json)+"');");

    let jresultado = res_acciones.rows[0].jresultado;
    return jresultado;
}

module.exports = ver_acciones;