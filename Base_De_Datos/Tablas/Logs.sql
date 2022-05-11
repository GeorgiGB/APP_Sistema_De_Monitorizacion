-- Table: public.Logs

-- DROP TABLE IF EXISTS public."Logs";

CREATE TABLE IF NOT EXISTS public."Logs"
(
    "bError" boolean,
    cod integer NOT NULL,
    CONSTRAINT "Logs_pkey" PRIMARY KEY (cod)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Logs"
    OWNER to postgres;