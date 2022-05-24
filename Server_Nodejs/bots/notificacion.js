var log = require('../logs.json')

//  Funcion que manda un mensaje de notificacion tanto en correo como en telegram
function notificacion()
{
  if(log[1]&&log[1].nombre){
    return [
      'Codigo de error: '+log[0].cod_error+
      '\nNombre: '+log[1].nombre+
      '\nId: '+log[1].id_logs+
      '\nRegistro: '+log[1].registros+
      '\nFecha de alta: '+log[1].fecha_alta+
      '\nNombre de la accion: '+log[1].acciones_id+
      '\n-----------------------'+
      '\nResultado: '+log[1].resultado+
      '\n-----------------------',
      ];
  }else{
    //  Si el json esta vacio mandaremos un mensaje predeterminado
    return 'No hay mensajes';
  }
}

module.exports = notificacion;