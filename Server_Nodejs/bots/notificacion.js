var log = require('../logs.json')
let globales = require('../comandos/globales')
//  Funcion que manda un mensaje de notificacion tanto en correo como en telegram
function notificacion()
{
  globales.msg(log)
  if(log[1]&&log[1].acc_nombre){
    return [
      'Codigo de error: '+log[0].cod_error+
      '\nNombre: '+log[1].acc_nombre+
      '\nId: '+log[1].lg_cod+
      '\nRegistro: '+log[1].lg_registros+
      '\nFecha de alta: '+log[1].lg_fecha_alta+
      '\nNombre de la accion: '+log[1].lg_acc_cod+
      '\n-----------------------'+
      '\nResultado: '+log[1].lg_estado+
      '\n-----------------------',
      ];
  }else{
    //  Si el json esta vacio mandaremos un mensaje predeterminado
    return 'No hay novedades';
  }
}

module.exports = notificacion;