CREATE OR REPLACE FUNCTION public.mirar_correos(
	OUT jresultado jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$

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
	
	SELECT jsonb_agg(correo) FROM correos into jresultado;
	
	-- Cuando haya un error, este tiene que enviara un mensaje al servidor y a traves de un nodemail se mandara el correo

	EXCEPTION WHEN OTHERS THEN
		select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
		END;
$BODY$;