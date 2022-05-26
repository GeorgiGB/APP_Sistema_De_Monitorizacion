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
-- SELECT * from registra_mensajes_no_enviados('[{"usuario":"2","log_id":"14", "sin_enviar":"{telegram,correo}"}]'::jsonb);
DECLARE
	icod_error integer;
	cError character varying;
	iUsm_cod integer;
	
BEGIN
	-- Inicializamos los parametros
	icod_error := 0;
	cError := '';
    jresultado := '[]';
	iUsm_cod = -1;
    
    CREATE TEMP TABLE IF NOT EXISTS json_mensajes_no_enviados as
		SELECT
            men_usm_cod as usuario,
            men_log_cod as log_id, 
            men_sin_enviar as sin_enviar
        FROM mensajes_no_enviados
        WHERE false; -- te devuelve el tipo de record
		
	-- primero eliminamos si existe
	SELECT (j.jresultado->0->>'cod_error') into icod_error FROM elimina_de_mensajes_no_enviados(jleer) j;
		
	-- iUsm_cod := Coalesce(iUsm_cod, -1);
	
	-- Ahora insertamos el nuevo registro
    insert into mensajes_no_enviados (men_usm_cod, men_log_cod, men_sin_enviar)
        SELECT j.usuario, j.log_id, j.sin_enviar
            FROM jsonb_populate_recordset(null::json_mensajes_no_enviados, jleer) j;

    SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
	END;
$BODY$;

ALTER FUNCTION public.registra_mensajes_no_enviados(jsonb)
    OWNER TO postgres;
