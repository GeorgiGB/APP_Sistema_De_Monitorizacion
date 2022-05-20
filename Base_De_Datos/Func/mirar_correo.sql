-- FUNCTION: public.mirar_correos()

-- DROP FUNCTION IF EXISTS public.mirar_correos();

CREATE OR REPLACE FUNCTION public.mirar_correos(
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
	
	SELECT to_json(array_agg(co)) FROM (select correo from correos) co into jresultado;
	-- select * from mirar_correos()
	
	SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
		select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
		END;
$BODY$;

ALTER FUNCTION public.mirar_correos()
    OWNER TO postgres;