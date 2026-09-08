# Plan de Implementación: 02-Daily-Closure-Dashboard (Reporte Financiero y Cierres)

El objetivo de este módulo es proporcionar al administrador una visión financiera clara de la operación. A partir de las órdenes registradas en el POS, el sistema calculará cuánto se vendió, cuánto costó producirlo y la ganancia real.

## Mejoras Funcionales y de Experiencia (Propuestas)

Además de tus **filtros de fechas**, he analizado el Spec y propongo agregar las siguientes mejoras operativas invaluables para una cafetería:

1. **Filtro de Rangos de Fecha:** Implementaremos un selector de fecha de inicio y fin, junto con botones rápidos ("Hoy", "Ayer", "Últimos 7 días", "Este Mes").
2. **Top Productos Más Vendidos:** Una pequeña tabla que agrupe y cuente qué productos se vendieron más en ese rango de tiempo. Es vital para saber qué insumos reabastecer.
3. **Métrica de Margen Promedio (%):** Además del dinero en efectivo, mostrar el porcentaje de rentabilidad global del rango de tiempo `(Ganancia Neta / Ventas) * 100`.
4. **Alineación con los Nuevos Estados:** Solo sumaremos a las "Ventas" y "Ganancias" los pedidos en estado `PAGADO`. Crearemos un pequeño indicador separado para el dinero "Pendiente de Cobro" (pedidos Activos/Despachados).

## Propuesta de Cambios (Proposed Changes)

---

### Capa de Lógica y Base de Datos

#### [NEW] src/features/reports/actions/get-closure.ts
- Server Action `getFinancialMetrics(startDate, endDate)`:
  - Consultar los pedidos (`PAGADO`, `ACTIVO`, `DESPACHADO`) dentro del rango de tiempo.
  - Retornar las sumatorias de:
    - **Ventas Totales** (Solo `PAGADO`).
    - **Costo Total de Producción** (Solo `PAGADO`).
    - **Ganancia Neta** (Solo `PAGADO`).
    - **Dinero Pendiente** (Suma de `ACTIVO` y `DESPACHADO`).
  - Agrupar los `detalles` para contar la cantidad vendida de cada producto y generar el ranking del Top 5.

---

### Capa de Presentación (UI)

#### [NEW] src/features/reports/components/DateRangeFilter.tsx
- Un componente interactivo de calendario (o selects nativos de fecha `type="date"`) para elegir Rango Desde/Hasta y botones rápidos.

#### [NEW] src/features/reports/components/MetricsCards.tsx
- Tarjetas visuales grandes para:
  - Ingresos Totales (Verde)
  - Costo de Producción (Rojo/Naranja)
  - Ganancia Neta (Verde Oscuro)
  - Margen Promedio (%) (Badge)

#### [NEW] src/features/reports/components/BestSellersTable.tsx
- Tabla o lista sencilla mostrando: `Producto | Cantidad Vendida | Ingreso Generado`.

#### [NEW] src/app/reportes/page.tsx
- La página principal del Dashboard (`/reportes` o `/cierre`). Ensambla los filtros, las tarjetas, la tabla de productos más vendidos y un listado opcional de los tickets/órdenes de ese periodo.

## Plan de Verificación
- Simular un filtro del día de "Hoy" y comprobar que coincida matemáticamente con las órdenes que se despacharon y pagaron desde el POS.
- Ejecutar compilación de Next.js (`npm run build`) para verificar la seguridad de tipos.
