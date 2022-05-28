const conexion = require('../config/db.config.js')

// Generar tokens con formato JWT
const jwt = require('jsonwebtoken');
const verificarJWT = require('../middleware/verificarJWT');
const { msg } = require('./globales');

//  Funcion asincrona que hara la conexion con la base de datos 
//  y mirara si esta el usuario creado con su token
async function login(json_login){
        /*
            Petición del servidor
            Verificar si el usuario existe y proseguir con la operación
        */
       
       let reslogin = await conexion.query("SELECT * FROM login('"+JSON.stringify(json_login)+"')");
       //   Resultado de la operación
        let fila0 = reslogin.rows[0].jresultado;

        let fila = fila0[0]
        
        if(parseInt(fila.cod_error)===0){
            //  Insertar token en base de usuarios
            fila.token = getToken(json_login.usu_pwd);
            //  Hacemos la petición a la base de datos
            let instoken = await conexion.query("SELECT * FROM insertar_token('"+JSON.stringify(fila)+"')");
            fila = instoken.rows[0].jresultado
        }else{
            msg(fila0)
            fila = fila0
        }
        return fila;
    }

// Función de generación de tokens
function getToken(usuario_contra){
    return jwt.sign(
        {username: usuario_contra}, verificarJWT.llaveSecreta);
}

module.exports = login;