# Statement of Intent: Análisis Temporal y Filtros Avanzados para Gráficos de Deudas

- **Outcome**: Extender la pantalla de análisis de deudas (`/deudas/charts`) incorporando:
  1. Filtros por estado: Todas, solo pendientes, solo saldadas (pagadas).
  2. Filtro temporal doble: Rango de fechas (para acotar la visualización) y selector de fecha de corte acumulada ("foto histórica").
  3. Desglose porcentual detallado de amortización (% pagado vs % pendiente) con montos exactos y barra de progreso.
  4. Gráfico de evolución temporal interactivo que permite hacer clic en cualquier fecha para fijar la fecha de corte.
- **User**: Usuario de Finper, para auditar su proceso de desendeudamiento y conocer el estado consolidado de su deuda en cualquier momento histórico.
- **Why now**: Los gráficos actuales de deudas presentan una visión estática del presente sin dimensión temporal ni desglose porcentual detallado.
- **Success**: Al cambiar la fecha de corte o hacer clic en el gráfico de evolución, todos los KPIs y gráficos recalculan la suma acumulada histórica de deudas y abonos a esa fecha con precisión reactiva.
- **Constraint**: Cálculos deterministas 100% en cliente a partir de `debts` y `debt_payments` (`created_at` para origen de la deuda y fecha de abono para pagos), respetando Clean Architecture (< 200 líneas por componente) y CVA en `src/components/ui/` sin alterar la base de datos de Supabase.
- **Out of scope**: Modificaciones en el esquema SQL de Supabase, endpoints de backend o alteración del listado general en `/deudas`.
