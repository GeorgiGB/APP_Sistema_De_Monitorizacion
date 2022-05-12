-- Table: public.acciones

-- DROP TABLE IF EXISTS public.acciones;

CREATE TABLE IF NOT EXISTS public.acciones
(
    cod integer NOT NULL DEFAULT nextval('acciones_cod_seq'::regclass),
    coperaciones character varying(35) COLLATE pg_catalog."default",
    CONSTRAINT acciones_pkey PRIMARY KEY (cod)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.acciones
    OWNER to postgres;