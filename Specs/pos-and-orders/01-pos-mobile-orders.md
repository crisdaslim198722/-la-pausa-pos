# Spec Atómico: 01-pos-mobile-orders (Toma de Pedidos POS Móvil, Tracking y Snapshots)[cite: 13]

## 1. Visión General & Alcance
* **Objetivo:** Implementar la interfaz móvil táctil (Mobile-First) para que el barista tome pedidos rápidamente desde su teléfono, visualice el seguimiento de órdenes activas, ejecute el descuento automático de insumos en inventario y guarde un *snapshot* histórico inmutable de precios y costos en cada transacción[cite: 13].
* **Invariante Crítica (Snapshot Histórico):** Al confirmar un pedido, `precioVentaHistorico` y `costoHistorico` DEBEN guardarse como valores planos estáticos en `DetallePedido`[cite: 13]. Cambios posteriores en los precios de venta de productos o costos de insumos JAMÁS modificarán las órdenes ya procesadas ni el registro financiero del día[cite: 13].
* **Fuera de alcance:**[cite: 13]
  * Integración con pasarelas de pago electrónico o datáfonos externos[cite: 13].
  * Impresión física de tiquetes en impresoras térmicas[cite: 13].
  * Modificadores variables de productos (los productos son estáticos)[cite: 13].

---

## 2. Contratos de Datos & Esquemas

### Esquema de Validación (Zod)
```typescript
// src/features/pos/schemas/order.ts
import { z } from 'zod';

export const OrderItemSchema = z.object({
  productoId: z.string().uuid("Identificador de producto inválido"),[cite: 13]
  cantidad: z
    .number({ invalid_type_error: "Cantidad inválida" })
    .int("La cantidad debe ser un número entero")[cite: 13]
    .positive("La cantidad debe ser mayor a 0"),[cite: 13]
});

export const CreateOrderSchema = z.object({
  items: z
    .array(OrderItemSchema)
    .min(1, "El pedido debe contener al menos 1 producto"),[cite: 13]
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
```

### Modelo de Base de Datos (Prisma)
```prisma
enum PedidoEstado {
  ACTIVO
  CANCELADO
}

model Pedido {
  id               String          @id @default(uuid())[cite: 13]
  fechaHora        DateTime        @default(now()) @map("fecha_hora") @db.Timestamptz[cite: 13]
  totalVenta       Decimal         @map("total_venta") @db.Decimal(12, 2)[cite: 13]
  costoTotalPedido Decimal         @map("costo_total_pedido") @db.Decimal(12, 2)[cite: 13]
  gananciaNeta     Decimal         @map("ganancia_neta") @db.Decimal(12, 2)[cite: 13]
  estado           PedidoEstado    @default(ACTIVO)[cite: 13]

  detalles         DetallePedido[]

  @@map("pedidos")[cite: 13]
}

model DetallePedido {
  id                   String   @id @default(uuid())[cite: 13]
  pedidoId             String   @map("pedido_id")[cite: 13]
  pedido               Pedido   @relation(fields: [pedidoId], references: [id], onDelete: Cascade)[cite: 13]
  productoId           String   @map("producto_id")[cite: 13]
  producto             Producto @relation(fields: [productoId], references: [id])[cite: 13]
  cantidadVendida      Int      @map("cantidad_vendida")[cite: 13]
  precioVentaHistorico Decimal  @map("precio_venta_historico") @db.Decimal(12, 2)[cite: 13]
  costoHistorico       Decimal  @map("costo_historico") @db.Decimal(12, 2)[cite: 13]

  @@map("detalle_pedidos")[cite: 13]
}
```

---

## 3. Reglas de Negocio & UI/UX

### Módulo POS Móvil: 2 Secciones Principales

#### 1. Sección: Creación de Pedido (Mobile UI Barista `/pos`)
* **Catálogo Táctil Mobile-First:** Disposición en retícula de 2 columnas optimizada para uso con el pulgar en teléfonos móviles[cite: 13]. Muestra nombre del producto, precio de venta y botones táctiles rápidos (`+` / `-` / selector de cantidad)[cite: 13].
* **Barra Inferior Fija (Resumen de Carrito):** Muestra en tiempo real la cantidad de ítems seleccionados, el **Total a Cobrar al Cliente** ($TotalVenta = \sum PrecioVentaActual_i \times Cantidad_i$) y el botón principal `"Crear Pedido"`[cite: 13].
* **Bloqueo por Productos sin Precio:** Si un producto tiene `precioVentaActual = 0`, no se puede agregar al carrito y muestra la etiqueta `"Sin Precio"`.

#### 2. Sección: Seguimiento de Órdenes Activas (`/pos/ordenes`)
* **Listado de Seguimiento:** Muestra la lista cronológica de pedidos realizados durante el turno/día con hora de creación, lista de productos comprados, estado (`ACTIVO` / `CANCELADO`) y total monetario[cite: 13].
* **Totales del Día (Vista Barista):** Despliega el total acumulado de ventas del día para control de caja rápido.

### Transaccionalidad Backend & Snapshot Inmutable
Al presionar `"Crear Pedido"`, la Server Action `createOrderTransaction` DEBE ejecutarse dentro de una única transacción de base de datos (`prisma.$transaction`)[cite: 13]:

1. **Cálculo de Snapshot por Producto:**
   * `precioVentaHistorico` = copia exacta del `precioVentaActual` del producto en ese instante[cite: 13].
   * `costoHistorico` = costo total de producción del producto en ese instante sumando $(\text{cantidadRequerida}_j \times \text{costoUnitarioInsumo}_j)$ de los insumos de su receta[cite: 13].
2. **Cálculo de Totales de Pedido:**
   * `totalVenta` = $\sum (\text{precioVentaHistorico}_i \times \text{cantidadVendida}_i)$[cite: 13].
   * `costoTotalPedido` = $\sum (\text{costoHistorico}_i \times \text{cantidadVendida}_i)$[cite: 13].
   * `gananciaNeta` = `totalVenta` - `costoTotalPedido`[cite: 13].
3. **Descuento Automático de Stock:**
   * Recorrer cada producto del pedido y sus `RecetaItem` asociados[cite: 13].
   * Restar de `Insumo.cantidadDisponible` la cantidad total consumida: $\text{cantidadDisponible} - (\text{cantidadRequerida} \times \text{cantidadVendida})$[cite: 13].
4. **Resistencia a Cambios Futuros:**
   * Editar los insumos o subir el precio del café al día siguiente NO afecta `precioVentaHistorico` ni `costoHistorico` en `DetallePedido`[cite: 13].

---

## 4. Plan de Ejecución Atómico (Secuencial)

* [ ] **Paso 1:** Crear esquema Zod `CreateOrderSchema` en `src/features/pos/schemas/order.ts`[cite: 13].
* [ ] **Paso 2:** Crear Server Action `createOrderTransaction` en `src/features/pos/actions/create-order.ts` utilizando `prisma.$transaction` para crear `Pedido`, insertar `DetallePedido` con los snapshots de costo/precio y decrementar `Insumo.cantidadDisponible`[cite: 13].
* [ ] **Paso 3:** Crear Server Action `getActiveOrders` en `src/features/pos/actions/get-orders.ts` para obtener los pedidos del día ordenados descendentemente por `fechaHora`[cite: 13].
* [ ] **Paso 4:** Implementar estado global o contexto local del carrito `<POSCartContext />` para gestión rápida de agregación de ítems en UI[cite: 13].
* [ ] **Paso 5:** Crear componente UI `<POSProductGrid />` con diseño responsive para smartphones y `<POSCartBar />` fija en la parte inferior[cite: 13].
* [ ] **Paso 6:** Crear componente UI `<ActiveOrdersList />` para la vista de seguimiento de pedidos[cite: 13].
* [ ] **Paso 7:** Ensamblar rutas en Next.js App Router:
  * Toma de Pedidos: `src/app/(dashboard)/pos/page.tsx`[cite: 13]
  * Seguimiento de Órdenes: `src/app/(dashboard)/pos/ordenes/page.tsx`[cite: 13]

---

## 5. Casos Borde y Manejo de Errores

| Escenario | Comportamiento Esperado | Respuesta / Estado |
| :--- | :--- | :--- |
| **Stock insuficiente de insumo al hacer pedido**[cite: 13] | Descontar el stock permitiendo valores negativos y registrar el pedido sin bloquear la venta rápida al cliente[cite: 13]. | Pedido creado exitosamente; stock de insumo queda negativo[cite: 13]. |
| **Intento de agregar producto sin precio (`precioVentaActual = 0`)**[cite: 13] | Bloquear la adición al carrito[cite: 13]. | Alerta visual: `"Producto no disponible (sin precio asignado)"`[cite: 13]. |
| **Modificación de precio de insumo/producto al día siguiente**[cite: 13] | El pedido anterior conserva intactos sus precios y costos históricos[cite: 13]. | No altera registros pasados de `DetallePedido`[cite: 13]. |
| **Falla en la transacción de base de datos**[cite: 13] | Revertir el pedido y no alterar las cantidades de inventario (Rollback de `prisma.$transaction`)[cite: 13]. | Notificación Toast: `"Error al procesar el pedido. Intente de nuevo"`. |

---

## 6. Criterios de Aceptación (Escenarios BDD)

```gherkin
Feature: Toma de Pedidos POS Móvil y Snapshots Históricos[cite: 13]

  # SECCIÓN: CREACIÓN DE PEDIDO Y DESCUENTO DE STOCK
  Scenario: Creación exitosa de un pedido con descuento de insumos y congelamiento de costos (Happy Path)[cite: 13]
    Given que el barista se encuentra en la pantalla de POS Móvil (`/pos`)[cite: 13]
    And el catálogo muestra "Cappuccino 8oz" con precio $7000.00 y costo de producción de $2500.00 (15g Café, 150ml Leche)[cite: 13]
    When selecciona 2 "Cappuccino 8oz" y presiona "Crear Pedido"[cite: 13]
    Then el sistema registra un nuevo Pedido con totalVenta $14000.00, costoTotalPedido $5000.00 y gananciaNeta $9000.00[cite: 13]
    And guarda en DetallePedido el precioVentaHistorico en $7000.00 y costoHistorico en $2500.00 por unidad[cite: 13]
    And descuenta automáticamente 30g de "Café" y 300ml de "Leche" del inventario de insumos[cite: 13]
    And limpia el carrito de compra mostrando la notificación "Pedido creado exitosamente".[cite: 13]

  # SECCIÓN: INMUTABILIDAD HISTÓRICA (SNAPSHOT)
  Scenario: Verificación de inmutabilidad ante cambios futuros en el costo de insumos[cite: 13]
    Given que se registró un pedido de "Cappuccino 8oz" con costoHistorico de $2500.00 y precioVentaHistorico de $7000.00[cite: 13]
    When el administrador aumenta el precio de compra del Café o modifica el precio de venta del Cappuccino al día siguiente[cite: 13]
    Then la orden realizada previamente en DetallePedido mantiene su costoHistorico en $2500.00 y precioVentaHistorico en $7000.00 sin cambios[cite: 13]
    And el reporte del día en que se hizo el pedido permanece inalterado.[cite: 13]

  # SECCIÓN: SEGUIMIENTO DE ÓRDENES
  Scenario: Seguimiento de pedidos activos realizados en el turno[cite: 13]
    Given que se han procesado 3 pedidos durante el día[cite: 13]
    When el barista navega a la sección "Seguimiento de Órdenes" (`/pos/ordenes`)[cite: 13]
    Then visualiza la lista de las 3 órdenes ordenadas cronológicamente con sus ítems, horas y totales[cite: 13]
    And muestra el acumulado total vendido en el turno.[cite: 13]
```

---

## 7. Definición de Hecho (DoD)

* [ ] `npx tsc --noEmit` ejecuta sin ningún error de tipos.
* [ ] `npm run lint` pasa sin advertencias ni errores.
* [ ] Test unitario que valida el congelamiento de `precioVentaHistorico` y `costoHistorico` en `DetallePedido` al ejecutar el checkout[cite: 13].
* [ ] Test de integración que comprueba que la transacción atómica decremente las cantidades de insumo en la tabla `Insumo` en la misma operación[cite: 13].
* [ ] Verificación de usabilidad táctil en viewport móvil en pantalla de smartphone ajustado a los colores institucionales de **la·Pausa Café**[cite: 10, 13].