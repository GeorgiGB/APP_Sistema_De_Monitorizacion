//  Funciones generales del programa
const globales = require('./globales');
const ver_acciones = require('./ver_acciones')

const Cada = {
    dia: 'dia',
    hora: 'hora',
    cincoMin: 'cinco_min'
    };

const Diferencia = {
    // dia - hora - min - seg - milis
    dia: 24 * 60 * 60 * 1000,
    hora: 60 * 60 * 1000,
    cincoMin: 5 * 60 * 1000
}

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
            // ahora ya podemos consultar
            globales.msg(this.accion);
        }

    }

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

inicializaAcciones().then((acciones) =>{
    acciones.forEach(accion => {
        //globales.msg(accion)
        accion.inicia();
    });
    //globales.msg(acciones);
});



module.exports = {
    inicializaAcciones:inicializaAcciones,
    /*peticiones:peticiones,
    lanzarPeticion:lanzarPeticion,
    crearJSon:crearJSon*/
}