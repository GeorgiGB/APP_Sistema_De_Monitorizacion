-- FUNCTION: public.registra_mensajes_no_enviados(jsonb)

-- DROP FUNCTION IF EXISTS public.registra_mensajes_no_enviados(jsonb);

CREATE OR REPLACE FUNCTION public.registra_mensajes_no_enviados(
    jleer jsonb,
	OUT jresultado jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
-- SELECT * from registra_mensajes_no_enviados('[{"usu_mensaje_cod":"2","log_cod":"14", "sin_enviar":"{telegram,correo}"}]'::jsonb);
DECLARE
	icod_error integer;
	cError character varying;
	
BEGIN
	-- Inicializamos los parametros
	icod_error := 0;
	cError := '';
    jresultado := '[]';
    
    CREATE TEMP TABLE IF NOT EXISTS json_mensajes_sin_enviar as
		SELECT
            mse_prj_cod as usu_mensaje_cod,
            mse_lg_id_logs as log_cod, 
            mse_sin_enviar as sin_enviar
        FROM mensajes_sin_enviar
        WHERE false; -- te devuelve el tipo de record
	
    -- primero borramos si existe el registro
    SELECT * from elimina_de_mensajes_no_enviados(jleer) into jresultado;
    SELECT jresultado::json->>'cod_error' into icod_error;
 --
 --if icod_error = 0 then
 --    jresultado := '[]';
 --    insert into mensajes_sin_enviar (mse_prj_cod, mse_lg_id_logs, mse_sin_enviar)
 --        SELECT j.usu_mensaje_cod, j.log_cod, j.sin_enviar
 --            FROM jsonb_populate_recordset(null::json_mensajes_sin_enviar, jleer) j;

 --    SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
 --END IF;
    SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
	END;
$BODY$;

ALTER FUNCTION public.registra_mensajes_no_enviados(jsonb)
    OWNER TO postgres;
