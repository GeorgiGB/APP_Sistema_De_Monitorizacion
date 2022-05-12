-- FUNCTION: public.cerrar_sesion(jsonb)

-- DROP FUNCTION IF EXISTS public.cerrar_sesion(jsonb);

CREATE OR REPLACE FUNCTION public.cerrar_sesion(
	jleer jsonb,
	OUT jresultado jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
--	Función que permitira cambiar el estado de un token
--	de un usuario principal, si este tiene el token activo
--	cambiara a inactivo, por lo tanto tendria que iniciar de nuevo sesión
--  SELECT * FROM cerrar_sesion('{"name_token":"a"}')

DECLARE
	icodusu integer;
	cToken character varying;
	icod_error integer;
	cError character varying;
	
BEGIN
	-- Inicializamos los parametros
	cToken := '';
	icod_error := 0;
	cError := '';
    jresultado := '[]';
	
	--	Transformamos el jleer que era principalmente un character varying
	--	por un json ya que tenemos que manipular los datos
	--	y luego insertarlo a cToken
	SELECT jleer::json->>'ctoken' into cToken;

	--	Hacemos un update de usuarios_token con el json ya transformado
	UPDATE usuarios_token
		SET ust_activo = false	--	indicamos que lo queremos a false
		WHERE usuarios_token.ust_token = cToken AND usuarios_token.ust_activo
		--	Que busque por la tabla y que este activo
		--	si este no lo esta no continuara y no devolvera nada
		RETURNING usuarios_token.ust_cod into icodusu;
		--	Si existe el usuario con el token activo
		--	devolvera el cod del usuario
		
	icodusu := COALESCE(icodusu, -1);
	
	SELECT ('{"cod_error":"' || icod_error || '"}')::jsonb || jresultado::jsonb into jresultado;

	EXCEPTION WHEN OTHERS THEN
		select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
		END;
$BODY$;

ALTER FUNCTION public.cerrar_sesion(jsonb)
    OWNER TO postgres;
