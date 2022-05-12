-- FUNCTION: public.generador_cadena_aleatoria(integer)

-- DROP FUNCTION IF EXISTS public.generador_cadena_aleatoria(integer);

CREATE OR REPLACE FUNCTION public.generador_cadena_aleatoria(
	icount integer,
	OUT cpwd character varying,
	OUT icoderror integer,
	OUT cerror character varying)
    RETURNS record
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
	iAleat integer;

BEGIN
	
	cpwd := '';
	icoderror := 0;
	cerror :='';
	iAleat := 0;
	
	--	En ascii primero van los digitos
	--	luego las mayúsculas
	--	y después las minúsculas
	--	entre medias hay otros caracteres
	
	--	de 0 a 9 digitos
	--	de 10 a 34 alfabeto mayúsculas
	--	de 35 a 69 alfabeto minúsculas
	--	iCount := iCount -1 ;
	for ij in 1..iCount
		LOOP
		iAleat :=  round(random() * 59) :: integer;
		
		--	Añadimos el salto
		CASE
			WHEN iAleat >= 35 THEN
				iAleat :=  iAleat + ascii('a') - 35;
			WHEN iAleat >= 10 THEN
				iAleat :=  iAleat + ascii('A') - 10;
			ELSE
				iAleat :=  iAleat + ascii('0');
		END CASE;
		
		--	Obtenemos el caracter que representa iAleat
		--	y lo concatenamos al pwd
		cpwd := cpwd || chr(iAleat);
		
	END LOOP;

	EXCEPTION WHEN OTHERS THEN
		iCoderror := -1;
		cError := SQLERRM;
		END;
$BODY$;

ALTER FUNCTION public.generador_cadena_aleatoria(integer)
    OWNER TO postgres;


--	Función de que permite crear una contraseña automática
--	para la creación de una empresa o de un usuario de telemetria