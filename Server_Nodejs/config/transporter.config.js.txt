//  Funciones generales del programa
var nodemailer = require('nodemailer');//NPM para mandar correos
const usuCorreo = require('./correo.config.json');

function getTransporter(){
    return transporter = nodemailer.createTransport({

        host: "dominio.delservidor.de.correo", // desde donde se envian los correos
        port: 465, // puerto utilizado por el servidor de correo
        secure: trueOfFalse, // true -> Secure SSL/TLS Settings (recomendado)  use TLS
        auth: {
            user: usuCorreo.user,
            pass: usuCorreo.pwd
        },
        /*tls: { // si secure es true utilizamos tls
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },*/
        // más doumentación y ejemplos en: https://nodemailer.com/smtp/
    });
}

/* // funcion para comprobar si el transporter está correcto
var t = getTransporter();
t.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

t.close()
*/

  module.exports = {
    getTransporter:getTransporter
}