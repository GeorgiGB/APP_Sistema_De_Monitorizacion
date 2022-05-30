//  Funciones generales del programa
const globales = require('./globales');
var nodemailer = require('nodemailer');//NPM para mandar correos
const {getTransporter} =  require('../config/transporter.config.js');
const usuCorreo = require('../config/correo.config.json');

var enProceso=[];
var estoyEnProceso = false;

function creaProceso(mensaje, usuarios, log, alFinalizar){
    return {
        mensaje:mensaje,
        usuarios:usuarios,
        log:log,
        alFinalizar:alFinalizar
    }
}

function mandaCorreos(mensaje, usuarios, log, alFinalizar){
    if(estoyEnProceso){
        enProceso.unshift(creaProceso(mensaje, usuarios, log, alFinalizar))
        return;
    }else{
        estoyEnProceso = true;
        _mandaCorreos(mensaje, usuarios, log, alFinalizar);
    }

}
function _mandaCorreos(mensaje, usuarios, log, alFinalizar){

    var mailList = [];
    var mailUsuario = {}
    for(var i = 0; i<usuarios.length; i++){
        var usuario = usuarios[i];
        var email = usuario.usuario+'<'+ usuario.mensajeria.email+'>';
        if(email){
            mailList.push(email);
            mailUsuario[email] = usuario;
            //globales.msg(mailUsuario[email])
        }
    }

    globales.msg(mailList);
    if(mailList.length==0){
        alFinalizar([])
        return;
    }

    //Creamos el objeto de que mandara el correo y elegiremos el servicio que queramos
    /*var transporter = nodemailer.createTransport({
        // importante 
        service: Service,
        auth: {
            user: usuCorreo.user,
            pass: usuCorreo.pwd
        }
    })*/
    var transporter = getTransporter();
    
    //  Cuerpo del mensaje enviante
    var mailOptions = {
        from: usuCorreo.user, // Recoge el usuario escrito en el archivo json
        bcc: mailList, //  Se lo manda a la/s personas que están en el listado de correos 
        subject: log.acc_nombre+': '+log.lg_estado, // El asunto será el nombre la acción 
        text: mensaje// El mensaje sera toda la estructura del error
    };

    //  Comando para mandar el correo junto con mailOptions
    transporter.sendMail(mailOptions, function(error, info){
        transporter.close();

        /* esto no puede ir aquí
        // El mensaje se ha enviado
        var lgEnviado = {cod:log.lg_cod, fecha: new Date(), enviado:true};
        
        // Marcamos en la BBDD los mensajes enviado
        logEnviado(lgEnviado).catch((e)=>{
            //! Enviar este error?
            //! no deberia dar error
        });
        */

        // Pero puede que no a todos o a ninguno
        // pero esto se deja constancia en la tabla
        // de los mensajes no enviados

        // Objetos de errores en el envio
        var errores = [];
        var rejected = [];

        // Almacenamos los rechazados
        var rechazados = [];

        if (error) {
            // No se ha enviado a nadie
            errores = error.rejectedErrors;
            rejected = error.rejected;
        } else {
            
            globales.msg(info)
            // Se ha enviado a los destinatarios el correo
            // pero puede que no a todos
            errores = info.rejectedErrors;
            rejected = info.rejected;
        }

        // Montamos la estructura de los envios rechazados
        for (var i=0; i<false && errores.length; i++){
            var rechazado = errores[i];
            var email = rejected[i];
            var usuario = mailUsuario[email];

            
            if(e.response.statusCode>=300){
                // Errores de que no existe el destinatario o de servidor
                // no lo ponermos en rechazado pero si informamos al administrador
                global.msg("informa al administrador");
            }else{
                rechazados.push(
                    new Rechazado(
                        TipusMensajeria.email,
                        email,
                        log.lg_cod,
                        usuario.cod,
                        usuario.usuario,
                        rechazado.response
                    )
                );
            }
        }

        //Avisamos de que hemos finalizado
        alFinalizar(rechazados);
        var es = enProceso.pop();
        if(es){
            _mandaCorreos(es.mensaje, es.usuarios, es.log, es.alFinalizar);
        }else{
            estoyEnProceso = false;
        }
            
    });
}

module.exports = {
    mandaCorreos:mandaCorreos,
}