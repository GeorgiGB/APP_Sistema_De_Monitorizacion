
const administrador = process.env.ADMINISTRADOR? 
                    JSON.parse(process.env.ADMINISTRADOR): require('../config/administrador.config.json');

const usuCorreo = process.env.USU_CORREO? 
                    JSON.parse(process.env.USU_CORREO): require('./correo.config.json');

const BBDD = JSON.parse(process.env.BBDD);

const tokenBot = process.env.USU_CORREO? 
                    JSON.parse(process.env.BOT_TELEGRAM): require('./correo.config.json');


module.exports = {
    usuCorreo:usuCorreo,
    administrador:administrador,
    BBDD,BBDD,
    tokenBot:tokenBot
}