-- FUNCTION: public.actualiza_fecha_envio(integer)

DROP FUNCTION IF EXISTS public.actualiza_fecha_envio(integer);

CREATE OR REPLACE FUNCTION public.actualiza_fecha_envio(
	icod integer,
	OUT jresultado jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$

DECLARE
	icod_error integer;
	cError character varying;
	
BEGIN
	-- Inicializamos los parametros
	icod_error := 0;
	cError := '';
    jresultado := '[]';
	
	UPDATE logs SET lg_enviado = true, lg_fecha_envio = NOW() WHERE lg_cod = icod;
	
	SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
		select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
		END;
$BODY$;

ALTER FUNCTION public.actualiza_fecha_envio(integer)
    OWNER TO postgres;