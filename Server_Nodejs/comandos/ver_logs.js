const conexion = require('../config/conexion_bd.config');
const debug = require('./globales');
var fs = require('fs');
const { msg } = require('./globales');

async function ver_logs(json_logs){
    
    debug.msg(JSON.stringify(json_logs))

    let res_logs = await conexion.query("SELECT * FROM ver_logs('"+JSON.stringify(json_logs)+"');");
    //si el estado esta vacio, mandara los registros del dia actual

    debug.msg(res_logs.rows[0])
    registrarLogs(JSON.stringify(res_logs.rows[0].jresultado))
    return res_logs.rows[0].jresultado;
}


async function registrarLogs(x){
    if(x!=null){
      try{
        let mensaje = x.nombre
        fs.writeFileSync("logs.json", x,function (err){
            // si se produce un error al escribir un fichero y lo lanzamos
            // el servidor se cuelga
            if (err) throw err;});
        }catch (err){
            msg(err)
    }}else{
    //     try{
    //         fs.writeFileSync("logs.json", "[{}]",function (err){
    //         // si se produce un error al escribir un fichero y lo lanzamos
    //         // el servidor se cuelga
    //         if (err) throw err;});
    //     }catch (err){
    //         msg(err)
        
    // }
    
}
}

module.exports ={
    ver_logs:ver_logs,
    registrarLogs:registrarLogs
} 