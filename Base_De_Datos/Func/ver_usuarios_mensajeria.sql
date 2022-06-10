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
    
	SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb
            ||to_json(array_agg(operacion))::jsonb
        FROM (select usm_cod cod, usm_usuario usuario, usm_mensajeria mensajeria
              from usuarios_mensajeria) operacion into jresultado;
    
    IF jresultado IS NULL THEN
        jresultado = '[{"cod_error":"' || icod_error ||'"}]';
    END IF;
				
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion FROM control_excepciones(SQLSTATE, SQLERRM) INTO jresultado;
		END;
$BODY$;

ALTER FUNCTION public.ver_usuarios_mensajeria()
    OWNER TO postgres;
