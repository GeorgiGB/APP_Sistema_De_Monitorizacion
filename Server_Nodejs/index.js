//  Creación del servidor
const express = require('express');

const fetch = require('node-fetch');// npm i node-fetch@2

//  Para trabajar Intercambio de Recursos de Origen Cruzado de diferentes servidores
const cors = require('cors');

//  NPM para automatizar procesos como mandar correos o mensajes de servidor
const cron = require('node-cron')

//  Tratar datos con formato JSON
const bodyParser = require('body-parser');

//  Funciones generales del programa
const globales = require('./comandos/globales');

//  Verifica si el usuario existe en el sistema
const verificar = require('./comandos/login');

//  Cambiara el estado del token del usuario
const cerrar_sesion = require('./comandos/cerrar_sesion');

//  Automatiza las acciones de la tabla
const lanzarAcciones = require('./comandos/lanzar_accion')

//  Llamada del comando logs para registrar un archivos de logs.json
const logs = require('./comandos/ver_logs');

// Modulo encargado que consulta y ejecuta las acciones a realizar
const acciones = require('./comandos/acciones');

// Modulo encargado que consultar y enviar por mensajería
// los registros de las acciones de la BBDD
const mensajeria = require('./mensajeria/logs_para_enviar');

// Modulo encargado que consultar y reenviar por mensajería
// los diferentes registros que no se han podido enviar por diferentes motivos
const enviaNoEnviados = require('./mensajeria/mensajeria_no_enviada.js');



let app = express();
app.set('accesTokenSecret', verificar.llaveSecreta);


//! Configuración de cors
var corsOptions = require("./config/cors.config")

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json())
app.listen(8080);

// LLamadas que el servidor tiene que atender
/*
    Iniciar sesión con el usuario
*/
app.post('/login', (req, res) => {
    globales.lanzarPeticion(verificar, req, res)
});

app.post('/cerrar_sesion', (req, res) => {
    globales.lanzarPeticion(cerrar_sesion, req, res)
});


app.post('/ver_logs',(req, res) =>{
    globales.lanzarPeticion(logs, req, res)
});
//    ---- Fin llamadas atención al servidor


// Iniciamos las acciones a ejecutar
const job = cron.schedule('0 */5 * * * *',()=>{
    globales.msg("hola cada 5'");

    acciones.ejecuta(()=>{
        globales.msg('Las acciones han finalizado');
        mensajeria.envia();
    });

    // enviaNoEnviados se ejecutará una vez cada hora
    enviaNoEnviados.envia();
},{
    scheduled: false
});

//job.start();

/**/
acciones.ejecuta(()=>{
    globales.msg('Las acciones han finalizado');
    mensajeria.envia();
    enviaNoEnviados.envia();
});
/**/
//mensajeria.envia();

//
//enviaNoEnviados.envia();
//

//! -------------------------------------
globales.msg("Servidor ok");
//! -------------------------------------


//console.log(process.env.ALERTAS_API_PWD)

