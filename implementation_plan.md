# Plan de Implementación: 01-POS-Mobile-Orders (Toma de Pedidos y Snapshots)

El objetivo de este módulo es la creación de la interfaz táctil del punto de venta (POS) para los baristas. En este paso el negocio cobra vida: cada vez que se vende un producto, se debe descontar inteligentemente el inventario basado en la receta del producto y guardar una "fotografía" histórica de los precios para que la contabilidad nunca se descuadre si los precios cambian en el futuro.

## User Review Required

- **Ubicación de rutas:** El Spec sugiere `/pos` y `/pos/ordenes`. Crearé estas rutas directamente en la carpeta raíz de `src/app/pos` para que sea fácil acceder desde un dispositivo móvil o tablet.

## Open Questions

Ninguna por el momento. Las reglas de inmutabilidad y descuento de inventario en transacciones atómicas están muy bien definidas.

## Proposed Changes

---

### Capa de Datos (Prisma)

#### [MODIFY] prisma/schema.prisma
- Agregar el enum `PedidoEstado` (`ACTIVO`, `CANCELADO`).
- Agregar el modelo `Pedido` con totalVenta, costoTotalPedido, gananciaNeta y estado.
- Agregar el modelo `DetallePedido` (snapshot inmutable) con `cantidadVendida`, `precioVentaHistorico`, y `costoHistorico`.
- Descomentar la relación `detallesPedido` en el modelo `Producto`.

---

### Capa de Lógica y Validaciones

#### [NEW] src/features/pos/schemas/order.ts
- Definición de esquemas Zod: `OrderItemSchema` y `CreateOrderSchema`.

#### [NEW] src/features/pos/actions/create-order.ts
- Server Action `createOrderTransaction(data)`:
  - Busca los productos solicitados y sus recetas desde la base de datos (para prevenir inyección de precios desde el cliente).
  - Calcula matemáticamente el total, el costo y la ganancia.
  - Genera las instrucciones de Prisma para crear el `Pedido` y sus `DetallePedido`.
  - Recorre las recetas para ejecutar los `UPDATE` al inventario (`cantidadDisponible`) de los Insumos.
  - Ejecuta todo dentro de un bloque `prisma.$transaction`.

#### [NEW] src/features/pos/actions/get-orders.ts
- Server Action `getActiveOrders()`: Consulta todos los pedidos ordenados descendentemente por fecha para el reporte del barista.

---

### Capa de Presentación (UI)

#### [NEW] src/features/pos/components/POSCartContext.tsx
- Proveedor de Contexto React (Zustand o Context API nativo) para manejar el estado global del carrito de compras en la sesión del usuario sin recargar la página.

#### [NEW] src/features/pos/components/POSProductGrid.tsx
- Grilla táctil Mobile-First que lista el menú. Productos sin precio (`precioVentaActual = 0`) aparecen bloqueados visualmente.

#### [NEW] src/features/pos/components/POSCartBar.tsx
- Barra flotante en la parte inferior de la pantalla (típico en apps móviles de delivery/POS) que muestra el total a cobrar y el botón de "Confirmar Pedido".

#### [NEW] src/features/pos/components/ActiveOrdersList.tsx
- Interfaz para consultar los pedidos confirmados, ver los ítems de cada uno y el acumulado total del turno.

#### Rutas de Next.js
- **[NEW]** `src/app/pos/page.tsx` (Catálogo y POS).
- **[NEW]** `src/app/pos/ordenes/page.tsx` (Lista de seguimiento de órdenes activas).

## Verification Plan

### Automated Tests
- Ejecutaré `npx prisma db push` y `npx prisma generate` para sincronizar los nuevos modelos con Supabase.
- Ejecutaré `npm run build` para asegurar la compilación limpia.

### Manual Verification
- Renderizar la interfaz simulando resolución móvil para verificar la experiencia táctil.
- Probar un checkout "feliz" y verificar que los insumos en la base de datos hayan disminuido exactamente la cantidad requerida en la receta.
