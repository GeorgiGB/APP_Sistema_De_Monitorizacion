//  Creación del servidor
const express = require('express');

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

// Llamada a los usuarios de telegram
const ust = require('./comandos/ver_usuarios_telegram');

//Inicializamos los usuarios de telegram
ust()

//  Llamada del comando logs para registrar un archivos de logs.json
const logs = require('./comandos/ver_logs');

//  Llamada del bot de Telegram
const bot = require('./bots/bot_telegram');

//  Funciones generales del programa
const globales = require('./comandos/globales');

let app = express();
app.set('accesTokenSecret', verificar.llaveSecreta);


//! Configuración de cors
var corsOptions = require("./config/cors.config")

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json())
app.listen(8080);
//! -------------------------------------
globales.msg("Servidor ok");
//! -------------------------------------

/*
    Iniciar sesión con el usuario
*/
app.post('/login', (req, res) => {
    globales.lanzarPeticion(verificar, req, res)
});


app.post('/ver_ust', (req, res) => {
    globales.lanzarPeticion(ust, req, res)
});



/*
TODO FUNCION QUE MANDE UN CORREO Y UN MENSAJE POR TELEGRAM
*/
const mandar_correo = require('./bots/bot_manda_correos');

app.post('/mandar_correo', (req, res) => {
    globales.lanzarPeticion(mandar_correo, req, res)
});

/*
TODO CONFIGURAR BOT DE TELEGRAM
*/
//ust() //VER USUARIOS TELEGRAM

const job = cron.schedule('* * * * * *',()=>{
    let res_anterior = []
    logs({desde:"2022-05-18", hasta:"2022-05-20"}).then((x)=>{
        globales.msg(x)
        let res = x
        if(res_anterior!=res){
            res = res_anterior
            globales.msg("mandando mensaje desde index")
            bot.botTelegram()
        }else{
            globales.msg("no hay novedades")
    }
})
    /*globales.msg("-----------------------------")

    globales.msg('Mandando correo')
    mandar_correo()*/
},{
    scheduled: true
});

job.start();

/*
    POST para crear un archivo de logs
*/
app.post('/ver_logs',(req, res) =>{
    globales.lanzarPeticion(logs.ver_logs, req, res)
});

/*
        -------------------------Cerrar Sesion de Usuario-------------------------
    Cada usuario principal tiene un token asociado el cual solo se usara una vez,
    durante la sesión iniciada ese token estara activo. Hasta que el usuario decida salir de la aplicación,
    el cual cambiara al estado de 'false' y no se volvera a utilizar.
*/
app.post('/cerrar_sesion', (req, res) => {
    globales.lanzarPeticion(cerrar_sesion, req, res)
});

