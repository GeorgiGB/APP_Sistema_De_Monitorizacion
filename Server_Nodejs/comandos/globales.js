let _debug = true;
const header = require('./cabecera');
var fs = require('fs');

const RespuestasBBDD = {
    ok : '0',
    userOrPwdNotFound: '-404',
    userNotAuth: '-401',
    uniqueViolation: '-23505',
    foreignKeyViolation: '-23503',
    invalidTextRepresentation: '-22P02',
}

const CodigosServidor ={
    ok : 200,
    recursoNoEncontrado: 404,
    userNotAuth: 401,
    error:500
}

//  Función que utilizaremos para mandar mensajes por pantalla y comprobar errores
function msg(message){
    if(_debug){
        console.log(message)
    }
}

//  Función que permite la petición a la base de datos con la información solicitada
function peticiones(response, res){

    let responseErr = response[0].cod_error;
    let status = CodigosServidor.error;
    with(RespuestasBBDD){
        switch (responseErr){
            case ok:
                status = CodigosServidor.ok;
                break;

            case userNotAuth:
                status = CodigosServidor.userNotAuth;
                break;

            case uniqueViolation:

            case foreignKeyViolation:

            case invalidTextRepresentation:
                
            case userOrPwdNotFound:
                status = CodigosServidor.recursoNoEncontrado
                break;
                
            default:
                status = CodigosServidor.error;
        }
    }

    // Errores de la BBDD
    if(status == CodigosServidor.error){
        registrarErr(JSON.stringify(response[0]))
    }


    msg(status)
    header(res).status(status).json(response)
}

//  Función asincrona que añade un try cath para evitar errores
//  y manda la peticion deseada
function lanzarPeticion(x, req, res){
    try {
        //header(res).status(parseInt('hola')).json("asa")
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

function errorDeServidor(res, err){
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
    }}

function crearJSon(nombre, x){
    if(x == undefined){
           try{
        msg("ha entrado "+x);
        fs.writeFileSync(nombre+".json", "[{}]",function (err){
            if (err) throw err;});
        }catch (err){
            msg(err)
    }}else{
        try{
            fs.writeFileSync(nombre+".json", x,function (err){
            // si se produce un error al escribir un fichero y lo lanzamos
            // el servidor se cuelga
            if (err) throw err;});
        }catch (err){
            msg(err)   
    }}   
}

module.exports = {
    msg:msg,
    peticiones:peticiones,
    lanzarPeticion:lanzarPeticion,
    crearJSon:crearJSon
}