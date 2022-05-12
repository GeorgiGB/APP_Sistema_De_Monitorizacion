-- FUNCTION: public.validar_token(jsonb)

-- DROP FUNCTION IF EXISTS public.validar_token(jsonb);

CREATE OR REPLACE FUNCTION public.validar_token(
	jleer jsonb,
	OUT bok boolean,
	OUT cerror character varying)
    RETURNS record
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
	rRegistro record;
	iUsu_cod integer;
	cerror character varying;
	iCoderror integer;
BEGIN
	-- Inicializamos los parametros
	
	bok := false;
	iUsu_cod := -1;
	cError := '';
	iCoderror := 0;
	
	--	Creacion de una tabla temporal para manipular los datos en ella
	CREATE TEMP TABLE IF NOT EXISTS json_validar_token(
		ctoken character varying
	);

		
	SELECT ut.ust_activo into bok FROM usuarios_token ut, -- tabla 1
		 jsonb_populate_record(null::json_validar_token, jleer) t2 -- tabla 2 temporal
			 WHERE ut.ust_token = t2.ctoken AND ut.ust_activo;
	
	IF NOT FOUND THEN
		bok := false;
	else
		UPDATE usuarios_token ut
			SET ust_usos = ust_usos + 1
				FROM jsonb_populate_record(null::json_validar_token, jleer) t2
					WHERE ut.ust_token = t2.ctoken;
	END IF;
	
	EXCEPTION WHEN OTHERS THEN
		iCoderror := -1;
		cerror := SQLERRM;
		END;
$BODY$;

ALTER FUNCTION public.validar_token(jsonb)
    OWNER TO postgres;