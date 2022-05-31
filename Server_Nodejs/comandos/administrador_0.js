//  Funciones generales del programa
const globales = require('./globales');
const administrador = require('../config/administrador.config.json');
const {mandaCorreos} = require('./correos2');

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
            descrp += "    Usuario: "+ r.usm_cod+', destino: '+r.destino+'\n';
            descrp += "    Mensaje: "+ r.razon+'\n';
            descrp += "      ------\n"
            //creo el mensaje
        });
        if(rr){
            descrp += "     ---- Final "+rr.tipo+' ---\n\n\n';
        }
        mensaje += descrp;
    });

    if(mensaje){
        var log = {
            acc_nombre: "Alertas API",
            lg_estado: "KO"
        };

        mandaCorreos(mensaje, [administrador], log, function(x, y, ok){
            if(ok){
                MensajesAdministrador.clear();
                globales.msg('se envió y se puede vaciar');
            }
        });
    }

}
module.exports = {
    addMensajeAdminstrador:addMensajeAdminstrador,
    enviaFallos:enviaFallos,
}