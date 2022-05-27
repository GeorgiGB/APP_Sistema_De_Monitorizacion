CREATE OR REPLACE FUNCTION public.crear_acciones(
	nom character varying,
	dsc character varying, -- descripcion
	tipo tipo,
	OUT res character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
BEGIN

insert into acciones(nombre,descripcion,tservicio)
	VALUES(nom,dsc,tipo);

END;
$BODY$;