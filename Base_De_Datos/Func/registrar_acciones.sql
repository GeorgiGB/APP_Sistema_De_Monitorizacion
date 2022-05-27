-- FUNCTION: public.registra_acciones(integer)

-- DROP FUNCTION IF EXISTS public.registra_acciones(integer);

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

	cRegistrolog character varying;

BEGIN
	iid:=res_id;
	cRegistrolog :='';
	-- Actualiza la tabla de acciones
	UPDATE acciones as ac
		SET fecha_ult_uso = NOW(), usos=usos+1
			WHERE ac.id_acciones = res_id;
	
	SELECT descripcion FROM acciones ac LEFT JOIN logs lg ON ac.descripcion = lg.registros INTO cRegistrolog;

	-- Registro de acciones en la tabla log
	INSERT INTO logs(registros, acciones_id, resultado)
		VALUES (registrolog, res_id, 'ko');--dejamos ko de forma predeterminada, falta desarrollar el tema de acciones
END;
$BODY$;

ALTER FUNCTION public.registra_acciones(integer)
    OWNER TO postgres;