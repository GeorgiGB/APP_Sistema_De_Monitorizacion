// Módulos necesarios para trabaja
const header = require('./cabecera'); // Crea la cabecera para la respuesta
var fs = require('fs'); // Sistema de archivos para poder escribir en el log del sistema

const _debug = true;
//  Función que utilizaremos para mandar mensajes por pantalla y comprobar errores
function msg(message){
    if(_debug){
        console.log(message)
    }
}

// Constantes de la respuestas de la BBDD
const RespuestasBBDD = {
    ok : '0',
    userOrPwdNotFound: '-404',
    userNotAuth: '-401',
    uniqueViolation: '-23505',
    foreignKeyViolation: '-23503',
    invalidTextRepresentation: '-22P02',
}

//Constantes con los códigos de respuesta
// utilizados por el servidor
const CodigosServidor ={
    ok : 200,
    recursoNoEncontrado: 404,
    userNotAuth: 401,
    error:500
}


// Función común para centralizar las respuestas
// de la BBDD generadas por las diferentes solicitudes al servidor
function peticiones(response, res){

    let responseErr = response[0].cod_error;
    let status = CodigosServidor.error;
    //Controlamos las respuestas
    with(RespuestasBBDD){
        switch (responseErr){
            case ok:
                status = CodigosServidor.ok;
                break;

            case userNotAuth:
                status = CodigosServidor.userNotAuth;
                break;
            // No se ha podido encontrar el recurso solicitado
            // La respuesta de la BBDD contiene el motivo
            case uniqueViolation:
            case foreignKeyViolation:
            case invalidTextRepresentation:
            case userOrPwdNotFound:
                status = CodigosServidor.recursoNoEncontrado
                break;
            // Cualquier otro código és un error del servidor
            // de la BBDD
            default:
                status = CodigosServidor.error;
        }
    }

    // Errores de la BBDD y lo registramos
    if(status == CodigosServidor.error){
        registrarErr(JSON.stringify(response[0]))
    }

    // Enviamos la respuesta del servidor
    header(res).status(status).json(response)
}

//  Función asíncrona que añade un try catch para evitar errores
//  y manda la peticion deseada
function lanzarPeticion(x, req, res){
    // Capturamos los posibles errores y los registramos
    // con la función error de servidor
    try {
        let authorization = req.headers.authorization
        if(authorization){
            req.body.ctoken = authorization.split(' ')[1]
        }
        x(req.body).then(response => {
            // peticiones no es un future
            peticiones(response, res);
        }).catch (err => errorDeServidor(res, err));
    }catch(err){
        errorDeServidor(res, err);
    }
}

// Se genera la respuesta y el status del error
// adjuntando la respuesta en formato JSON
function errorDeServidor(res, err){
    console.log(err)
    let msg_error = {status : CodigosServidor.error,
        cod_error: -1,
        msg_error: err.name + ': '+ err.message}
    header(res).status(CodigosServidor.error).json(msg_error)
    registrarErr(JSON.stringify(msg_error))
}

//  Función para registrar errores del servidor que se guardaran en un archivo txt
function registrarErr(msgerr){
    let diastring = new Date().toString();
    diastring = diastring.substring(0, diastring.indexOf('('))
    try {
        fs.appendFile('registroLogs.txt',
        "["+diastring+"]"+
        "[msg: "+ msgerr + "]\n", function (err){
            // si se produce un error al escribir un fichero y lo lanzamos
            // el servidor se cuelga
            if (err) throw err;});
    }catch (err){
        msg(err)
    }
}


module.exports = {
    msg:msg,
    peticiones:peticiones,
    lanzarPeticion:lanzarPeticion,
}