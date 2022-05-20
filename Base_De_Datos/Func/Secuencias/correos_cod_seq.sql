-- SEQUENCE: public.correos_cod_seq

-- DROP SEQUENCE IF EXISTS public.correos_cod_seq;

CREATE SEQUENCE IF NOT EXISTS public.correos_cod_seq
    INCREMENT 1
    START 0
    MINVALUE -1
    MAXVALUE 100000000000004
    CACHE 1;

ALTER SEQUENCE public.correos_cod_seq
    OWNER TO postgres;