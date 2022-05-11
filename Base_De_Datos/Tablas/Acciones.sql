-- Table: public.Acciones

-- DROP TABLE IF EXISTS public."Acciones";

CREATE TABLE IF NOT EXISTS public."Acciones"
(
    "cOperaciones" character varying(35) COLLATE pg_catalog."default",
    cod integer NOT NULL,
    CONSTRAINT "Acciones_pkey" PRIMARY KEY (cod)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Acciones"
    OWNER to postgres;