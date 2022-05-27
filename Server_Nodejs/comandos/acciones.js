//  Funciones generales del programa
const globales = require('./globales');
const ver_acciones = require('./ver_acciones')
const fetch = require('node-fetch');// npm i node-fetch@2

const Cada = {
    dia: 'dia',
    hora: 'hora',
    cincoMin: 'cinco_min'
    };

const Estados ={
    ok: 'ok',
    ko: 'ko'
}

const Diferencia = {
    // dia - hora - min - seg - milis
    dia: 24 * 60 * 60 * 1000,
    hora: 60 * 60 * 1000,
    cincoMin: 5 * 60 * 1000
}

const HttpOk = 200;

class Accion {
    constructor(jsonAccion) {
        //globales.msg(jsonAccion);
        this.id = jsonAccion.acc_id_acciones;
        this.nombre = jsonAccion.acc_nombre;
        this.servicio = jsonAccion.acc_tservicio;
        this.usos = jsonAccion.acc_usos;
        this.accion = jsonAccion.acc_accion;
        this.descripcion = jsonAccion.acc_descripcion;
        this.alta = Date.parse(jsonAccion.acc_fecha_alta);
        this.ultUso = jsonAccion.acc_ult_uso;
        this.cada = jsonAccion.acc_cada;

        // inicializamos el último uso si no esta a valor 0
        this.ultUso = !this.ultUso?
                        new Date(0): Date.parse(this.ultUso);
        
    }

    inicia(){
        var tiempoTranscurrido = (new Date()).getTime() - this.ultUso.getTime();
        var ejecuta = false;
        switch(this.cada){
            case(Cada.dia):
                ejecuta = tiempoTranscurrido > Diferencia.dia;
                break;

            case(Cada.hora):
                ejecuta = tiempoTranscurrido > Diferencia.hora;
                break;

            case(Cada.cincoMin):
                ejecuta = tiempoTranscurrido > Diferencia.cincoMin;
                break;

            default:
                // Se ha dado de alta una nuevo termino de ejecución?
                // avisamos?
        }

        if(ejecuta){
            if(this.accion){
                // ahora ya podemos consultar
                //globales.msg(this.accion);
                fetch(/*/'https://jsonplaceholder.typicode.com/todos/--p1'/*/this.accion+'qqq'/**/)
                    .then(checkStatus)
                        .then((res)=>{
                    var ok = res.status == HttpOk

                    // sea lo que sea escribimos respuesta en el servidor
                    //escribeRespuestaEnBBDD(this.id, res);
                    //globales.msg(res.headers);
                    globales.msg(res.status);
                    res.json().then((f)=>{
                        globales.msg(f)
                    })

                    // ahora miramos si la respuesta no es correcta
                    if(!ok){
                        // Ahora enviamos aviso por los diferentes tipos de
                        // mensajeria

                    }else{
                        // No hay que hacer nada todo esta correcto
                    }
                })
            }else{
                globales.msg('Acción no definida: '+this.id+', '+this.nombre);
                // una acción sin accion!?
            }
        }

    }

}

function escribeRespuestaEnBBDD(id, res){
    var ok = res.status==200;
    var resultado = {id:id, estado:'', descripcion:''}
    resultado.estado = ok? Estados.ok:Estados.ko
    resultado.descripcion = ok? '':'';
    globales.msg(res);
    //! TODO por desarrollar
    //throw new Error("función por desarrollar -> escribeRespuestaEnBBDD");
}

async function inicializaAcciones(){
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

function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw new Error(res.statusText);
    }
}


function inicia(){

inicializaAcciones().then((acciones) =>{
    acciones.forEach(accion => {
        //globales.msg(accion)
        accion.inicia();
    });
    //globales.msg(acciones);
});

}

module.exports = {
    inicia:inicia,
    /*peticiones:peticiones,
    lanzarPeticion:lanzarPeticion,
    crearJSon:crearJSon*/
}