-- FUNCTION: public.elimina_de_mensajes_no_enviados(jsonb)

-- DROP FUNCTION IF EXISTS public.elimina_de_mensajes_no_enviados(jsonb);

CREATE OR REPLACE FUNCTION public.elimina_de_mensajes_no_enviados(
    jleer jsonb,
	OUT jresultado jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
-- select * from elimina_de_mensajes_no_enviados('[{"usu_mensaje_cod":"2","log_cod":"14"}]'::jsonb);
DECLARE
	icod_error integer;
	cError character varying;
	
BEGIN
	-- Inicializamos los parametros
	icod_error := 0;
	cError := '';
    jresultado := '[]';
    
    CREATE TEMP TABLE IF NOT EXISTS json_elimina_mensajes_sin_enviar as
		SELECT
            mse_prj_cod as usu_mensaje_cod,
            mse_lg_id_logs as log_cod
        FROM mensajes_sin_enviar
        WHERE false; -- te devuelve el tipo de record
	
    DELETE FROM mensajes_sin_enviar
        WHERE (mse_prj_cod, mse_lg_id_logs)
        IN (SELECT j.usu_mensaje_cod, j.log_cod 
            FROM jsonb_populate_recordset(null::json_mensajes_sin_enviar, jleer) j);
	
	SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
		select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
	END;
$BODY$;

ALTER FUNCTION public.elimina_de_mensajes_no_enviados(jsonb)
    OWNER TO postgres;
