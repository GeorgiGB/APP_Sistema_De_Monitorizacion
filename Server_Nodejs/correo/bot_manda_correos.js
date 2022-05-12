//  Usar el paquete
var nodemailer = require('nodemailer');
var debug = require('./comandos/globales')

//TODO forma temporal de mandar correo cuando sucede un error se tiene que pasar a la bd

function mandarCorreo(servicio, correo, pwd, recibidor, asunto, msg){
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
    to: recibidor,
    subject: asunto,
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

module.exports = mandarCorreo;
