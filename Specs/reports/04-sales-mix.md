# Spec Atómico: 04-sales-mix (Análisis de Mix de Ventas y Margen Ponderado)

## 1. Visión General & Alcance
* **Objetivo:** Crear una sección de análisis profundo (dentro de Reportes o como sección independiente) que evalúe la "salud real" del menú basada en lo que *realmente* se vende.
* **Contexto Financiero:** No sirve de nada tener un producto con un margen del 80% si solo representa el 1% de tus ventas. El "Mix de Ventas" calcula qué porcentaje de los ingresos totales aporta cada producto, y pondera ese peso contra su margen de rentabilidad para descubrir el **Margen Blended (Ponderado) Global** de la cafetería.

## 2. Lógica y Fórmulas del Mix de Ventas

Para un periodo de tiempo determinado (ej. Mes actual):
1. **Ventas Totales del Negocio:** Suma de todas las ventas de la cafetería.
2. **Ventas del Producto X:** Dinero total que ingresó *solo* por vender el Producto X.
3. **Participación de Venta (Mix %):** `(Ventas del Producto X / Ventas Totales del Negocio) * 100`.
   *(La suma de todas las participaciones de todos los productos debe dar el 100%).*
4. **Margen Bruto del Producto X (%):** `((Precio Venta - Costo) / Precio Venta) * 100`. (Este ya lo tenemos en el catálogo de precios).
5. **Aporte al Margen Global (Margen Ponderado):** `Participación de Venta % * Margen Bruto del Producto X %`.

**El Margen Global del Negocio** será la suma de todos los "Aportes al Margen Global".

## 3. Propuesta de Arquitectura e Interfaz (UI/UX)

### Ruta Sugerida
`/reportes/mix-ventas` o integrado como una pestaña dentro de `/reportes`. 
Dado el nivel de análisis, sugiero crearle su propia página dentro de los reportes (`/reportes/mix-ventas`) con un acceso desde el Dashboard principal o desde el menú de Reportes.

### Componentes Clave de la Interfaz
1. **Filtro de Fechas:** Heredado o idéntico al de reportes (Hoy, Este Mes, Año).
2. **Kpis Globales (Tarjetas Superiores):**
   * Total Ventas (del periodo)
   * Margen Ponderado Global (El resumen definitivo de rentabilidad).
   * Producto Estrella (El que más aporta al margen global).
3. **Tabla de Mix de Ventas:**
   * **Producto** (Nombre)
   * **Unidades Vendidas**
   * **Ventas Totales ($)**
   * **Participación (Mix %)** -> Barra visual de progreso (ej. 45% 🟩).
   * **Margen del Producto (%)**
   * **Aporte al Margen Global (%)** -> Lo que suma al negocio.

## 4. Plan de Ejecución (DoD)
* [ ] Crear una query en `reports-actions.ts` o un nuevo archivo `sales-mix-actions.ts` que agregue la tabla `DetallePedido` unida a `Pedido` (filtrando solo pedidos `PAGADO`).
* [ ] Realizar los cálculos matemáticos descritos (Participación, Margen Bruto histórico, Aporte).
* [ ] Crear los componentes UI para la tabla y las tarjetas de KPI.
* [ ] Crear la página `/reportes/mix-ventas` y agregar su acceso en la Landing Page.
