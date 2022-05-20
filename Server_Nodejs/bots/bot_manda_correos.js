//  Usar el paquete
const conexion = require('../config/conexion_bd.config');
var nodemailer = require('nodemailer');
var debug = require('../comandos/globales');
const profile = require('../usuario.json')
const log = require('../logs.json')
const notificacion = require('./bot_telegram')

async function mandarCorreo(){
//  Petición al servidor para obtener los correos
let res_correos = await conexion.query("SELECT * FROM mirar_correos()")
// El json al estar compuesto con 2 niveles le indicamos el 1
// ya que en el se encuentran los correos
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
    to: res[1].correo,//  Se lo manda a la/s personas que esten en el listado de correos
    subject: log[1].nombre,// El asunto sera el nombre del error del servidor
    text: notificacion.notificacion().toString()// El mensaje sera toda la estructura del error
};

//  Comando para mandar el correo junto con mailOptions
transporter.sendMail(mailOptions, function(error, info){
  
    if (error) {
      debug.msg(error);
    } else {
      debug.msg('Email enviado: ' + info.response);
    }
    transporter.close();
  });
debug.msg("mensaje enviado "+ mailOptions)
}

module.exports = mandarCorreo;
