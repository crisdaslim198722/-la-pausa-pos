# Spec Atómico: Cierre de Caja y Métricas Diarias

## 1. Objetivo y Alcance
- **Objetivo:** Mostrar la liquidación financiera del día seleccionando la fecha actual.
- **Fuera de alcance:** Restar gastos operativos (luz, arriendo); estos se manejan exclusivamente en el reporte mensual.

## 2. Fórmulas Financieras Diarias
- **Ventas Totales del Día:** $\sum \text{Pedido.totalVenta}$ (donde `estado == 'ACTIVO'`).
- **Costo de Producción Vendido:** $\sum \text{Pedido.costoTotalPedido}$.
- **Ganancia Neta Operativa del Día:** $\text{Ventas Totales} - \text{Costo de Producción}$.

## 3. Plan de Ejecución
- [ ] **Paso 1:** Crear Server Action `getDailyClosureSummary(date)` que consulte las órdenes del día.
- [ ] **Paso 2:** Diseñar Dashboard con 3 tarjetas de métricas principales (Ventas, Costos, Ganancia) y la lista de pedidos realizados.

## 4. Definición de Hecho (DoD)
- [ ] Las órdenes con estado `CANCELADO` son excluidas de las métricas acumuladas.
- [ ] `npx tsc --noEmit` pasa sin errores.