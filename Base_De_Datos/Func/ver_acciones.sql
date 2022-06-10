-- FUNCTION: public.ver_acciones(jsonb)

DROP FUNCTION IF EXISTS public.ver_acciones(jsonb);

CREATE OR REPLACE FUNCTION public.ver_acciones(
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
	
	-- SELECT coalesce(jleer::jsonb->>'busca', '') into cBusca; -- http o api
	
	CREATE TEMP TABLE IF NOT EXISTS json_select_acc as
		SELECT acc_cod as cod, acc_fecha_alta as desde, acc_fecha_alta as hasta FROM acciones;
		
	SELECT to_json(array_agg(operacion)) FROM
	(SELECT ac.* FROM acciones ac, jsonb_populate_record(null::json_select_acc, jleer) j
		WHERE
        -- Miramos acc_cod
            CASE
                WHEN j.cod IS null THEN
                    true
                ELSE
                    ac.acc_cod = j.cod
                END
        -- Miramos fechas
        AND ac.acc_fecha_alta
            BETWEEN
                CASE
                    WHEN j.desde IS null THEN
                        '1970-01-01' --NOW()--indica el dia de hoy
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
		ORDER BY ac.acc_fecha_alta) operacion into jresultado;
			
			jresultado := coalesce(jresultado, '[]'::jsonb);
			
			SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
				
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion FROM control_excepciones(SQLSTATE, SQLERRM) INTO jresultado;
		END;
$BODY$;

ALTER FUNCTION public.ver_acciones(jsonb)
    OWNER TO postgres;