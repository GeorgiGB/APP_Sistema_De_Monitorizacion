-- FUNCTION: public.ver_logs(jsonb)

-- DROP FUNCTION IF EXISTS public.ver_logs(jsonb);

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
	
	SELECT coalesce(jleer::jsonb->>'busca', '') into cBusca;
	
	--SELECT array_to_json(array_agg(l)) FROM logs l INTO jresultado;
	
	CREATE TEMP TABLE IF NOT EXISTS json_select_log as
		SELECT fecha_alta as desde, fecha_alta as hasta, resultado as res FROM logs
			WHERE false; -- te devuelve el tipo de record
			
	SELECT to_json(array_agg(operacion)) FROM
	(SELECT l.*, ac.nombre FROM logs l,
	 acciones ac, jsonb_populate_record(null::json_select_log, jleer) j
		WHERE l.acciones_id = ac.id_acciones
	 	AND l.fecha_alta BETWEEN
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
			AND l.registros LIKE '%'||cBusca||'%'
			AND
				CASE
					WHEN j.res is null THEN
						true
				ELSE
					l.resultado = j.res
			END) operacion into jresultado;
			
			SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
		
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion FROM control_excepciones(SQLSTATE, SQLERRM) INTO jresultado;
		END;
$BODY$;

ALTER FUNCTION public.ver_logs(jsonb)
    OWNER TO postgres;