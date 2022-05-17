-- FUNCTION: public.ver_logs()

-- DROP FUNCTION IF EXISTS public.ver_logs();

CREATE OR REPLACE FUNCTION public.ver_logs(
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
	
	SELECT array_to_json(array_agg(l)) FROM logs l INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
		select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
		END;
$BODY$;

ALTER FUNCTION public.ver_logs()
    OWNER TO postgres;
