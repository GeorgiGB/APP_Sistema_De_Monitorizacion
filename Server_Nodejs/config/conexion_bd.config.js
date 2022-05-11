// Conexión con la base de datos
//------------------------------
const { Pool } = require('pg')

// Configuración de la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Registros',
    password: 'caslab',
    port: 5432,
  });

  module.exports = pool;