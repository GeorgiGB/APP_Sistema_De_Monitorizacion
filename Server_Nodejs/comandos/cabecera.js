//  Función que sirve para la cabecera de todas las peticiones
function cabecera(response){
    response.header("Access-Control-Allow-Headers", "Content-Type")
    .header("Access-Control-Allow-Credentials", "true")
    .header("Access-Control-Allow-Methods", "POST")
    .header("Content-Type", "application/json; charset=utf-8")
    .header("Pragma", "no-cache")

    return response;
}

module.exports = cabecera;