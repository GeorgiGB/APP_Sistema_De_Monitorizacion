CREATE OR REPLACE FUNCTION public.registrar_error(
	jleer jsonb,
	OUT jresultado jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
--	Función que registrara un error de la tabla de acciones
--  HARA UN INSERT DESDE LA TABLA DE ACCIONES A LOGS
--  SELECT * FROM registrar_error('{}')

DECLARE
	icod_registro integer;
	cToken character varying;
	icod_error integer;
	cError character varying;
	
BEGIN
	-- Inicializamos los parametros
	cToken := '';
	icod_error := 0;
	cError := '';
    jresultado := '[]';
	
	-- Cuando haya un error, este tiene que enviara un mensaje al servidor y a traves de un nodemail se mandara el correo
	
	SELECT ('{"cod_error":"' || icod_error || '"}')::jsonb || jresultado::jsonb into jresultado;

	EXCEPTION WHEN OTHERS THEN
		select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
		END;
$BODY$;