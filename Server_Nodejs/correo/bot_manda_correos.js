//  Usar el paquete
var nodemailer = require('nodemailer');

//Creamos el objeto de que mandara el correo
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'georgig200@gmail.com',
    pass: 'vtopnviyrrinepgf'
  }
})

//  Mensaje de prueba
var msg = 'prueba de mensaje con bot de correo';


//  Cuerpo del mensaje enviante
var mailOptions = {
    from: 'georgig200@gmail.com',
    to: 'joan_navarro@siguetusenda.com',
    subject: 'PruebaMandarCorreo',
    text: msg
};

//  Simple comando para mandar el correo
transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email enviado: ' + info.response);
    }
  });