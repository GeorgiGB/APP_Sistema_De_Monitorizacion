CREATE OR REPLACE FUNCTION public.enviar_correo(
	jleer jsonb,
	OUT jresultado jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
--	Función que enviara un correo si existe algun fallo en el servidor
--	solo podra mandar un correo a la gente que tiene registrada en la tabla de correos
--  SELECT * FROM enviar_correo('{"correo":"","pwd":"","to":"","msg":""}')

DECLARE
	icod_correo integer;
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