-- FUNCTION: public.log_enviado(jsonb)

DROP FUNCTION IF EXISTS public.log_enviado(jsonb);

CREATE OR REPLACE FUNCTION public.log_enviado(
	jleer jsonb,
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
	icod_error := 0;
	cError := '';
    jresultado := '[]';
    
	
	CREATE TEMP TABLE IF NOT EXISTS json_log_enviado as
		SELECT lg_cod as cod, lg_fecha_envio as fecha,
               lg_enviado as enviado FROM logs
			WHERE false; -- te devuelve el tipo de record
        
    UPDATE logs SET lg_fecha_envio=j.fecha, lg_enviado=j.enviado
        FROM (SELECT *
              FROM  jsonb_populate_record(null::json_log_enviado, jleer) ) AS j
        WHERE lg_cod = j.cod;

    SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
				
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion FROM control_excepciones(SQLSTATE, SQLERRM) INTO jresultado;
    END;
$BODY$;

ALTER FUNCTION public.log_enviado(jsonb)
    OWNER TO postgres;
