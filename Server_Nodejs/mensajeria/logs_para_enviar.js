//  Funciones generales del programamuerto
const globales = require('../comandos/globales');
const fetch = require('node-fetch');// npm i node-fetch@2
const conexion = require('../config/db.config.js');
const {multiUsuariosTelegram} = require('../bots/telegram');
const {mandaCorreos, enviaFallos, estoyMuerto, dimeLaRazon} = require('../bots/correos');
const administrador = require('../config/administrador.config.json');
const { Estados } = require('../comandos/acciones');
const ver_logs = require('../comandos/ver_logs');

const mensajeria = require('../mensajeria/mensajeria');

const Desde = new Date(0);


async function usuarios_mensajeria(){
    let res = await conexion.query("SELECT * FROM ver_usuarios_mensajeria()")
    var usuarios = res.rows[0].jresultado; 
    var error = usuarios[0].cod_error
    lista_mensajeria = [];

    if(error === '0'){
        for (var i= 0; i < usuarios.length ;i++) {
            lista_mensajeria.push(usuarios[i])
        }
    }

    return lista_mensajeria;
}

async function logEnviado(jsonLogEnviado){
    
    //si el estado esta vacio, mandara los registros del dia actual
    let consulta = "SELECT * FROM log_enviado($1)"; 
    let res_logs = await conexion.query(consulta, [JSON.stringify(jsonLogEnviado)]);
    
    let jresultado = res_logs.rows[0].jresultado;


    return jresultado;
}

async function registraMensajesNoEnviados(json_logs){
    //si el estado esta vacio, mandara los registros del dia actual
    let consulta = "SELECT * FROM registra_mensajes_no_enviados($1)"; 
    let res_logs = await conexion.query(consulta, [JSON.stringify(json_logs)]);
    
    let jresultado = res_logs.rows[0].jresultado;

    return jresultado;
}


class Buff{
    
    #total = 0;
    #rechazados = [];

    constructor(){
    
    }

    inicia(){
        // Estas funciones son promesas por tanto el hilo principal
        // seguirá su camino aunque no hayan finalizado
        usuarios_mensajeria().then((usuarios)=>{
            // ya tengo los usuarios
            // elimino el primer usuario que hace referencia al cod_error
            usuarios.shift();

            // ahora los logs
            ver_logs({ desde: Desde, estado: Estados.ko, enviado:false }).then((logs)=>{

                // Ya podemos enviar
                // El log[0] contiene cod_error, por tanto si hay error sólo tenemos un
                // registro y no se envia nada
                logs.forEach((log, i) => {
                    if(i>0){
                        var mensa = mensajeria.estructuraMensaje(log);
                        
                        /*if(!estoyMuerto()){
                            this.#total++;
                            mandaCorreos(mensa, usuarios, log,
                                (this.finalizaEnvio).bind(this));
                        }*/

                        this.#total++;
                        multiUsuariosTelegram(mensa, usuarios, log,
                            (this.finalizaEnvio).bind(this));
                    }
                    
                });
            });

            
        });
    }

    async finalizaEnvio(rechazados, log){
        
        if(log){
            // El mensaje se ha enviado
            var lgEnviado = {cod:log.lg_cod, fecha: new Date(), enviado:true};
            // Marcamos en la BBDD los mensajes enviado
            logEnviado(lgEnviado).catch((e)=>{
                //! Enviar este error?
                //! no deberia dar error
            });
        }
        if(rechazados.length>0){
            this.#rechazados.push(...rechazados);
        }
        
        this.#total--;
        globales.msg(this.#total);
        if(this.#total<=0){
            globales.msg('dentro');
            var consultas = [];
            
                this.#rechazados.forEach(rechazado =>{

                    // miramos si existe una consulta
                    let consulta = consultas.find( quien =>{
                        return quien.usuario == rechazado.usm_cod && quien.log_id == rechazado.log_cod
                    });

                    if(consulta){
                        // Añadimos el tipo rechazado
                        consulta.add(rechazado.tipo);
                    }else{
                        // Creamos la consulta
                        consultas.push(
                            new mensajeria.Consulta(
                                rechazado.usm_cod, rechazado.log_cod, rechazado.tipo
                            )
                        );

                    }
                });

            // ahora Pasamos la matriz de consultas cadena JSON
            // globales.msg(consultas);
            registraMensajesNoEnviados(consultas).then((x)=>{
                globales.msg(x);
            }).catch(e=>{
                globales.msg(e);
                //! Enviar este error?
                //! no deberia dar error
            });
            enviaFallos();
        globales.msg("Estoy muerto: "+estoyMuerto());
        if(estoyMuerto()){
            // Matamos al servidor?
            // no todaía queda Telegram
            // Envia un mensaje por telegram!!!
            var rlog = {
                acc_nombre: "Alertas API, correo",
                lg_estado: "KO"
            };
            multiUsuariosTelegram(dimeLaRazon(), [administrador], rlog);
        }


        }
    }
}

function enviaEmailUsuarios(mensaje, usuarios, log, alFinalizar){

    Mensajerias[TipoMensajeria.email](mensaje, usuarios, log, alFinalizar);
}


function envia(){
    
    var buff = new Buff();
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