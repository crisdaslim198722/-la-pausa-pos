# Plan de Implementación: 03-Pricing-Margins (Precios de Venta y Márgenes)

El objetivo de este módulo es crear una sección independiente donde se asignan y administran los precios de venta de los productos (creados en el spec anterior), calculando automáticamente los márgenes de ganancia en función de los costos de producción vigentes.

## User Review Required

- **Estructura de Carpetas:** El Spec sugiere rutas bajo `src/app/(dashboard)/inventario/precios/...` Sin embargo, en la aplicación actual no estamos usando `(dashboard)`. Las implementaré en `src/app/inventario/precios/...` para mantener la coherencia.
- **Relación con Ventas Históricas:** Por diseño, la inmutabilidad de los precios en pedidos pasados (`DetallePedido`) está cubierta, pero como ese módulo no existe aún, nos concentraremos en asegurar que la actualización a `Producto` no toque nada más.

## Open Questions

Ninguna por el momento. El Spec es suficientemente detallado.

## Proposed Changes

---

### Capa de Datos (Prisma)

#### [MODIFY] prisma/schema.prisma
- Se agregará la columna `precioVentaActual Decimal @default(0) @map("precio_venta_actual") @db.Decimal(12, 2)` al modelo `Producto`.

---

### Capa de Lógica y Validaciones

#### [NEW] src/features/inventory/schemas/pricing.ts
- Se definirá el esquema Zod `SetPrecioVentaSchema` para validar que el precio sea mayor a 0.

#### [NEW] src/features/inventory/actions/pricing-actions.ts
- Creación de Server Actions:
  - `setPrecioVenta(productoId, precioVentaActual)`: Actualiza el precio del producto en la BD.
  - `getPreciosProductosList()`: Devuelve todos los productos con su `costoTotal` y `precioVentaActual`.

---

### Capa de Presentación (UI)

#### [NEW] src/features/inventory/components/PricingListTable.tsx
- Tabla o lista de productos con:
  - Buscador de texto en tiempo real y selectores de ordenamiento.
  - Columnas matemáticas: Costo Total, Precio de Venta, Margen Absoluto ($) y Margen Relativo (%).
  - Alertas visuales (ej. fila roja si el margen es negativo, o badge si no hay precio).

#### [NEW] src/features/inventory/components/PrecioForm.tsx
- Formulario de asignación/edición interactivo:
  - Campos de sólo lectura (Nombre, Receta, Costo Total).
  - Campo de input numérico para "Precio de Venta".
  - Simulador de rentabilidad reactivo (calcula el % en tiempo real mientras el usuario escribe).

#### [NEW] src/app/inventario/precios/page.tsx
- Página de listado principal de la gestión comercial de precios.

#### [NEW] src/app/inventario/precios/crear/[id]/page.tsx
- Página para alojar `<PrecioForm />` en modo inicial.

#### [NEW] src/app/inventario/precios/editar/[id]/page.tsx
- Página para alojar `<PrecioForm />` en modo actualización.

## Verification Plan

### Automated Tests
- Ejecutaré `npx prisma db push` y `npx prisma generate` para aplicar la nueva columna a Supabase.
- Ejecutaré `npm run build` para asegurar que todo pasa el Type-checker de TypeScript en la fase de compilación.

### Manual Verification
- Ingresaré visualmente al entorno local y comprobaré la reactividad de la fórmula `((PrecioVenta - Costo) / PrecioVenta) * 100` en el formulario.
