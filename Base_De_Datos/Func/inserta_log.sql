-- FUNCTION: public.insert_log_envia(jsonb)

DROP FUNCTION IF EXISTS public.inserta_log(jsonb);

CREATE OR REPLACE FUNCTION public.inserta_log(
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
    iCod_log character varying;
    dAhora timestamp with time zone;
    
BEGIN
	-- Inicializamos valores
	icod_error := 0;
	cError := '';
    jresultado := '[]';
    dAhora := NOW();
	
    CREATE TEMP TABLE IF NOT EXISTS json_insert_log as
    SELECT lg_descripcion as descripcion, lg_acciones_id as accion, lg_estado as estado 
        FROM logs WHERE false; -- te devuelve el tipo de record
            
    -- No podemos hacer un select directamente sobre un insert aunque tenga returning
	-- Por eso, insertamos y con with recogemos el resultado que lo utilizamos
    -- en el último select para guardarlo en jresultado en formato JSON
	WITH insertat AS ( INSERT INTO logs(lg_descripcion, lg_acciones_id, lg_estado, lg_fecha_alta)
		SELECT j.descripcion, j.accion, j.estado, dAhora
			FROM jsonb_populate_recordset(null::json_insert_log, jleer) j
        RETURNING lg_id_logs log_cod, lg_fecha_alta ahora )
        
    SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb
            ||to_json(array_agg(operacion))::jsonb
        FROM (select * from insertat) operacion INTO jresultado;
        
    -- Ahora actualizamos la fecha de último uso
    UPDATE acciones SET (acc_fecha_ult_uso, acc_usos) = (dAhora, acc_usos + 1)
        FROM 
            jsonb_populate_recordset(null::json_insert_log, jleer) j
        WHERE 
          acc_id_acciones = j.accion;
	
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion FROM control_excepciones(SQLSTATE, SQLERRM) INTO jresultado;
	END;

$BODY$;

ALTER FUNCTION public.inserta_log(jsonb)
    OWNER TO postgres;
