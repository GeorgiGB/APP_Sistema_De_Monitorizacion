-- FUNCTION: public.ver_usuarios_telegram()

-- DROP FUNCTION IF EXISTS public.ver_usuarios_telegram();

CREATE OR REPLACE FUNCTION public.ver_usuarios_telegram(
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
	
	SELECT to_json(array_agg(ust)) FROM (select chat_id from usuarios_telegram) ust into jresultado;
	-- select * from ver_usuarios_telegram()
	
	SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
		select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
		END;
$BODY$;

ALTER FUNCTION public.ver_usuarios_telegram()
    OWNER TO postgres;