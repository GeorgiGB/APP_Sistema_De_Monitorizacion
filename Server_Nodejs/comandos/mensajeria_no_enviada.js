//  Funciones generales del programa
const globales = require('./globales');
const conexion = require('../config/db.config.js');
const mensajeria = require('./mensajeria');


async function verMensajesNoEnviados(){
    
    //si el estado esta vacio, mandara los registros del dia actual
    let res_logs = await conexion.query("SELECT * FROM ver_mensajes_no_enviados();");
    
    let jresultado = res_logs.rows[0].jresultado;

    return jresultado;
}

class NoEnviado{
    
    #total = 0;
    #tiposRechazados = {};

    constructor(){
        for (const tipus in mensajeria.TipusMensajeria) {
            this.#tiposRechazados[tipus]=[];
        }
        //globales.msg(this.#tiposRechazados)
    
    }

    inicia(){
        // Estas funciones son promesas por tanto el hilo principal
        // seguirá su camino aunque no hayan finalizado

        verMensajesNoEnviados().then((mens=>{
            mens.forEach((men, i) => {
                if(i>0){
                    var mensa = mensajeria.estructuraMensaje(men);
                    globales.msg(mensa);
                    this.enviaEmailATodos(mensa, men, men);

                    /*usuarios.forEach((usuario, k) => {
                        if(k>0){
                            //! Descomenta la siguiente línea
                            this.enviaMensajeUsuario(mensa, usuario, men);
                        }
                        
                    });*/
                }
                
            });
        }));


        /*usuarios_mensajeria().then((usuarios)=>{
            // ya tengo los usuarios

            // ahora los logs
            ver_logs({ desde: Desde, estado: Estados.ko, enviado:false }).then((logs)=>{

                // Ya podemos enviar
                // El log[0] contiene cod_error, por tanto si hay error sólo tenemos un
                // registro y no se envia nada
                logs.forEach((log, i) => {
                    if(i>0){
                        var mensa = estructuraMensaje(log);
                        this.enviaEmailATodos(mensa, usuarios, log);

                        usuarios.forEach((usuario, k) => {
                            if(k>0){
                                //! Descomenta la siguiente línea
                                this.enviaMensajeUsuario(mensa, usuario, log);
                            }
                            
                        });
                    }
                    
                });
            });

            
        });*/
    }

    enviaEmailATodos(mensa, usuarios, log){
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
                    this.#tiposRechazados[tipus].push(rechazados);
                }

            }).finally(()=>{
                this.gestionaRechazados();
            });
        }
    }

    gestionaRechazados(){
        this.#total--;
        //globales.msg('descontando: '+(this.#total==0));
        if(this.#total==0){
            globales.msg('dentro');
            var consultas = [];
            
            //Recorremos los distintos tipos de rechazados
            var grupoRechazados = this.#tiposRechazados;
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
    }
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