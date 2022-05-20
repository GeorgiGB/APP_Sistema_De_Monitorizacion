//  Usar el paquete
const conexion = require('../config/conexion_bd.config');
var nodemailer = require('nodemailer');
var debug = require('../comandos/globales');
var log = require('../comandos/ver_logs')
/*TODO forma temporal de mandar correo cuando sucede un error se tiene que pasar a la bd
PARA LA LLAMADA SE NECESITARA CONSULTAR LA BASE DE DATOS Y COMPROBAR QUE TODOS LOS CAMPOS SE PUEDEN RELLENAR

*/
const profile = require('../usuario.json')

async function mandarCorreo(){

//  Petición al servidor para obtener los correos
let res_correos = await conexion.query("SELECT * FROM mirar_correos()")
// El json al estar compuesto con 2 niveles le indicamos el 1
// ya que en el se encuentran los correos
var res = res_correos.rows[0].jresultado

//Creamos el objeto de que mandara el correo
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: profile.user,
    pass: profile.pass
  }
})

//  Cuerpo del mensaje enviante
var mailOptions = {
    from: profile.user,
    to: res[1].correo,
    subject: 'Error de servidor',
    text: 'ejemplo de texto'
};

//  Simple comando para mandar el correo
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
