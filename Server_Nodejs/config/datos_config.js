
const administrador = process.env.ADMINISTRADOR? 
JSON.parse(process.env.ADMINISTRADOR): require('../config/administrador.config.json');

const usuCorreo = process.env.USU_CORREO? 
                    JSON.parse(process.env.USU_CORREO): require('./correo.config.json');

const BBDD = process.env.BBDD? 
                    JSON.parse(process.env.BBDD): require('./bbdd.config.json');


module.exports = {
    usuCorreo:usuCorreo,
    administrador:administrador,
    BBDD,BBDD
}