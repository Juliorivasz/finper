-- Migración Inicial Completa: Esquema de Base de Datos para Finper

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- TABLA: profiles (Opcional, para datos extra del usuario)
-- ==========================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- TABLA: categories (Categorías para gastos)
-- ==========================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Si es null, es categoría global por defecto
    name TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- TABLA: expenses (Gastos)
-- ==========================================
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- TABLA: debts (Deudas)
-- ==========================================
CREATE TABLE public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_name TEXT NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- TABLA: debt_payments (Historial de pagos de deudas)
-- ==========================================
-- Permite registrar cada vez que haces un abono a una deuda
CREATE TABLE public.debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- SEGURIDAD (Row Level Security - RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- Políticas temporales para poder desarrollar sin Auth al inicio.
-- IMPORTANTE: Cambia "true" a "auth.uid() = user_id" cuando integres el login.
CREATE POLICY "Acceso temporal global profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Acceso temporal global categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Acceso temporal global expenses" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Acceso temporal global debts" ON public.debts FOR ALL USING (true);
CREATE POLICY "Acceso temporal global debt_payments" ON public.debt_payments FOR ALL USING (true);

-- Insertar algunas categorías base (globales, sin user_id)
INSERT INTO public.categories (name, color, icon) VALUES 
('Comida', '#171717', 'Utensils'),
('Transporte', '#52525B', 'Car'),
('Vivienda', '#3F3F46', 'Home'),
('Servicios', '#71717A', 'Zap'),
('Entretenimiento', '#A1A1AA', 'Tv'),
('Salud', '#27272A', 'Heart');
