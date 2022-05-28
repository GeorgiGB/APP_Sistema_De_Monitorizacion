//  Funciones generales del programa
const globales = require('./globales');
const fetch = require('node-fetch');// npm i node-fetch@2
const ver_acciones = require('./ver_acciones');
const inserta_log = require('./inserta_log');
const { msg } = require('./globales');

const Cada = {
    dia: 'dia',
    hora: 'hora',
    cincoMin: 'cinco_min'
    };

const Estados ={
    ok: 'ok',
    ko: 'ko'
};

const Diferencia = {
    // dia - hora - min - seg - milis
    dia: 24 * 60 * 60 * 1000,
    hora: 60 * 60 * 1000,
    cincoMin: 5 * 60 * 1000
};

const ContentType = {
    textHtml: 'text/html',
    json:'application/json'
};

const HttpOk = 200;

class Accion {
    constructor(jsonAccion) {
        this.id = jsonAccion.acc_id_acciones;
        this.nombre = jsonAccion.acc_nombre;
        this.servicio = jsonAccion.acc_tservicio;
        this.usos = jsonAccion.acc_usos;
        this.accion = jsonAccion.acc_accion;
        this.descripcion = jsonAccion.acc_descripcion;
        this.alta = Date.parse(jsonAccion.acc_fecha_alta);
        this.ultUso = jsonAccion.acc_fecha_ult_uso;
        this.cada = jsonAccion.acc_cada;
        this.estado = Estados.ko;
        this.resultado;

        // inicializamos el último uso si no tiene valor lo ponemos a 0
        this.ultUso = !this.ultUso?
                new Date(0): new Date(Date.parse(this.ultUso)); //Devuelve mili segundos
    }

    async inicia(){
        var tiempoTranscurrido = (new Date()).getTime() - this.ultUso.getTime();
        var ejecuta = false;
        switch(this.cada){
            case(Cada.dia):
                ejecuta = tiempoTranscurrido > Diferencia.dia;
                //globales.msg('dia: '+tiempoTranscurrido+' > '+Diferencia.dia)
                break;

            case(Cada.hora):
                ejecuta = tiempoTranscurrido > Diferencia.hora;
                //globales.msg('hora: '+tiempoTranscurrido+' > '+Diferencia.hora)
                break;

            case(Cada.cincoMin):
                ejecuta = tiempoTranscurrido > Diferencia.cincoMin;
                //globales.msg('cinco_min: '+tiempoTranscurrido+' > '+Diferencia.cincoMin)
                break;

            default:
                // Se ha dado de alta una nuevo termino de ejecución?
                // avisamos?
        }


        if(ejecuta){
            if(this.accion){
                // ahora ya podemos consultar
                var res = await fetch(this.accion);

                // y guardar la respuesta
                this.guardaDatosRespuesta(res);
            }else{
                // globales.msg('Acción no definida: '+this.id+', '+this.nombre);
                // una acción sin accion!?
            }
        }

    }

    
    guardaDatosRespuesta(res){
        this.estado = res.status >= 200 && res.status < 300?
            Estados.ok : Estados.ko;

        this.resultado = {
            accion:this.id,
            estado:this.estado,
            descripcion:res.status
        };
    }

}


async function cargaAcciones(){
    var res = await ver_acciones({"desde":"2020-01-01"});
    let error = res[0].cod_error;
    let acciones = [];
    if(error==='0'){
        for(var i=1; i<res.length; i++){
            acciones.push(new Accion(res[i]));
        }
        return acciones;
    }else{
        // Error te mandamos un correo o telegram?
    }

}


function inicia(){

    cargaAcciones().then((acciones) =>{

        acciones.forEach(accion => {
            //globales.msg(accion)
            accion.inicia().then(()=>{
                guardaResultado(accion)
            });
        });
    });

}

function guardaResultado(accion){
    if(accion.resultado){
        // insertamos el log en la BBDD
        inserta_log([accion.resultado]).then((res)=>{
            // Una vez llega la respuesta de la BBDD
            // ya podemos enviar el aviso si el resultado ha sido ko
            
            globales.msg('guardo resultado');
        });
    }else{
        if(!accion.accion){
            // una acción sin accion!?
            globales.msg('Acción no definida: '+accion.id+', '+accion.nombre);
        }
    }
}

module.exports = {
    inicia:inicia,
    /*peticiones:peticiones,
    lanzarPeticion:lanzarPeticion,
    crearJSon:crearJSon*/
}