-- Migración: Gestión Integral de Deudas V2
-- Añade soporte para 4 modalidades de deuda (tarjetas de crédito, préstamos personales, bancarios, simples),
-- metadatos de tarjeta (banco, marca, últimos 4 dígitos) y ampliaciones/cargos en movimientos.

-- 1. Extensión de la tabla `debts`
ALTER TABLE public.debts 
  ADD COLUMN IF NOT EXISTS modality TEXT DEFAULT 'simple' 
    CHECK (modality IN ('credit_card', 'personal_loan', 'bank_loan', 'simple')),
  ADD COLUMN IF NOT EXISTS card_alias TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS card_bank TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS card_brand TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS card_last_digits TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS statement_closing_date INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS installments_total INTEGER DEFAULT 1 CHECK (installments_total >= 1),
  ADD COLUMN IF NOT EXISTS installments_paid INTEGER DEFAULT 0 CHECK (installments_paid >= 0),
  ADD COLUMN IF NOT EXISTS allows_capital_amortization BOOLEAN DEFAULT FALSE;

-- Comentarios explicativos
COMMENT ON COLUMN public.debts.modality IS 'Modalidad: credit_card, personal_loan, bank_loan, simple';
COMMENT ON COLUMN public.debts.card_brand IS 'Marca/Red de la tarjeta: Visa, Mastercard, American Express, Cabal, etc.';
COMMENT ON COLUMN public.debts.card_bank IS 'Banco o entidad emisora de la tarjeta o préstamo';
COMMENT ON COLUMN public.debts.installments_total IS 'Cantidad total de cuotas pactadas';
COMMENT ON COLUMN public.debts.installments_paid IS 'Cantidad de cuotas ya saldadas';
COMMENT ON COLUMN public.debts.allows_capital_amortization IS 'Indica si adelantar cuotas descuenta intereses';

-- 2. Extensión de la tabla `debt_payments` para registrar movimientos completos (abonos y cargos/aumentos)
ALTER TABLE public.debt_payments
  ADD COLUMN IF NOT EXISTS movement_type TEXT DEFAULT 'payment' 
    CHECK (movement_type IN ('payment', 'charge')),
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS installment_number INTEGER DEFAULT NULL;

COMMENT ON COLUMN public.debt_payments.movement_type IS 'Tipo de movimiento: payment (abono/descuento) o charge (consumo/aumento de deuda)';
COMMENT ON COLUMN public.debt_payments.installment_number IS 'Número de cuota específica imputada (ej. 1, 2, 3...)';

-- 3. Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_debts_modality ON public.debts(modality);
CREATE INDEX IF NOT EXISTS idx_debt_payments_movement_type ON public.debt_payments(movement_type);
