
const usuCorreo = process.env.USU_CORREO? 
                    JSON.parse(process.env.USU_CORREO): require('./correo.config.json');

module.exports = {
    usuCorreo:usuCorreo
}