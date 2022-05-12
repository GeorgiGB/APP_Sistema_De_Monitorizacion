CREATE SEQUENCE IF NOT EXISTS public.acciones_cod_seq
    INCREMENT 1
    START 0
    MINVALUE -1
    MAXVALUE 100000000000004
    CACHE 1;

ALTER SEQUENCE public.acciones_cod_seq
    OWNER TO postgres;