//  Usar el paquete
const conexion = require('../config/conexion_bd.js');
var nodemailer = require('nodemailer');
var globales = require('../comandos/globales');
const profile = require('../usuarios_mensajeria.json')
const notificacion = require('./notificacion')

async function mandarCorreo(){
//  Petición al servidor para obtener los correos
let res_correos = await conexion.query("SELECT * FROM mirar_correos()")

var res = res_correos.rows[0].jresultado

//Creamos el objeto de que mandara el correo y elegiremos el servicio que queramos
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: profile.user,
    pass: profile.pass
  }
})

//  Cuerpo del mensaje enviante
var mailOptions = {
    from: profile.user,// Recoge el usuario escrito en el archivo json
    to: res[1].correo,//  Se lo manda a la/s personas que esten en el listado de correos !CAMBIAR
    subject://  Si no hay un titulo de asunto mandaremos un mensaje predeterminado
    log[1]&&log[1].nombre? 
                  log[1].nombre
                  :
                  'No hay mensajes',// El asunto sera el nombre del error del servidor
    text: notificacion()// El mensaje sera toda la estructura del error
};

//  Comando para mandar el correo junto con mailOptions
transporter.sendMail(mailOptions, function(error, info){
    globales.msg("CORREO ENVIADO: ")
    globales.msg(mailOptions)
    
    if (error) {
      globales.msg(error);
    } else {
      globales.msg('Email enviado: ' + info.response);
    }
    transporter.close();
  });
globales.msg("mensaje enviado "+ mailOptions)
}

module.exports = mandarCorreo;
