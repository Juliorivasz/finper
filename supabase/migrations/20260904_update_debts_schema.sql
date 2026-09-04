-- 20260904_update_debts_schema.sql

-- 1. Renombrar columnas para coincidir con la UI moderna
ALTER TABLE public.debts RENAME COLUMN total_amount TO amount;
ALTER TABLE public.debts RENAME COLUMN entity_name TO description;

-- 2. Eliminar columna redundante (lo calculamos sumando los abonos dinámicamente)
ALTER TABLE public.debts DROP COLUMN paid_amount;

-- 3. Añadir el tipo de deuda (Por pagar vs Por cobrar)
ALTER TABLE public.debts ADD COLUMN type TEXT DEFAULT 'payable' CHECK (type IN ('payable', 'receivable'));

-- 4. Hacer que la fecha de pago sea opcional
ALTER TABLE public.debts ALTER COLUMN due_date DROP NOT NULL;

-- 5. Actualizar el constraint de estado a minúsculas para coincidir con JS
ALTER TABLE public.debts DROP CONSTRAINT debts_status_check;
ALTER TABLE public.debts ALTER COLUMN status SET DEFAULT 'pending';
UPDATE public.debts SET status = 'pending' WHERE status = 'PENDING';
UPDATE public.debts SET status = 'paid' WHERE status = 'PAID';
ALTER TABLE public.debts ADD CONSTRAINT debts_status_check CHECK (status IN ('pending', 'paid'));

-- 6. Actualizar la tabla de abonos para coincidir con los nombres en JS
ALTER TABLE public.debt_payments RENAME COLUMN payment_date TO date;
