-- Table: public.usuarios

-- DROP TABLE IF EXISTS public.usuarios;

CREATE TABLE IF NOT EXISTS public.usuarios
(
    usu_cod integer NOT NULL DEFAULT nextval('usuarios_usu_cod_seq'::regclass),
    usu_nombre character varying(30) COLLATE pg_catalog."default" NOT NULL,
    usu_pwd character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT usuarios_pkey PRIMARY KEY (usu_cod, usu_nombre),
    CONSTRAINT usu_cod_unique UNIQUE (usu_cod)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.usuarios
    OWNER to postgres;