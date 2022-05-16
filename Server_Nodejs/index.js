//  Creación del servidor
const express = require('express');

//  Para trabajar Intercambio de Recursos de Origen Cruzado de diferentes servidores
const cors = require('cors');

//  Tratar datos con formato JSON
const bodyParser = require('body-parser');

//  Verifica si el usuario existe en el sistema
const verificar = require('./comandos/login');

//  Cambiara el estado del token del usuario
const cerrar_sesion = require('./comandos/cerrar_sesion');

//  Funciones generales del programa
const globales = require('./comandos/globales');

let app = express();
app.set('accesTokenSecret', verificar.llaveSecreta)

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

/*
TODO FUNCION QUE DETECTE ERRORES Y QUE MANDE UN CORREO O MENSAJE POR TELEGRAM
*/
const correo = require('./comandos/ver_correos');
correo('{"correo":"georgig200@gmail.com"}');
//globales.lanzarPeticion(correo);

/*
        -------------------------Cerrar Sesion de Usuario-------------------------
    Cada usuario principal tiene un token asociado el cual solo se usara una vez,
    durante la sesión iniciada ese token estara activo. Hasta que el usuario decida salir de la aplicación,
    el cual cambiara al estado de 'false' y no se volvera a utilizar.
*/
app.post('/cerrar_sesion', (req, res) => {
    globales.lanzarPeticion(cerrar_sesion, req, res)
});

