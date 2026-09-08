# Plan de Implementación: Mejoras de Flujo POS (Estados, Nombres y Cobros)

Este plan aborda los ajustes solicitados para mejorar la experiencia operativa del barista en el día a día.

## Propuesta de Experiencia (Sugerencia)
El flujo operativo en una cafetería suele tener dos modalidades: **Paga y Retira** (ej. para llevar) o **Consume y Paga al final** (ej. en mesa). 
Con tus ajustes, el ciclo de vida de un pedido quedará así:
1. **Crear Pedido:** El barista toma la orden, anota el nombre (opcional) y el pedido nace en estado `ACTIVO` (Pendiente de preparar).
2. **Despachar:** Cuando el café está listo y se entrega, el barista presiona "Despachado". El pedido pasa a estado `DESPACHADO` (Pendiente de cobro).
3. **Cobrar:** Cuando el cliente va a pagar, se presiona "Cobrar", se abre el resumen para verificar, y al confirmar, el estado pasa a `PAGADO`.

## Proposed Changes

### Capa de Datos (Prisma)
#### [MODIFY] prisma/schema.prisma
- Modificar el enum `PedidoEstado` para que sea: `ACTIVO`, `DESPACHADO`, `PAGADO`, `CANCELADO`.
- Agregar el campo `nombreCliente String? @map("nombre_cliente")` al modelo `Pedido`.

### Capa de Lógica
#### [MODIFY] src/features/pos/schemas/order.ts
- Agregar `nombreCliente` (opcional) a `CreateOrderSchema`.

#### [MODIFY] src/features/pos/actions/create-order.ts
- Incluir `nombreCliente` en la creación del `Pedido` en la base de datos.

#### [NEW] src/features/pos/actions/update-order.ts
- Crear un Server Action `updateOrderState(pedidoId, nuevoEstado)` para hacer las transiciones (`ACTIVO` -> `DESPACHADO` -> `PAGADO`).

### Capa de Presentación (UI)
#### [MODIFY] src/features/pos/components/POSCartBar.tsx
- Cambiar el texto del botón de "Cobrar Pedido" a "Crear Pedido".
- Al presionar el botón, abrir un pequeño Modal (Pop-up) que pida el "Nombre del Cliente (Opcional)" y tenga el botón final de "Confirmar Pedido".

#### [MODIFY] src/features/pos/components/ActiveOrdersList.tsx
- **Mejora Visual:** Resaltar las cantidades (ej. un círculo rojo con "2x" bien grande al lado de cada producto).
- **Separación de Estados:** Dividir la lista en 3 secciones claras (o pestañas):
  - 🟡 **En Preparación (Activos):** Muestra el nombre del cliente y un botón "Marcar como Despachado".
  - 🟠 **Por Cobrar (Despachados):** Muestra el botón "Cobrar" que levantará un pop-up.
  - 🟢 **Pagados:** Historial de lo que ya se cobró hoy.
- **Pop-up de Cobro:** Al hacer clic en "Cobrar" en un pedido despachado, se abrirá un modal con el resumen detallado de la cuenta y el botón verde gigante "Confirmar Pago".
