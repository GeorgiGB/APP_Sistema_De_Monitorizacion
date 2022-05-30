-- FUNCTION: public.elimina_de_mensajes_no_enviados(jsonb)

DROP FUNCTION IF EXISTS public.elimina_de_mensajes_no_enviados(jsonb);

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
	iMen_cod integer;
	
BEGIN
	-- Inicializamos los parametros
	icod_error := 0;
	cError := '';
    jresultado := '[]';
	iMen_cod := -1;
    
    CREATE TEMP TABLE IF NOT EXISTS json_mensajes_no_enviados as
		SELECT
            men_cod as men_cod,
            men_usm_cod as usuario,
            men_log_cod as log_id
        FROM mensajes_no_enviados
        WHERE false; -- te devuelve el tipo de record
     
    iMen_cod := (jleer::jsonb#>>'{0,men_cod}')::integer;
    
    IF iMen_cod IS NULL THEN
        DELETE FROM mensajes_no_enviados
            WHERE (men_usm_cod, men_log_cod)
                IN (SELECT j.usuario, j.log_id
                    FROM jsonb_populate_recordset(null::json_mensajes_no_enviados, jleer) j);
    ELSE
        DELETE FROM mensajes_no_enviados
            WHERE (men_cod)
                IN (SELECT j.men_cod
                    FROM jsonb_populate_recordset(null::json_mensajes_no_enviados, jleer) j);
    END IF;
	
	
	SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
		select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
	END;
$BODY$;

ALTER FUNCTION public.elimina_de_mensajes_no_enviados(jsonb)
    OWNER TO postgres;
