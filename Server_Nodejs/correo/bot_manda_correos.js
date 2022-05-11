//  Usar el paquete
var nodemailer = require('nodemailer');

//Creamos el objeto de que mandara el correo
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tucorreo@gmail.com',
    pass: 'tucontraseña'
  }
})

//  Mensaje de prueba
var msg = 'prueba de mensaje con bot';


//  Cuerpo del mensaje enviante
var mailOptions = {
    from: 'tucorreo@gmail.com',
    to: 'mi-amigo@yahoo.com',
    subject: 'Asunto Del Correo',
    text: msg
}

//  Simple comando para mandar el correo
transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email enviado: ' + info.response);
    }
  });