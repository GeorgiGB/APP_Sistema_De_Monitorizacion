-- FUNCTION: public.ver_usuarios_mensajeria()

-- DROP FUNCTION IF EXISTS public.ver_usuarios_mensajeria();

CREATE OR REPLACE FUNCTION public.ver_usuarios_mensajeria(
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
	
	select to_json(array_agg(usm_mensajeria)) from usuarios_mensajeria into jresultado;
			
			SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
				
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion FROM control_excepciones(SQLSTATE, SQLERRM) INTO jresultado;
		END;
$BODY$;

ALTER FUNCTION public.ver_usuarios_mensajeria()
    OWNER TO postgres;