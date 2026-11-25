# Statement of Intent: Gestión Integral de Deudas V2 (Cuotas, Tarjetas y Amortización)

- **Outcome**: Rediseñar y extender el módulo de Deudas (`/deudas`) para soportar nativamente 4 modalidades financieras:
  1. **Tarjetas de Crédito**: Instrumentos con identificador rápido (alias, emisor, últimos 4 dígitos) que acumulan consumos/compras periódicas en 1 pago o en $N$ cuotas hasta la fecha de cierre/vencimiento.
  2. **Préstamos Personales / Fintech (ej. Mercado Pago)**: Con plan de cuotas y lógica de amortización anticipada a capital con descuento de intereses no devengados.
  3. **Préstamos Bancarios**: Con cuotas pactadas, tasa TNA fija y cálculo de mora.
  4. **Préstamos entre Personas**: Compromisos informales (yo debo / me deben) con abonos libres y sin cuotas forzadas.
  - **Capacidades funcionales**:
    - Historial de movimientos unificado por deuda: registro tanto de incrementos/compras de capital como de abonos/liquidaciones.
    - Avance visual de cuotas (ej. `Cuota 3 de 12`).
    - Validaciones defensivas y robustas en Zod.
    - Rediseño mobile-first y desktop bajo los estándares de `finper-responsive-design` (touch targets de 44px, `pb-24 sm:pb-8`, paridad total de datos).
- **User**: Usuario de Finper, para gestionar todas sus obligaciones financieras en un solo centro de control sin perder la identidad de cómo opera cada instrumento en la realidad.
- **Why now**: El formulario y modelo actual es plano y homogéneo; no maneja cuotas, no permite cargar compras periódicas sobre una tarjeta de crédito, ni distingue un préstamo con amortización de un préstamo a un amigo.
- **Success**: El usuario puede crear o seleccionar tarjetas guardadas, agregar consumos en cuotas, ver el avance de cuotas canceladas vs pendientes, registrar abonos con o sin amortización a capital, y auditar el historial de aumentos y pagos con 0 errores de TypeScript y compilación de producción impecable.
- **Constraint**: Cumplir con Clean Architecture (< 200 líneas por componente), validaciones Zod defensivas, cero HTML crudo (primitivas CVA) y los estándares de `finper-responsive-design`.
- **Out of scope**: Manejo de dólares y cotizaciones en tiempo real (mantenido explícitamente para una feature posterior), y scraping/conexión directa bancaria.
