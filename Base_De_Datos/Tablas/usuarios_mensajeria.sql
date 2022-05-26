-- Table: public.usuarios_mensajeria

-- DROP TABLE IF EXISTS public.usuarios_mensajeria;

CREATE TABLE IF NOT EXISTS public.usuarios_mensajeria
(
    usm_cod integer NOT NULL DEFAULT nextval('usuarios_mensajeria_usm_cod_seq'::regclass),
    usm_usuario character varying COLLATE pg_catalog."default" NOT NULL,
    usm_mensajeria jsonb NOT NULL,
    CONSTRAINT usuarios_mensajeria_pkey PRIMARY KEY (usm_cod),
    CONSTRAINT uk_usm_usuario UNIQUE (usm_usuario)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.usuarios_mensajeria
    OWNER to postgres;