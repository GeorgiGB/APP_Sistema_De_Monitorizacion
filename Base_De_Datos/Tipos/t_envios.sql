-- Type: t_envios

-- DROP TYPE IF EXISTS public.t_envios;

CREATE TYPE public.t_envios AS ENUM
    ('correo_e', 'telegram');

ALTER TYPE public.t_envios
    OWNER TO postgres;