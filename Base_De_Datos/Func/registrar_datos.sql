CREATE OR REPLACE FUNCTION public.registrar_datos(
	jleer jsonb, -- Puede que haga falta
	OUT jresultado jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$

DECLARE
	icod_error integer;
	cError character varying;
	cTabla character varying;
BEGIN
	-- Inicializamos los parametros
	icod_error := 0;
	cError := '';
    jresultado := '[]';
	
	--	Funcion que inserta informacion a la tablas de telegram y correos
	SELECT jleer::jsonb->>'tabla' into cTabla;
	
	
	
	CASE 'telegram'
		WHEN telegram = true
			THEN 
				INSERT INTO telegram_log_envia (telelog_id_usu_tel, telelog_id_log) -- primera tabla
					SELECT usuarios_telegram ustel, logs lg -- segunda tabla
						WHERE telelog_id_usu_tel = ustel.ustel_chat_id 
							AND telelog_id_log = lg.lg_id_logs
							AND telelog_enviado = true;
		
	CASE 'correos'
		WHEN correo = true
			THEN 
				INSERT INTO correo_log_envia (colog_id_co, colog_id_log) -- primera tabla
					SELECT correos co, logs lg -- segunda tabla
						WHERE colog_id_co = co.co_cod
							AND colog_id_log = lg.lg_id_logs
							AND colog_enviado = true;
		END
	
	SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
		select excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
		END;
$BODY$;