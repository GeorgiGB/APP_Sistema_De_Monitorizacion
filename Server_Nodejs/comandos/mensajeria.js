//  Funciones generales del programa
const globales = require('./globales');
const fetch = require('node-fetch');// npm i node-fetch@2
const ver_acciones = require('./ver_acciones');
const inserta_log = require('./inserta_log');
const { msg } = require('./globales');





function envia(){
    msg('Lee si hay logs por enviar')

}


module.exports = {
    envia:envia
}