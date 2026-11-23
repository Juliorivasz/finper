# Spec: Análisis Temporal y Filtros Avanzados para Gráficos de Deudas — V1

## Objective
Proporcionar a los usuarios de Finper una capacidad analítica avanzada en `/deudas/charts` que permita auditar la evolución de sus deudas a lo largo del tiempo.
Los usuarios podrán:
1. Filtrar deudas por estado de liquidación: todas, solo activas/pendientes, o solo saldadas/pagadas.
2. Definir un rango de fechas para acotar el análisis evolutivo.
3. Seleccionar una fecha de corte ("foto histórica acumulada") mediante un selector de fecha o haciendo clic directamente en el gráfico de evolución temporal.
4. Visualizar un desglose porcentual detallado de amortización (% pagado vs % pendiente) junto a montos monetarios formateados y barras de progreso visuales.

## Tech Stack
- **Framework**: Next.js 16.3.4 con App Router (React 19, TypeScript estricto).
- **Estilos**: Tailwind CSS con componentes semánticos y CVA (`class-variance-authority`).
- **Visualización**: Recharts para gráficos de área/línea, barras y dona.
- **Acceso a datos**: TanStack React Query (`useGetDebts`).
- **Utilidades**: `formatCurrency`, `parseLocalDate` de `@/lib/utils`.

## Commands
```bash
Build: npm run build
Dev:   npm run dev
Lint:  npm run lint
```

## Project Structure
```text
src/features/debts/
├── components/
│   ├── AdvancedDebtCharts.tsx          → Orquestador principal (< 150 líneas)
│   ├── DebtChartsFilterBar.tsx         → Barra de filtros (tipo, estado, rango, fecha corte)
│   ├── DebtBalanceMetricsCard.tsx      → KPIs con % amortizado, saldo pendiente y barra de progreso
│   ├── DebtEvolutionChart.tsx          → Gráfico de área/línea temporal interactivo
│   ├── DebtEntityBarChart.tsx          → Gráfico de barras por entidad/persona
│   └── DebtLiquidationDonutChart.tsx   → Donut chart de proporción liquidada vs pendiente
└── utils/
    └── debtTimelineCalculations.ts     → Lógica de dominio pura y determinista
```

## Code Style & Architectural Conventions
1. **Clean Architecture (3 Capas)**:
   - **Dominio**: `debtTimelineCalculations.ts` es TypeScript puro, sin dependencias de React ni hooks.
   - **Presentación**: Subcomponentes modulares (< 200 líneas), desacoplados del orquestador.
2. **Design System & Anti-HTML Crudo**:
   - Uso obligatorio de `src/components/ui/` (`Card`, `Select`, `Badge`, `Button`, `Input`, `Label`).
   - Sin clases Tailwind arbitrarias fuera de los tokens semánticos (`text-foreground`, `bg-card`, `border-border`, etc.).
3. **Formateo Monetario**:
   - Todo monto visible utiliza `formatCurrency()` de `@/lib/utils`.

### Ejemplo de Implementación (Dominio Puro):
```typescript
export interface DebtSnapshot {
  totalOriginal: number;
  totalPaid: number;
  totalPending: number;
  paidPercentage: number;
  pendingPercentage: number;
  filteredDebts: Array<Debt & { paidAtCutoff: number; pendingAtCutoff: number }>;
}

export function calculateDebtSnapshotAtDate(
  debts: Debt[],
  cutoffDate: Date,
  typeFilter: "all" | "payable" | "receivable",
  statusFilter: "all" | "pending" | "paid"
): DebtSnapshot {
  // Lógica determinista pura basada en created_at y payment.date
}
```

## Testing Strategy
- Pruebas manuales y verificación exhaustiva mediante `npm run build`.
- Pruebas unitarias de las funciones de cálculo deterministas en `debtTimelineCalculations.ts`:
  1. Caso deuda sin pagos.
  2. Caso deuda parcialmente pagada antes y después de la fecha de corte.
  3. Caso deuda completamente saldada antes de la fecha de corte.
  4. Caso deuda originada con posterioridad a la fecha de corte (debe excluirse).
  5. Cálculo exacto de porcentajes con redondeo a 1 decimal y protección contra división por cero.

## Boundaries
- **Siempre hacer**:
  - Respetar la regla de que cada archivo de componente tenga menos de 200 líneas.
  - Verificar la compilación con `npm run build` con 0 errores.
  - Asegurar accesibilidad (labels, contrastes y teclado).
- **Preguntar primero**:
  - Modificar llamadas o hooks de Supabase.
  - Instalar nuevas librerías de terceros (se utiliza Recharts ya instalado).
- **Nunca hacer**:
  - Insertar consultas directas a Supabase dentro de los componentes visuales.
  - Escribir HTML crudo (`<select>`, `<label>`, `<input>`) con strings de Tailwind repetitivas.
  - Alterar la lógica existente del listado principal `/deudas`.

## Success Criteria
1. Selector de fecha de corte acumulada funcional con botón rápido "Hoy".
2. Al seleccionar una fecha histórica, la suma de deudas contraídas $\le$ esa fecha y abonos $\le$ esa fecha se calcula y refleja en los KPIs en tiempo real.
3. Métricas de % pagado y % pendiente con barra visual de progreso proporcional.
4. Gráfico de evolución temporal con puntos clicables que actualizan la fecha de corte.
5. Filtro por estado funcional: "Todas", "Solo pendientes", "Solo saldadas".
6. Cero errores de TypeScript y compilación de producción exitosa.

## Out of Scope (Deferred V2)
- Filtro por moneda múltiple (dólares / pesos) — diferido a V2 cuando se soporte multimoneda global.
- Simulación predictiva o proyección de cuotas futuras — diferido a V2.
- Exportación a PDF/Excel de los gráficos — diferido a V2.

## Open Questions
- Ninguna pregunta abierta tras la sesión de `/interview-me`.
