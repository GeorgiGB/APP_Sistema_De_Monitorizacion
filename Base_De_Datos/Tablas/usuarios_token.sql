-- Table: public.usuarios_token

-- DROP TABLE IF EXISTS public.usuarios_token;

CREATE TABLE IF NOT EXISTS public.usuarios_token
(
    ust_cod integer NOT NULL DEFAULT nextval('usuarios_token_ust_cod_seq'::regclass),
    ust_usuario integer NOT NULL DEFAULT 0,
    ust_usos integer NOT NULL DEFAULT 1,
    ust_token character varying(300) COLLATE pg_catalog."default",
    ust_activo boolean DEFAULT false,
    CONSTRAINT usuarios_token_pkey PRIMARY KEY (ust_cod, ust_usuario),
    CONSTRAINT ust_token_ukey UNIQUE (ust_token),
    CONSTRAINT fk_usuarios_token_usuarios FOREIGN KEY (ust_usuario)
        REFERENCES public.usuarios (usu_cod) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.usuarios_token
    OWNER to postgres;