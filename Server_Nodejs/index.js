//  Creación del servidor
const express = require('express');

const fetch = require('node-fetch');// npm i node-fetch@2

//  Para trabajar Intercambio de Recursos de Origen Cruzado de diferentes servidores
const cors = require('cors');

//  NPM para automatizar procesos como mandar correos o mensajes de servidor
const cron = require('node-cron')

//  Tratar datos con formato JSON
const bodyParser = require('body-parser');
//  Verifica si el usuario existe en el sistema
const verificar = require('./comandos/login');

//  Cambiara el estado del token del usuario
const cerrar_sesion = require('./comandos/cerrar_sesion');

//  Funciones generales del programa
const globales = require('./comandos/globales');

globales.crearJSon('logs', '[{}]');

//! TODO rehacer la función de ver_usuarios_telegram
//! por ver usuarios_mensajeria
// Llamada a los usuarios de telegram
const usuarios_mensajeria = require('./comandos/usuarios_mensajeria');

//! De momento esta llamada se comenta
// Inicializamos los usuarios de telegram
//usuarios_mensajeria()


//  Llamada del comando logs para registrar un archivos de logs.json
const logs = require('./comandos/ver_logs');

//  Ver las acciones del servidor
const ver_acciones = require('./comandos/ver_acciones')

//  Automatiza las acciones de la tabla
const lanzarAcciones = require('./comandos/lanzar_accion')


let app = express();
app.set('accesTokenSecret', verificar.llaveSecreta);


const acciones = require('./comandos/acciones');
const mensajeria = require('./mensajeria/logs_para_enviar');
const enviaNoEnviados = require('./mensajeria/mensajeria_no_enviada.js');

//! Configuración de cors
var corsOptions = require("./config/cors.config")

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json())
app.listen(8080);

/*
    Iniciar sesión con el usuario
*/
app.post('/login', (req, res) => {
    globales.lanzarPeticion(verificar, req, res)
});


app.post('/usuarios_mensajeria', (req, res) => {
    globales.lanzarPeticion(usuarios_mensajeria, req, res)
});




app.post('/mandar_correo', (req, res) => {
    globales.lanzarPeticion(mandar_correo, req, res)
});



/*
    POST para crear un archivo de logs
*/
app.post('/ver_logs',(req, res) =>{
    globales.lanzarPeticion(logs, req, res)
});


/*
    POST para ver la tablas de acciones
*/
app.post('/ver_acciones',(req, res) =>{
    globales.lanzarPeticion(ver_acciones, req, res)
});

//lanzarAcciones.lanzaAcciones()

/*
        -------------------------Cerrar Sesion de Usuario-------------------------
    Cada usuario principal tiene un token asociado el cual solo se usara una vez,
    durante la sesión iniciada ese token estara activo. Hasta que el usuario decida salir de la aplicación,
    el cual cambiara al estado de 'false' y no se volvera a utilizar.
*/
app.post('/cerrar_sesion', (req, res) => {
    globales.lanzarPeticion(cerrar_sesion, req, res)
});

const job = cron.schedule('0 */5 * * * *',()=>{
    globales.msg("hola cada 5'");

    acciones.ejecuta(()=>{
        globales.msg('Las acciones han finalizado');
        mensajeria.envia();
    });

    // enviaNoEnviados se ejecutará una vez cada hora
    
    enviaNoEnviados.envia();

    /*
    let res_anterior = []
    logs({desde:"2022-05-17", hasta:"2022-05-20"})
        .then((x)=>{
            globales.msg(x)
            let res = x
            if(res_anterior!=res){
                res = res_anterior
                globales.msg("mandando mensaje desde index")
                r = bot()
            }else{
                globales.msg("no hay novedades")
            }
        })
    globales.msg("-----------------------------")

    globales.msg('Mandando correo')
    mandar_correo()*/
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

//bot(); //BOT DE TELEGRAM INICIALIZADO
