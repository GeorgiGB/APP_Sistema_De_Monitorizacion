
const administrador = process.env.ADMINISTRADOR? 
                    JSON.parse(process.env.ADMINISTRADOR): require('./administrador.config.json');

const usuCorreo = process.env.USU_CORREO? 
                    JSON.parse(process.env.USU_CORREO): require('./correo.config.json');

const BBDD = process.env.BBDD? 
                    JSON.parse(process.env.BBDD): require("./db.config.json");

const tokenBot = process.env.BOT_TELEGRAM? 
                    JSON.parse(process.env.BOT_TELEGRAM): require('./tokenBot.json');


module.exports = {
    usuCorreo:usuCorreo,
    administrador:administrador,
    BBDD,BBDD,
    tokenBot:tokenBot
}