-- FUNCTION: public.jsonb_a_enum_t_envios(jsonb)

-- DROP FUNCTION IF EXISTS public.jsonb_a_enum_t_envios(jsonb);

CREATE OR REPLACE FUNCTION public.jsonb_a_enum_t_envios(
	jsonb)
    RETURNS t_envios[]
    LANGUAGE 'sql'
    COST 100
    IMMUTABLE PARALLEL UNSAFE
AS $BODY$
-- comprobamos si las llaves pasadas se corresponden con el enum t_envios
-- si no se corresponde lanzará un error
    select array_agg(key)::t_envios[]
    from jsonb_each_text($1)
    --where value::bool
$BODY$;

ALTER FUNCTION public.jsonb_a_enum_t_envios(jsonb)
    OWNER TO postgres;