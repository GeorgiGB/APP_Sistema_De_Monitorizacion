-- Table: public.mensajes_no_enviados

-- DROP TABLE IF EXISTS public.mensajes_no_enviados;

CREATE TABLE IF NOT EXISTS public.mensajes_no_enviados
(
    men_cod integer NOT NULL DEFAULT nextval('mensajes_no_enviados_men_cod_seq'::regclass),
    men_usm_cod integer NOT NULL,
    men_log_cod integer NOT NULL,
    men_sin_enviar t_envios[],
    CONSTRAINT mensajes_no_enviados_pkey PRIMARY KEY (men_cod),
    CONSTRAINT fk_mensajes_no_enviados_logs FOREIGN KEY (men_log_cod)
        REFERENCES public.logs (lg_cod) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_mensajes_no_enviados_usuarios_mensajeria FOREIGN KEY (men_usm_cod)
        REFERENCES public.usuarios_mensajeria (usm_cod) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mensajes_no_enviados
    OWNER to postgres;