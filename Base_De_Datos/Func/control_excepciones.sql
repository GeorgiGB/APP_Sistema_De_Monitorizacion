-- FUNCTION: public.control_excepciones(character varying, character varying)

-- DROP FUNCTION IF EXISTS public.control_excepciones(character varying, character varying);

CREATE OR REPLACE FUNCTION public.control_excepciones(
	cod_error character varying,
	cerror character varying,
	OUT excepcion character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$

    BEGIN
        excepcion := '';
        --	Códigos de error -> https://www.postgresql.org/docs/current/errcodes-appendix.html
				CASE
					 --	El '23505' equivale a unique_violation
					 --	si ponemos directamente unique_violation en lugar de '23505'
					 --	da el siguiente error "ERROR:  no existe la columna «unique_violation»"
					WHEN cod_error = '23505' THEN
                        --cod_error :='-23505';
						cerror := 'unique_violation';
						
					WHEN cod_error = '23503' THEN
						--cod_error :='-23503';
						cerror := 'foreign_key_violation';
						
					WHEN cod_error = '22P02' THEN
						--cod_error :='-22P02';
						cerror := 'invalid_text_representation';
					
					-- Otros posibles errores no contemplados
					ELSE
						--cod_error := '-' || cod_error;
				END CASE;
				
				excepcion :='[{"cod_error":"' || '-' || cod_error || '", "msg_error":"' || cerror || '"}]';
			END;
$BODY$;

ALTER FUNCTION public.control_excepciones(character varying, character varying)
    OWNER TO postgres;

