# Spec Atómico: 03-expenses-purchases (Gestión de Gastos y Compras de Inventario)

## 1. Visión General & Alcance
* **Objetivo:** Crear un módulo integral para registrar las salidas de dinero de la cafetería. Permitirá registrar compras de inventario (que automáticamente sumarán stock y actualizarán costos) y registrar gastos operativos (servicios, nómina, arriendo) para obtener una contabilidad neta real.
* **Aclaración sobre Descuento de Stock:** El descuento de inventario a medida que se preparan los cafés **ya está 100% implementado y funcionando en tiempo real** gracias al POS (transacción `createOrderTransaction`). Este nuevo módulo resuelve la otra cara de la moneda: **el ingreso de stock al comprar**.

---

## 2. Propuesta de Arquitectura de Medidas (El "Cuadre")
Actualmente, el modelo de `Insumo` tiene una medida "grande" de compra (`unidadCompra`, ej. "Bolsa de 1 Kg") y un rendimiento en medida "pequeña" de receta (`rendimientoUnidad`, ej. "1000" para gramos).

**La solución más limpia y a prueba de errores para el Barista/Administrador es la siguiente:**
1. Al registrar una "Compra de Insumo", el formulario te preguntará la **Cantidad Comprada** basada en tu `unidadCompra` (Ej. "¿Cuántas Bolsas de 1 Kg compraste?"). Si ingresas "2", el sistema matemáticamente sabrá que debe sumar `2 * 1000 = 2000 gramos` a tu inventario.
2. El formulario te preguntará el **Costo Total** de esa compra. Si hubo inflación y el café subió de precio, el sistema te preguntará si quieres actualizar el precio oficial del catálogo de insumos. Si dices que sí, **toda la cascada de costos y márgenes de tus recetas se actualizará automáticamente** gracias al motor que construimos en el Spec 03.

---

## 3. Contratos de Datos & Esquemas

### Modelo de Base de Datos (Prisma)
Se agregará una nueva tabla para centralizar la salida de dinero:

```prisma
enum TipoGasto {
  COMPRA_INSUMO
  OPERATIVO
}

model Gasto {
  id               String    @id @default(uuid())
  tipo             TipoGasto @map("tipo_gasto")
  descripcion      String    @db.VarChar(200)       // Ej. "Compra de Leche Colanta" o "Pago de Luz"
  montoTotal       Decimal   @map("monto_total") @db.Decimal(12, 2)
  fechaHora        DateTime  @default(now()) @map("fecha_hora") @db.Timestamptz
  
  // Campos exclusivos para COMPRA_INSUMO
  insumoId         String?   @map("insumo_id")
  insumo           Insumo?   @relation(fields: [insumoId], references: [id])
  cantidadComprada Decimal?  @map("cantidad_comprada") @db.Decimal(10, 2) // En unidadCompra (ej. 2 Bolsas)

  @@index([fechaHora])
  @@map("gastos")
}
```
*(Nota: Es necesario agregar `gastos Gasto[]` en el modelo `Insumo`).*

---

## 4. Reglas de Negocio & UI/UX

### Interfaz del Módulo (`/gastos`)
* **Listado de Gastos:** Una tabla cronológica que muestre los últimos gastos registrados, diferenciando visualmente (por iconos o colores) si es una "Compra de Insumo" o un "Gasto Operativo". Mostrará un totalizado del dinero gastado en el mes actual.

### Creación de un Gasto (El Pop-up o Formulario)
El usuario elegirá qué tipo de gasto desea registrar a través de dos pestañas o botones:

#### Opción A: "Ingresar Compra de Insumo"
1. **Selector de Insumo:** Un menú desplegable (Dropdown) con todos los insumos existentes (ej. "Café Origen", "Leche Deslactosada").
2. **Cantidad:** Input numérico. El label debe ser dinámico: "Cantidad comprada (*Bolsas de 1 Kg*)" basado en la `unidadCompra` del insumo seleccionado.
3. **Monto Pagado:** Cuánto costó en total esta compra.
4. **Checkbox Opcional:** "Actualizar costo unitario del insumo con este nuevo precio".
5. **Comportamiento en BD:** Al guardar, se crea el `Gasto` y en una misma transacción (`prisma.$transaction`) se le hace un `update` al `Insumo` sumando a su `cantidadDisponible` la fórmula `(cantidadComprada * rendimientoUnidad)`.

#### Opción B: "Registrar Gasto Operativo"
1. **Descripción:** Texto libre (ej. "Pago de arriendo Septiembre", "Papelería", "Nómina").
2. **Monto:** Dinero exacto que salió de la caja.
3. **Comportamiento en BD:** Solo crea el registro del `Gasto` para fines contables. No toca inventario.

---

## 5. Plan de Ejecución Atómico

* [ ] **Paso 1:** Actualizar `schema.prisma` agregando el modelo `Gasto` y el enum `TipoGasto`. Ejecutar migración.
* [ ] **Paso 2:** Crear esquema de validación Zod en `src/features/expenses/schemas/expense.ts`.
* [ ] **Paso 3:** Crear Server Actions (`createExpenseTransaction`, `getExpenses`). La transacción de ingreso de insumos será el paso más delicado para blindar el inventario.
* [ ] **Paso 4:** Desarrollar los componentes de interfaz: `ExpenseListTable.tsx`, `ExpenseTypeSelector.tsx`, `InsumoPurchaseForm.tsx`, `OperativeExpenseForm.tsx`.
* [ ] **Paso 5:** Ensamblar la página `/gastos` e integrarla como una nueva tarjeta en el Launchpad Principal (`/`).
* [ ] **Paso 6:** Impactar el dashboard de "Reportes y Cierres" (`/reportes`) para que el dinero gastado se reste opcionalmente de la Ganancia Neta o se muestre en una tarjeta nueva de "Gastos Totales".

---

## 6. Definición de Hecho (DoD)
* [ ] Registrar una compra de 2 unidades de un insumo suma correctamente `2 * rendimiento` a la base de datos en tiempo real.
* [ ] La compra de insumos se refleja como un gasto en la tabla.
* [ ] TypeScript no marca errores (`npm run build` exitoso).
