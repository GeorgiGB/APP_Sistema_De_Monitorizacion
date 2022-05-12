//  Usar el paquete
var nodemailer = require('nodemailer');
var debug = require('./globales')
var correo = require('./llamar_correo')

/*TODO forma temporal de mandar correo cuando sucede un error se tiene que pasar a la bd
PARA LA LLAMADA SE NECESITARA CONSULTAR LA BASE DE DATOS Y COMPROBAR QUE TODOS LOS CAMPOS SE PUEDEN RELLENAR

mandarCorreo(llamar_correo(json_correos))
*/
function mandarCorreo(servicio, correo, pwd, recibe, msg){
//Creamos el objeto de que mandara el correo
var transporter = nodemailer.createTransport({
  service: servicio,
  auth: {
    user: correo,
    pass: pwd
  }
})

//  Cuerpo del mensaje enviante
var mailOptions = {
    from: correo,
    to: recibe,
    subject: 'Error de servidor',
    text: msg
};

//  Simple comando para mandar el correo
transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      debug.msg(error);
    } else {
      debug.msg('Email enviado: ' + info.response);
    }
  });

}

correo(mandarCorreo)

module.exports = mandarCorreo;
