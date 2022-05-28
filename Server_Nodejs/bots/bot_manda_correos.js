const conexion = require('../config/db.config.js');//Conexion con la bd
var nodemailer = require('nodemailer');//NPM para mandar correos
var globales = require('../comandos/globales');
const usuarios_mensajeria = require('../usuarios_mensajeria.json');//Mirar los correos
const notificacion = require('./notificacion');// Mensaje de error
const user = require('../usuario.json');//  Parametros del mandador

async function mandarCorreo(){
//Creamos el objeto de que mandara el correo y elegiremos el servicio que queramos
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: user.user,
    pass: user.pass
  }
})
var usu_correos = usuarios_mensajeria.slice(1);

for (const key in usu_correos) {
  var correo = usu_correos[key].email;
  globales.msg(JSON.stringify(correo))
}

//  Cuerpo del mensaje enviante
var mailOptions = {
    from: user.user,// Recoge el usuario escrito en el archivo json
    to: correo,//  Se lo manda a la/s personas que esten en el listado de correos !CAMBIAR
    subject://  Si no hay un titulo de asunto mandaremos un mensaje predeterminado
    notificacion[1]&&notificacion[1].acc_nombre? 
    notificacion[1].acc_nombre
                  :
                  'No hay mensajes',// El asunto sera el nombre del error del servidor
    text: notificacion// El mensaje sera toda la estructura del error
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
