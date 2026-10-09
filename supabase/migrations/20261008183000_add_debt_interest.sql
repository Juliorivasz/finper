-- Migración para agregar la columna de interés por mora a las deudas
-- Tabla: debts
-- Campo: interest_rate (TNA %)

ALTER TABLE public.debts 
ADD COLUMN interest_rate DECIMAL(6,2) DEFAULT NULL;

COMMENT ON COLUMN public.debts.interest_rate IS 'Tasa Nominal Anual (TNA) en porcentaje para calcular interés moratorio dinámico';
