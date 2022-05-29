-- FUNCTION: public.ver_logs(jsonb)

DROP FUNCTION IF EXISTS public.ver_logs(jsonb);

CREATE OR REPLACE FUNCTION public.ver_logs(
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
	cBusca character varying;
	
BEGIN
	-- Para ver las horas https://www.postgresqltutorial.com/postgresql-date-functions/postgresql-now/
	-- select * from logs where fecha_alta between '2022-05-16' AND '2022-05-17 12:18' 
	-- AND resultado LIKE '%%' AND registros LIKE '%p%'
	-- Inicializamos los parametros
	icod_error := 0;
	cError := '';
	cBusca :='';
    jresultado := '[]';
    
	
	CREATE TEMP TABLE IF NOT EXISTS json_select_log as
		SELECT lg_fecha_alta as desde, lg_fecha_alta as hasta,
               lg_estado as estado, lg_enviado as enviado FROM logs
			WHERE false; -- te devuelve el tipo de record
			
	SELECT to_json(array_agg(operacion)) FROM
	(SELECT l.*, ac.acc_nombre, ac.acc_descripcion, ac.acc_accion FROM logs l,
	 acciones ac, jsonb_populate_record(null::json_select_log, jleer) j
		WHERE l.lg_acc_cod = ac.acc_cod
            AND l.lg_fecha_alta BETWEEN
                CASE
                    WHEN j.desde IS null THEN
                        NOW()--indica el dia de hoy
                    ELSE
                        j.desde
                    END
			AND
				CASE
					WHEN j.hasta IS null THEN
						(NOW()+ interval '1 day')--indica el dia de despues
					ELSE
					j.hasta
					END
			AND l.lg_descripcion LIKE '%'||cBusca||'%'
            
            -- Miramos el estado cualquiera o ko - ok
			AND
				CASE
					WHEN j.estado is null THEN
						true
				ELSE
					l.lg_estado = j.estado
			    END
     
            -- Comprobamos si se ha enviado o no o cualquiera
			AND
				CASE
					WHEN j.enviado is null THEN
						true
				ELSE
					l.lg_enviado = j.enviado
                END
	ORDER BY l.lg_fecha_alta) operacion into jresultado;
			
			jresultado := coalesce(jresultado, '[]'::jsonb);
			
			SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
				
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion FROM control_excepciones(SQLSTATE, SQLERRM) INTO jresultado;
		END;
$BODY$;

ALTER FUNCTION public.ver_logs(jsonb)
    OWNER TO postgres;
