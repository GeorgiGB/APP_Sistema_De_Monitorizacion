-- FUNCTION: public.ver_prueba_json()

-- DROP FUNCTION IF EXISTS public.ver_prueba_json();

CREATE OR REPLACE FUNCTION public.ver_prueba_json(
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
	
	SELECT to_json(array_agg(prjson)) FROM (select * from prueba_json) prjson into jresultado;
	-- select * from ver_prueba_json()
	
	SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
        select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
    END;
$BODY$;

ALTER FUNCTION public.ver_prueba_json()
    OWNER TO postgres;