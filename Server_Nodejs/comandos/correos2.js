//  Funciones generales del programa
const globales = require('./globales');
const {getTransporter} =  require('../config/transporter.config.js');
const usuCorreo = require('../config/correo.config.json');
const { TipusMensajeria, Rechazado } = require('./mensajeria');
const administrador = require('../config/administrador.config.json');

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

async function mandaCorreos(mensaje, usuarios, log, alFinalizar){

    if(estoyEnProceso){
        enProceso.unshift(creaProceso(mensaje, usuarios, log, alFinalizar))
        return;
    }else{
        estoyEnProceso = true;
        _mandaCorreos(mensaje, usuarios, log, alFinalizar).catch((e)=>{
            globales.msg(e);
        });
    }

}

var muertoNodeMailer = false;
var motivo = '';
function estoyMuerto(){
    return muertoNodeMailer;
}
function dimeLaRazon(){
    return motivo;
}

async function _mandaCorreos(mensaje, usuarios, log, alFinalizar){
    // Si se produce un error por autenticación errónea
    // Matamos al servidor?, ya que no se puede enviar
    if(muertoNodeMailer){
        // vaciamos las tareas pendientes
        alFinalizar([], log);
        var es;
        while(es = enProceso.pop()){
            alFinalizar([], es.log);

        }
        estoyEnProceso = false;
        return;
    }
    var mailList = [];
    var mailUsuario = {}
    for(var i = 0; i<usuarios.length; i++){
        var usuario = usuarios[i];
        var email = usuario.mensajeria.email;
        var usuMail =  (usuario.usuario?
                        usuario.usuario: '')
                        +'<'+ email +'>';
        if(email){
            mailList.push(usuMail);
            mailUsuario[email] = usuario;
        }
    }

    if(mailList.length==0){
        alFinalizar([]);
        return;
    }
    
    //  Cuerpo del mensaje enviante
    var mailOptions = {
        from: usuCorreo.user, // Recoge el usuario escrito en el archivo json
        bcc: mailList, //  Se lo manda a la/s personas que están en el listado de correos 
        subject: log.acc_nombre+': '+log.lg_estado, // El asunto será el nombre la acción 
        text: mensaje// El mensaje sera toda la estructura del error
    };
    //Creamos el objeto de que mandara el correo
    var transporter = getTransporter();

        //  Comando para mandar el correo junto con mailOptions
        transporter.sendMail(mailOptions, function(nodeMailError, info){
            transporter.close();

            // Pero puede que no a todos o a ninguno
            // pero esto se deja constancia en la tabla
            // de los mensajes no enviados

            // Objetos de errores en el envio
            var errores = [];
            var rejected = [];

            // Almacenamos los rechazados
            var rechazados = [];

            var todoCorrecto = true;

            if (nodeMailError) {
                // No se ha enviado a nadie
                errores = nodeMailError.rejectedErrors;
                rejected = nodeMailError.rejected;
                if(nodeMailError.responseCode==535){
                    todoCorrecto = false;
                    muertoNodeMailer = true;
                    motivo = " --- ¡¡¡EL BOT NODEMAILER HA MUERTO!!! ---\n"
                             + nodeMailError.message+'\nRevisa el archivo: ./config/correo.config.json'
                    globales.msg(nodeMailError.message);
                    globales.msg("Revisa el archivo: ./config/correo.config.json");
                    //alFinalizar([]);
                }
            } else {
                
                //globales.msg(info)
                // Se ha enviado a los destinatarios el correo
                // pero puede que no a todos
                errores = info.rejectedErrors;
                rejected = info.rejected;
            }

            // Montamos la estructura de los envios rechazados
            if(errores){
                for (var i=0; i<errores.length; i++){
                    var error = errores[i];
                    var email = rejected[i];
                    var usuario = mailUsuario[email];

                    // Creamos el objeto rechazado
                    var rechazado = new Rechazado(
                        TipusMensajeria.email,
                        email,
                        log.lg_cod,
                        usuario.cod,
                        usuario.usuario,
                        error.response
                    );

                    // https://www.ietf.org/rfc/rfc5321.txt
                    // Error en la dirección del correo introducido
                    if(error.responseCode>=500){
                        // Errores de que no existe el destinatario o de servidor
                        // no lo ponermos en rechazado pero si informamos al administrador
                        addMensajeAdminstrador(rechazado);
                        globales.msg("informa al administrador");
                    }else{
                        //globales.msg(usuario)
                        // No se ha podido enviar el email así que lo guardamos
                        // para registrar en los mensajes no enviados
                        rechazados.push(rechazado );
                    }

                    todoCorrecto = false;
                }
            }
                //Avisamos de que hemos finalizado
                alFinalizar(rechazados, log, todoCorrecto);

            // si hay más mensajes en espera recogemos al último
            // y lo enviamos
            var es = enProceso.pop();
            if(es){
                _mandaCorreos(es.mensaje, es.usuarios, es.log, es.alFinalizar);
            }else{
                estoyEnProceso = false;
            }
                
        });
}

const MensajesAdministrador = new Map();
function addMensajeAdminstrador(rechazado){
    try{
        var t = rechazado.tipo;
        if(!MensajesAdministrador.has(t)){
            MensajesAdministrador.set(t, new Map());
        }
        var cod = rechazado.usm_cod;
        var m1 = MensajesAdministrador.get(t);
        if(!m1.has(cod)){
            m1.set(rechazado.usm_cod, rechazado);
            //globales.msg('añadiendo');
            globales.msg(m1.get(cod));
        }
    }catch(e){
        globales.msg(e);
    }
}

function enviaFallos(){
    var mensaje;
    MensajesAdministrador.forEach(m1 => {
        if(!mensaje){
            mensaje = "  --- Problemas y errores del Sistema de alertas API - 1.0 ---\n\n";
        }
        var descrp;
        var rr;
        m1.forEach(r=>{
            rr = r;
            if(!descrp){
                descrp = " + Errores "+(r.tipo.toUpperCase()+':\n\n');
            }
            descrp += "    Usuario: "+ r.usm_cod+', destino: '+r.destino+'\n'
                    + "    Mensaje: "+ r.razon+'\n'
                    + "      ------\n";
        });
        if(rr){
            descrp += "     ---- Final "+rr.tipo+' ---\n\n\n';
        }
        mensaje += descrp;
    });

    if(mensaje){
        var log = {
            acc_nombre: "Alertas API",
            lg_estado: "ko"
        };

        mandaCorreos(mensaje, [administrador], log, function(x, y, ok){
            globales.msg('todo ok: '+ok)
            if(ok){
                MensajesAdministrador.clear();
                globales.msg('se envió y se puede vaciar');
            }
        });
    }

}

module.exports = {
    addMensajeAdminstrador:addMensajeAdminstrador,
    mandaCorreos:mandaCorreos,
    enviaFallos:enviaFallos,
    estoyMuerto:estoyMuerto,
    dimeLaRazon:dimeLaRazon,
}