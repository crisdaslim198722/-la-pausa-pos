# Spec Atómico: 03-pricing-margins (Definición de Precios de Venta y Márgenes)[cite: 12]

## 1. Visión General & Alcance
* **Objetivo:** Implementar un espacio independiente e interactivo para administrar la política de precios de la cafetería mediante 3 acciones principales: **Listar** (catálogo con costos y márgenes), **Crear** (asignación inicial de precio con visualización de costos de producción) y **Editar** (ajuste de precio de venta)[cite: 12].
* **Invariante Crítica:** La asignación o modificación del `precioVentaActual` de un producto solo aplica para futuras transacciones. **JAMÁS afectará los pedidos ya realizados**, respetando la inmutabilidad de `precioVentaHistorico` guardado en los snapshots de órdenes previas[cite: 8, 12].
* **Fuera de alcance:**
  * Modificación de recetas o de costos de producción de los insumos (manejado en `02-recipe-builder`)[cite: 6, 7].
  * Toma de pedidos desde esta pantalla (manejado en el módulo POS)[cite: 12].
  * Configuración de descuentos temporales o impuestos complejos[cite: 12].

---

## 2. Contratos de Datos & Esquemas

### Esquema de Validación (Zod)
```typescript
// src/features/inventory/schemas/pricing.ts
import { z } from 'zod';

export const SetPrecioVentaSchema = z.object({
  productoId: z.string().uuid("Identificador de producto inválido"),
  precioVentaActual: z
    .number({ invalid_type_error: "Ingrese un precio de venta válido" })
    .gt(0, "El precio de venta debe ser mayor a 0"),
});

export type SetPrecioVentaInput = z.infer<typeof SetPrecioVentaSchema>;
```

### Modelo de Base de Datos (Prisma)
```prisma
model Producto {
  id                String          @id @default(uuid())
  nombre            String          @unique @db.VarChar(150)
  costoTotal        Decimal         @map("costo_total") @db.Decimal(12, 2)
  precioVentaActual Decimal         @default(0) @map("precio_venta_actual") @db.Decimal(12, 2)
  createdAt         DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime        @updatedAt @map("updated_at") @db.Timestamptz

  receta            RecetaItem[]
  detallesPedido    DetallePedido[]

  @@index([nombre])
  @@index([costoTotal])
  @@map("productos")
}
```

---

## 3. Reglas de Negocio & UI/UX

### Módulo Independiente: 3 Acciones Principales

#### 1. Acción: Listar (Vista Principal `/inventario/precios`)
* **Visualización de Tabla:** Despliega todos los productos creados mostrando: `Nombre`, `Costo de Producción` ($CostoTotal$), `Precio de Venta Actual`, `Margen Absoluto` ($), `Margen Relativo` (%) y botones de acción (`Asignar Precio` o `Editar Precio`)[cite: 12].
* **Cálculos de Rentabilidad:**
  * **Margen Absoluto ($):** `PrecioVentaActual - CostoTotalProduccion`[cite: 12].
  * **Margen Relativo (%):** `((PrecioVentaActual - CostoTotalProduccion) / PrecioVentaActual) * 100`[cite: 12].
* **Alertas Visuales:** 
  * Si el producto no tiene precio fijado (`precioVentaActual = 0`), muestra el badge `"Sin Precio"` y el botón `"Asignar Precio"`.
  * Si `PrecioVentaActual < CostoTotalProduccion`, resalta la fila con indicador en rojo (`"Margen Negativo"`).
* **Filtros & Buscador:** Buscador por texto libre (*case-insensitive*) y ordenamiento por Nombre, Costo, Precio de Venta o Porcentaje de Margen.

#### 2. Acción: Crear / Asignar Precio (`/inventario/precios/crear/[productoId]`)
* **Uso:** Asignación por primera vez del precio comercial a un producto recién creado.
* **Información de Contexto (Solo Lectura):** Carga automáticamente el nombre del producto, el desglose de insumos de su receta y su **Costo de Producción Total actual** para dar claridad al usuario antes de fijar el valor[cite: 12].
* **Simulador de Rentabilidad Reactivo:** A medida que el usuario digita un valor en el input de precio de venta, la interfaz calcula dinámicamente en tiempo real el Margen Absoluto ($) y el Margen Relativo (%) en pantalla antes de guardar[cite: 12].

#### 3. Acción: Editar / Ajustar Precio (`/inventario/precios/editar/[productoId]`)
* **Uso:** Modificación o reajuste de un precio de venta previamente establecido.
* **Información Precargada:** Despliega el nombre (bloqueado), el costo de producción vigente y el `precioVentaActual` registrado.
* **Simulación en Tiempo Real:** Recalcula dinámicamente los nuevos márgenes proyectados al cambiar la cifra.
* **Garantía de Inmutabilidad:** Al confirmar el guardado, la aplicación actualiza `precio_venta_actual` en la tabla `productos`. Los registros históricos de la tabla `DetallePedido` mantienen sus valores copiados intactos (`precioVentaHistorico`), garantizando que los cierres de caja pasados no sufran alteraciones[cite: 8, 12].

---

## 4. Plan de Ejecución Atómico (Secuencial)

* [ ] **Paso 1:** Crear esquema Zod `SetPrecioVentaSchema` en `src/features/inventory/schemas/pricing.ts`.
* [ ] **Paso 2:** Crear Server Action `setPrecioVenta` que reciba `productoId` y `precioVentaActual`, valide $Precio > 0$ y actualice el registro en la base de datos.
* [ ] **Paso 3:** Crear Server Action `getPrecioProductoDetail(productoId)` para alimentar las vistas de Crear/Editar con el costo de producción actualizado y el desglose de la receta.
* [ ] **Paso 4:** Crear Server Action `getPreciosProductosList` para la vista general de listado.
* [ ] **Paso 5:** Implementar componente UI `<PricingListTable />` con estados según el margen y enlaces a las acciones de creación/edición.
* [ ] **Paso 6:** Implementar componente UI `<PrecioForm />` reutilizable para las vistas de Crear y Editar con la calculadora reactiva de márgenes en tiempo real.
* [ ] **Paso 7:** Ensamblar las rutas en Next.js App Router:
  * Listar: `src/app/(dashboard)/inventario/precios/page.tsx`
  * Crear/Asignar: `src/app/(dashboard)/inventario/precios/crear/[id]/page.tsx`
  * Editar: `src/app/(dashboard)/inventario/precios/editar/[id]/page.tsx`

---

## 5. Casos Borde y Manejo de Errores

| Escenario | Comportamiento Esperado | Respuesta / Estado |
| :--- | :--- | :--- |
| **Ingreso de Precio de Venta <= 0**[cite: 12] | Inhabilitar botón de guardado y cancelar el cálculo de márgenes[cite: 12]. | Alerta visual: `"El precio de venta debe ser mayor a 0"`[cite: 12]. |
| **Precio de venta menor al costo de producción**[cite: 12] | Permitir la asignación pero mostrar advertencia de pérdida económica[cite: 12]. | Resaltado en rojo: `"Atención: Margen de ganancia negativo"`. |
| **Cambio de precio sobre un producto con ventas pasadas**[cite: 8, 12] | Se actualiza el catálogo actual. Los registros históricos de pedidos no cambian[cite: 8, 12]. | Cierres de caja y reportes previos permanecen inalterados[cite: 8, 12]. |
| **Intento de vender en POS un producto con `precioVentaActual = 0`** | El POS bloquea la adición al carrito hasta que se asigne un precio. | Notificación: `"El producto requiere asignación de precio"`. |

---

## 6. Criterios de Aceptación (Escenarios BDD)

```gherkin
Feature: Definición de Precios de Venta y Márgenes en Espacio Dedicado

  # ACCIÓN: LISTAR
  Scenario: Visualización del listado general de precios y márgenes
    Given que existen productos registrados con sus costos de producción calculados
    When el usuario ingresa al módulo independiente "Precios de Venta" (`/inventario/precios`)
    Then el sistema muestra la lista de productos con su Costo de Producción, Precio de Venta, Margen Absoluto y Margen Relativo
    And presenta los botones de acción "Asignar Precio" o "Editar" según corresponda.

  # ACCIÓN: CREAR (ASIGNACIÓN CON VISUALIZACIÓN DE COSTOS)
  Scenario: Asignación inicial de precio visualizando costo de producción en tiempo real
    Given que el usuario navega a "Asignar Precio" para el producto "Cappuccino 8oz"
    And la pantalla muestra el Costo de Producción cargado de $2500.00
    When ingresa un precio de venta de 7000.00
    Then la interfaz calcula e indica dinámicamente un Margen Absoluto de $4500.00 y un Margen Relativo del 64.29%
    And al presionar "Guardar Precio", el sistema persiste el valor y redirige al listado principal.

  # ACCIÓN: EDITAR
  Scenario: Ajuste de precio existente con recálculo dinámico de rentabilidad
    Given que el usuario ingresa a "Editar Precio" del producto "Cappuccino 8oz"
    And visualiza el precio actual de 7000.00 y el costo de producción de 2500.00
    When modifica el precio de venta a 8000.00
    Then la pantalla actualiza instantáneamente el Margen Absoluto a $5500.00 y el Margen Relativo al 68.75%
    And al guardar los cambios, actualiza la información del catálogo.

  # INMUTABILIDAD HISTÓRICA DE PEDIDOS
  Scenario: Protección inmutable de pedidos realizados tras cambio de precio
    Given que se realizaron pedidos pasados conteniendo "Cappuccino 8oz" vendido a $7000.00
    When el administrador actualiza el precio de venta del "Cappuccino 8oz" a $8500.00
    Then el precio en el catálogo activo cambia a $8500.00
    And los registros de las órdenes pasadas en `DetallePedido` conservan su `precioVentaHistorico` en $7000.00 sin sufrir alteraciones.
```

---

## 7. Definición de Hecho (DoD)

* [ ] `npx tsc --noEmit` ejecuta sin errores de compilación.
* [ ] `npm run lint` pasa sin advertencias ni errores.
* [ ] Test unitario que valida las fórmulas de Margen Absoluto y Margen Relativo (%).
* [ ] Test de integración comprobando que actualizar un precio en `Producto` no modifica los registros existentes en `DetallePedido`.
* [ ] Verificación en navegador móvil y de escritorio adaptada al diseño institucional de **la·Pausa Café**[cite: 10].