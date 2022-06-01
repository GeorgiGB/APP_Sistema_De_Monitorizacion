//  Funciones generales del programa
const globales = require('./globales');
const conexion = require('../config/db.config.js');
const mensajeria = require('./mensajeria');
const {multiUsuariosTelegram} = require('./telegram2');
const {mandaCorreos} = require('./correos2');


async function verMensajesNoEnviados(){
    
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM ver_mensajes_no_enviados();");
    
    let jresultado = res_logs.rows[0].jresultado;

    return jresultado;
}


async function eliminaMensajesNoEnviados(json_logs){
        
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM elimina_de_mensajes_no_enviados('"+JSON.stringify(json_logs)+"');");
    
    let jresultado = res_logs.rows[0].jresultado;


    return jresultado;
}

function construyeUsuario(objeto){
    return{
        cod:objeto.cod,
        usuario:objeto.usuario,
        mensajeria:objeto.mensajeria
    }
}

function construyeLog(objeto){
    return{
        acc_nombre: objeto.acc_nombre,
        acc_accion: objeto.acc_accion,
        acc_descripcion: objeto.acc_descripcion,
        lg_acc_cod: objeto.lg_acc_cod,
        lg_cod: objeto.lg_cod,
        lg_estado: objeto.lg_estado,
        lg_fecha_alta: objeto.lg_fecha_alta,
        lg_fecha_envio: objeto.lg_fecha_envio,
        lg_descripcion: objeto.lg_descripcion
    }
}

function construyeActualizado(objeto){
    
    return {
        men_cod:objeto.men_cod,
        usm_cod:objeto.cod,
        log_cod: objeto.lg_cod,
        consulta:false,
    }
}

class NoEnviado{
    
    #total = 0;
    #rechazados = [];
    #actualizados = [];
    #consultActualizados = [];

    constructor(){
        /*for (const tipus in mensajeria.TipusMensajeria) {
            this.#tiposEnvios[tipus]=[];
        }*/
        //globales.msg(this.#tiposRechazados)
    
    }

    inicia(){
        // Estas funciones son promesas por tanto el hilo principal
        // seguirá su camino aunque no hayan finalizado

        verMensajesNoEnviados().then((mensajesUsuarios=>{
            mensajesUsuarios.forEach((menUsu, i) => {
                if(i>0){
                    this.inicializaEnvia(menUsu);
                }
                
            });
        }));
    }

    inicializaEnvia(mensajeUsuario ){
        var usuario = construyeUsuario(mensajeUsuario);
        var log = construyeLog(mensajeUsuario);
        var mensaje = mensajeria.estructuraMensaje(log);
        var sin_enviar = mensajeUsuario.men_sin_enviar;

        this.#actualizados.push(construyeActualizado(mensajeUsuario));
        sin_enviar.forEach(no_enviado => {
            switch(no_enviado){
                case mensajeria.TipusMensajeria.telegram:
                    this.#total++;
                    multiUsuariosTelegram(mensaje, [usuario], log,
                        (this.finalizaEnvio).bind(this));
                    break;
                
                case mensajeria.TipusMensajeria.email:
                        globales.msg(usuario)
                    mandaCorreos(mensaje, [usuario], log,
                        (this.finalizaEnvio).bind(this));
                    this.#total++;

            }
        });
        /*
        globales.msg(usuario)
        globales.msg(mensajeUsuario);
        globales.msg(log)
        globales.msg(mensa)
        */
    }

    finalizaEnvio(rechazados, log){
        
        /* 
        // esto no puede ir aquí, van en la parte de mensajeria enviada
        // aquí los logs ya han sido enviados. estos son los logs reenviados
        // El mensaje se ha enviado
        var lgEnviado = {cod:log.lg_cod, fecha: new Date(), enviado:true};
        
        // Marcamos en la BBDD los mensajes enviado
        logEnviado(lgEnviado).catch((e)=>{
            //! Enviar este error?
            //! no deberia dar error
        });
        */
        if(rechazados.length>0){
            this.#rechazados.push(...rechazados);
        }
        this.#total--;
        if(this.#total==0){
            

            globales.msg('finalzaron los envios: '+this.#rechazados.length);

            this.creaConsultActualizados();
            this.creaConsultAEliminar();
            /*(creaConsultActualizados()).bind(this);
            */

            // Ahora ya podemos realizar la eliminación o actualización 
            // de la tabla de los mensajes no enviados 
            //globales.msg(/*aActualizar.length+', '+*/aEliminar.length);
        }
    }

    creaConsultActualizados(){
        this.#consultActualizados = [];
        // primero vamos a ver los rechazados y a continuación lo
        // buscamos en #actualizados
        this.#rechazados.forEach(rechazado =>{
            let actualiza = this.#actualizados.find(actualiza=>{
                
                return actualiza.usm_cod==rechazado.usm_cod
                    && actualiza.log_cod==rechazado.log_cod;
            });
            if(actualiza){
                if(actualiza.usm_cod==rechazado.usm_cod
                    && actualiza.log_cod==rechazado.log_cod){
                    // Ahora escrbimos el tipo de mensaje que no se ha podio enviar

                    // Existe la consulta?
                    if(!actualiza.consulta){
                        // la creamos
                        actualiza.consulta =
                            new mensajeria.ActualizaNoEnviado(actualiza.men_cod, rechazado.tipo);
                        // la añadimos a
                        this.#consultActualizados.push(actualiza.consulta);
                    }else{
                        // le añadimos el tipo
                        actualiza.consulta.add(re.tipo);
                    }

                }
            }
        });
        globales.msg(' --- Se mantienen mensajes no enviados ----');
        globales.msg(JSON.stringify(this.#consultActualizados));
    }

    creaConsultAEliminar(){
        
        var aEliminar = [];
            // Una vez finaliza la actualización
            // vamos seleccionar los que se pueden eliminar de la
            // tabla de los mensajes no enviados
            this.#actualizados.forEach(actualiza => {
                if(!actualiza.consulta){
                    actualiza.usm_cod = undefined,
                    actualiza.log_cod = undefined,
                    actualiza.consulta = undefined,
                    aEliminar.push(actualiza);
                }
            });
            
        globales.msg(' --- Eliminamos de mensajes no enviados ----');
        globales.msg(JSON.stringify(aEliminar));
        eliminaMensajesNoEnviados(aEliminar).then(res=>{
            globales.msg(res);
        });
    }
    /*enviaEmailATodos(mensa, usuarios, log){
        this.#total++;
        mensajeria.enviaEmailUsuarios(mensa, usuarios, log, (function (rechazados){
            //globales.msg('Te he encontrado: '+rechazados)
            // añadimos todo el array de los rechazado
            //globales.msg(rechazados)

            this.#tiposRechazados[TipusMensajeria.email].push(...rechazados);
            this.gestionaRechazados();

        }).bind(this));
    }

    enviaMensajeUsuario(mensaje, usuario, log){
        // El tipo de mensajes de correo electrónico "email"
        // va por otro camino
        for (const tipus in usuario.mensajeria) {
            if(tipus==TipusMensajeria.email){
                continue;
            }
            // contador de envios
            this.#total++;
            Mensajerias[tipus](mensaje, usuario, log).then((rechazados)=>{
                if(rechazados){
                    //globales.msg(rechazados);
                    this.#tiposEnvios[tipus].push(rechazados);
                }

            }).finally(()=>{
                this.gestionaRechazados();
            });
        }
    }*/

    /*gestionaRechazados(){
        this.#total--;
        //globales.msg('descontando: '+(this.#total==0));
        if(this.#total==0){
            globales.msg('dentro');
            var consultas = [];
            
            //Recorremos los distintos tipos de rechazados
            var grupoRechazados = this.#tiposEnvios;
            for (const tipo in grupoRechazados) {
                var elementos = grupoRechazados[tipo];
                globales.msg(elementos);

                globales.msg(elementos.length)
                // por cada rechazado
                elementos.forEach(rechazado =>{
                    globales.msg(rechazado);

                    // miramos si existe una consulta
                    let consulta = consultas.find( quien =>{
                        return quien.usuario == rechazado.usm_cod && quien.log_id == rechazado.log_cod
                    });
                    //globales.msg('--> '+consulta);

                    if(consulta){

                        // Añadimos el tipo rechazado
                        consulta.add(rechazado.tipo);
                    }else{
                        globales.msg(rechazado)
                        // Creamos la consulta
                        consultas.push(
                            new Consulta(
                                rechazado.usm_cod, rechazado.log_cod, rechazado.tipo
                            )
                        );

                    }
                });
            }

            // ahora Pasamos la matriz de consultas cadena JSON
            //registraMensajesNoEnviados(consultas)
            //globales.msg(JSON.stringify(consultas));

        }
    }*/
}

/*function enviaEmailUsuarios(mensaje, usuarios, log, alFinalizar){

    Mensajerias[TipusMensajeria.email](mensaje, usuarios, log, alFinalizar);
}*/


function envia(){
    
    var buff = new NoEnviado();
    try{
        buff.inicia();
    }catch(e){
        globales.msg('Catch Envia ----------');
        globales.msg(e);
        //! TODO crear el envío a los usuarios
        //! administradores }
    }
}


/*Mensajerias[TipusMensajeria.email]=mandaCorreos;
Mensajerias[TipusMensajeria.telegram]=botTelegram;*/

module.exports = {
    envia:envia
}