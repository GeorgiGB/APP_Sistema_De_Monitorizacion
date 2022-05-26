-- FUNCTION: public.inserta_usuarios_mensajeria(jsonb)

-- DROP FUNCTION IF EXISTS public.inserta_usuarios_mensajeria(jsonb);

CREATE OR REPLACE FUNCTION public.inserta_usuarios_mensajeria(
	jleer jsonb,
	OUT jresultado jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
-- SELECT * from inserta_usuarios_mensajeria('[{"usuario":"Joselito", "mensajeria":{"telegram":"0000","correo_e":"@meme.com"}}]'::jsonb);
-- SELECT * from inserta_usuarios_mensajeria('[{"usuario":"Eva", "mensajeria":{"telegram":"0000","correo_e":"@meme.com"}}]'::jsonb);
DECLARE
	icod_error integer;
	cError character varying;
	cNombre character varying;
	
BEGIN
	-- Inicializamos los parametros
	icod_error := 0;
	cError := '';
    jresultado := '[]';
    
    CREATE TEMP TABLE IF NOT EXISTS json_usuarios_mensajeria as
		SELECT
            usm_usuario as usuario,
            usm_mensajeria as mensajeria
        FROM usuarios_mensajeria
        WHERE false; -- te devuelve el tipo de record
		
  	INSERT INTO usuarios_mensajeria (usm_usuario, usm_mensajeria)
      SELECT LOWER(j.usuario), j.mensajeria
          FROM jsonb_populate_recordset(null::json_usuarios_mensajeria, jleer) j
		   where (select true from jsonb_a_enum_t_envios(mensajeria));

    SELECT ('{"cod_error":"' || icod_error ||'"}')::jsonb || jresultado ::jsonb INTO jresultado;
	
	EXCEPTION WHEN OTHERS THEN
		SELECT excepcion from control_excepciones(SQLSTATE, SQLERRM) into jresultado;
	END;
$BODY$;

ALTER FUNCTION public.inserta_usuarios_mensajeria(jsonb)
    OWNER TO postgres;
