-- 1. Crear la tabla de Ingresos
CREATE TABLE IF NOT EXISTS public.incomes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (Muy importante para la privacidad)
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Seguridad (Los usuarios solo ven y modifican sus propios ingresos)
CREATE POLICY "Users can manage their own incomes" 
ON public.incomes 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Crear un índice para búsquedas más rápidas (Opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON public.incomes(user_id);
