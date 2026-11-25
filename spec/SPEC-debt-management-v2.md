# Spec: Gestión Integral de Deudas V2 (Cuotas, Tarjetas y Amortización) — V1

## Objective
Evolucionar el módulo de Deudas (`/deudas`) de un registro estático a un centro integral de obligaciones financieras que soporte con precisión 4 modalidades del mundo real:
1. **Tarjetas de Crédito**: Instrumentos registrados (alias/emisor, últimos 4 dígitos) que acumulan consumos/compras en 1 pago o en $N$ cuotas hasta el cierre/vencimiento.
2. **Préstamos Personales / Fintech (ej. Mercado Pago)**: Con plan de cuotas y amortización anticipada a capital (descuento de intereses no devengados).
3. **Préstamos Bancarios**: Con cuotas fijas, TNA y recargos por mora.
4. **Préstamos entre Personas**: Obligaciones directas (yo debo / me deben) con abonos libres y sin cuotas formales.

### Casos de Uso Principales
- **UC-01**: Cargar una deuda seleccionando una de las 4 modalidades con campos dinámicos y validaciones contextuales.
- **UC-02**: Seleccionar una tarjeta registrada previamente desde un combo para imputarle un nuevo consumo rápidamente sin tipear su nombre.
- **UC-03**: Ampliar o agregar un consumo a una tarjeta o deuda existente, registrando el movimiento en el historial.
- **UC-04**: Registrar un abono regular o un abono con amortización a capital, recalculando cuotas e intereses restantes.
- **UC-05**: Visualizar en móvil y escritorio el progreso de cuotas (ej. `Cuota 3/12`), badges de modalidad y auditoría de movimientos.

---

## Tech Stack
- **Framework**: Next.js 16.3.4 (App Router, Turbopack, React 19).
- **Lenguaje**: TypeScript en modo estricto.
- **Base de datos & Auth**: Supabase PostgreSQL con RLS y `@supabase/ssr`.
- **Formularios & Validaciones**: `react-hook-form` con esquemas defensivos de `zod`.
- **Estilos**: Tailwind CSS + CVA (`class-variance-authority`) sobre componentes de `src/components/ui/`.
- **Responsive**: Cumplimiento del estándar `finper-responsive-design` (mínimo 44px touch targets, `pb-24 sm:pb-8`).

---

## Commands
```bash
Build: npm run build
Dev:   npm run dev
Lint:  npm run lint
```

---

## Modelo de Datos y Migración SQL

### 1. Extensión de la tabla `debts`
```sql
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
```

### 2. Extensión de movimientos en `debt_payments`
Para soportar tanto abonos como adiciones/consumos de deuda:
```sql
ALTER TABLE public.debt_payments
  ADD COLUMN IF NOT EXISTS movement_type TEXT DEFAULT 'payment' 
    CHECK (movement_type IN ('payment', 'charge')),
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS installment_number INTEGER DEFAULT NULL;
```

---

## Project Structure
```text
src/features/debts/
├── components/
│   ├── DebtList.tsx                    → Orquestador de la vista principal
│   ├── DebtForm.tsx                    → Formulario modular por modalidad
│   ├── DebtTable.tsx                   → Tabla desktop con badges de modalidad y cuotas
│   ├── DebtMobileList.tsx              → Tarjetas móviles adaptadas a touch targets
│   ├── DebtFilterBar.tsx               → Filtros por tipo, modalidad y búsqueda
│   ├── DebtSummaryCards.tsx            → Tarjetas de balance consolidado
│   ├── DebtPaymentDialog.tsx           → Modal de abono / amortización a capital
│   ├── DebtAddChargeDialog.tsx         → Modal para sumar consumo/ampliación
│   ├── DebtPaymentHistoryDialog.tsx    → Historial de movimientos (cargos y pagos)
│   └── DebtDeleteDialog.tsx            → Modal de confirmación de eliminación
├── hooks/
│   └── useDebts.ts                     → Hooks de Supabase (CRUD + addCharge + amortización)
├── schemas/
│   └── debtSchema.ts                   → Validación Zod con discrimatedUnion por modalidad
├── types/
│   └── index.ts                        → Tipado TypeScript completo de deudas y movimientos
└── utils/
    ├── debtCalculations.ts             → Lógica de cuotas, amortización y mora
    └── debtTimelineCalculations.ts     → Lógica de análisis temporal y corte
```

---

## Validaciones Defensivas (Zod Schema)
El esquema validará con `discriminatedUnion` por `modality`:
- `credit_card`: Requiere `card_alias`, `card_bank` (ej. Santander, Galicia, BBVA, etc.), `card_brand` (Visa, Mastercard, Amex, Cabal, etc.), `card_last_digits` (opcional, 4 dígitos numéricos), `statement_closing_date` (1–31), `due_date` y `installments_total` ($\ge 1$).
- `personal_loan`: Requiere `amount` ($> 0$), `installments_total` ($\ge 1$), `due_date`, y `interest_rate` opcional ($\ge 0$).
- `bank_loan`: Requiere `amount` ($> 0$), `card_bank` o nombre del banco/entidad, `installments_total` ($\ge 1$), `due_date` y `interest_rate` ($\ge 0$).
- `simple`: Requiere `amount` ($> 0$), `description`, `type` (`payable` o `receivable`), `due_date` opcional.

---

## Code Style & Architectural Conventions
1. **Límites de Líneas**: Ningún componente debe superar las 200 líneas (SRP estricto).
2. **Cero HTML Crudo**:
   - Uso de `<FormField>`, `<Select>`, `<Input>`, `<Badge>`, `<Card>`, `<Button>` de `src/components/ui/`.
3. **Formateo Monetario**:
   - `formatCurrency()` en cada valor numérico en la UI.
4. **Fidelidad Mobile-First**:
   - Paridad total: Toda la información de cuotas, modalidad y fechas se visualiza en mobile con envoltura responsiva (`flex-wrap`).
   - Contenedor con `pb-24 sm:pb-8`.

---

## Testing Strategy
- Verificación con `npm run build` en modo estricto.
- Pruebas unitarias en `debtCalculations.ts`:
  1. Cálculo de cuota mensual: $\text{monto} / \text{cuotas}$.
  2. Amortización anticipada a capital con descuento de interés.
  3. Cálculo de mora por TNA para préstamos bancarios.
  4. Balance dinámico de tarjeta de crédito sumando consumos y restando abonos.

---

## Boundaries
- **Siempre hacer**:
  - Habilitar RLS en toda tabla o columna de Supabase.
  - Asegurar que el usuario solo acceda a sus propias deudas (`auth.uid() = user_id`).
  - Proteger inputs de dinero con `AnimatedAmountInput`.
- **Preguntar primero**:
  - Agregar dependencias npm adicionales.
- **Nunca hacer**:
  - Guardar números reales de tarjetas de crédito o CVV (solo alias descriptivo y últimos 4 dígitos opcionales).
  - Romper compatibilidad con las deudas existentes (usar valores por defecto seguros en SQL y TS).

---

## Success Criteria
1. Migración SQL aplicada y compatible con deudas existentes.
2. Formulario de creación permite elegir las 4 modalidades con inputs contextuales y selector de tarjetas previas.
3. Posibilidad de abrir una deuda y sumar un consumo/ampliación que impacte en su balance.
4. Historial de movimientos muestra tanto cargos como pagos con fecha y descripción.
5. Listado desktop y mobile muestra el estado de cuotas (`Cuota X/Y`) y badges visuales.
6. Cero errores de TypeScript y `npm run build` exitoso.

---

## Out of Scope (Deferred V2)
- Cotización y conversión a dólares en tiempo real (mantenido para la siguiente feature).
- Scraping automático de resúmenes bancarios.
