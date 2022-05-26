-- Type: t_envios

-- DROP TYPE IF EXISTS public.t_envios;

CREATE TYPE public.t_envios AS ENUM
    ('email', 'telegram');

ALTER TYPE public.t_envios
    OWNER TO postgres;