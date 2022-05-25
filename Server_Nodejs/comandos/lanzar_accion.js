const globales = require('./globales');
const verAcciones = require('./ver_acciones')
const cron = require('node-cron')
const accionesEjecutandose = []

async function lanzaAcciones(){
    
let acciones = await verAcciones({desde:"2022-05-17"})
    globales.msg(typeof acciones[0].cod_error)
    if(acciones[0].cod_error === '0'){
        globales.msg('ya podemos accionar')
    }
}

class creaAccion {
    constructor(id) {
        this.id = id;

        this.job = cron.schedule('* * * * * *', () => {
            globales.msg("Haciendo accion");

        }, {
            scheduled: false
        });
    }
}

module.exports = {
    lanzaAcciones:lanzaAcciones,
    creaAccion:creaAccion
}

