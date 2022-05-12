-- Table: public.logs

-- DROP TABLE IF EXISTS public.logs;

CREATE TABLE IF NOT EXISTS public.logs
(
    cod integer NOT NULL DEFAULT nextval('logs_cod_seq'::regclass),
    berror boolean,
    CONSTRAINT logs_pkey PRIMARY KEY (cod)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.logs
    OWNER to postgres;