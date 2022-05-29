-- FUNCTION: public.ver_mensajes_no_enviados()

DROP FUNCTION IF EXISTS public.ver_mensajes_no_enviados();

CREATE OR REPLACE FUNCTION public.ver_mensajes_no_enviados(
	OUT jresultado jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$

DECLARE

	icod_error integer;
	cError character varying;
	cBusca character varying;
	
BEGIN
	icod_error := 0;
	cError := '';
	cBusca :='';
    jresultado := '[]';
			
	SELECT to_json(array_agg(operacion)) FROM
	    (SELECT men_cod, men_sin_enviar,
            lg_cod, lg_descripcion, lg_fecha_alta, lg_fecha_envio,
            usm_cod cod, usm_usuario usuario, usm_mensajeria mensajeria, 
            acc_nombre, acc_descripcion, acc_accion
        FROM mensajes_no_enviados, logs, usuarios_mensajeria, acciones
            WHERE lg_cod = men_log_cod
                AND usm_cod =men_usm_cod
                AND lg_acc_cod = acc_cod
	ORDER BY lg_fecha_envio) operacion INTO jresultado;
			
			jresultado := coalesce(jresultado, '[]'::jsonb);
			
			SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
				
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion FROM control_excepciones(SQLSTATE, SQLERRM) INTO jresultado;
	END;
$BODY$;

ALTER FUNCTION public.ver_mensajes_no_enviados()
    OWNER TO postgres;
