//  Usar el paquete
var nodemailer = require('nodemailer');
var debug = require('../comandos/globales')
var correo = require('../comandos/ver_correos')

/*TODO forma temporal de mandar correo cuando sucede un error se tiene que pasar a la bd
PARA LA LLAMADA SE NECESITARA CONSULTAR LA BASE DE DATOS Y COMPROBAR QUE TODOS LOS CAMPOS SE PUEDEN RELLENAR

mandarCorreo(llamar_correo(json_correos))
*/
function mandarCorreo(){
//Creamos el objeto de que mandara el correo
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ggbatalov@gmail.com',
    pass: '910mnBQ28.'
  }
})

//  Cuerpo del mensaje enviante
var mailOptions = {
    from: 'jnyqrwuazuy@scpulse.com',
    to: correo(),
    subject: 'Error de servidor',
    text: 'prueba de correo electronico'
};

//  Simple comando para mandar el correo
transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email enviado: ' + info.response);
    }
  });

}

//mandarCorreo('dakcans','nixabik662@dakcans.com',' ','georgig200@gmail.com','pruebamensajes')
//correo(mandarCorreo)

module.exports = mandarCorreo;
