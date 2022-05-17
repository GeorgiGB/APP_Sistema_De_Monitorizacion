CREATE OR REPLACE FUNCTION public.registra_acciones(
	res_id integer,
	OUT iid integer)
    RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$

-- Funcion que actualizara la ultima fecha de uso del registro y acumular los usos
DECLARE

	registrolog character varying;

BEGIN
	iid:=res_id;
	registrolog :='';
	-- Actualiza la tabla de acciones
	UPDATE acciones as ac
		set fecha_ult_uso = CURRENT_TIMESTAMP, usos=usos+1
			WHERE ac.id_acciones = res_id;
	
	select descripcion from acciones ac left join logs lg on ac.descripcion = lg.registros into registrolog;

	-- Registro de acciones en la tabla log
	INSERT INTO logs(registros, acciones_id, resultado)
		VALUES (registrolog, res_id, 'ko');
END;
$BODY$;