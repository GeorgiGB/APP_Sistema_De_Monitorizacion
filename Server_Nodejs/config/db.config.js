// Conexión con la base de datos
//------------------------------
const { Pool } = require('pg')
const {BBDD} = require("./datos_config");

// Configuración de la base de datos
const pool = new Pool(BBDD);

  module.exports = pool;


//fichero que sirve para saber como configurar