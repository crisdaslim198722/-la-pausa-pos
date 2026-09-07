# Plan de Implementación: 02-Recipe-Builder (Gestión de Productos y Recetas)

El objetivo de este módulo es permitir al usuario armar los productos finales a partir de los insumos que ya se pueden gestionar. Se implementará un constructor de recetas dinámico.

## User Review Required

- En el esquema de Prisma provisto en el Spec 02, se incluye una relación `ordenes DetallePedido[]` en el modelo `Producto`. Sin embargo, `DetallePedido` no ha sido definido aún en la base de datos (presumiblemente será parte de un Spec futuro). **Para evitar errores de Prisma, procederé a comentar temporalmente esa línea.** ¿Estás de acuerdo?

## Open Questions

- Ninguna pregunta por ahora. El Spec 02 es bastante detallado.

## Proposed Changes

---

### Capa de Datos (Prisma)

#### [MODIFY] schema.prisma
- Se agregarán los modelos `Producto` y `RecetaItem` con la relación de clave foránea al `Insumo` y las configuraciones de decimales `Decimal(12, 2)`.

---

### Capa de Lógica y Validaciones

#### [NEW] src/features/inventory/schemas/producto.ts
- Se definirán los esquemas Zod `ItemRecetaSchema`, `CreateProductoSchema` y `UpdateProductoSchema`.

#### [NEW] src/features/inventory/actions/producto-actions.ts
- Creación de Server Actions:
  - `createProducto`: Valida nombre único, recalcula `costoTotal` desde la BD y crea en transacción.
  - `updateProducto`: Actualiza receta (limpiando y recreando `RecetaItem`), recalcula `costoTotal`.
  - `getProductos`: Lista productos con el count de insumos `_count: { receta: true }`.
  - `getProductoById`: Trae producto con sus items de receta e insumos populados.

---

### Capa de Presentación (UI)

#### [NEW] src/features/inventory/components/RecipeBuilder.tsx
- Componente de formulario altamente interactivo para construir la receta:
  - Manejo dinámico de filas (agregar/eliminar `ItemReceta`).
  - Selector de Insumos (deshabilitando los ya seleccionados).
  - Cálculo instantáneo Reactivo del `costoTotal`.
  - Modal de confirmación al eliminar un insumo de la receta.

#### [NEW] src/features/inventory/components/ProductoTable.tsx
- Tabla o lista de productos con:
  - Buscador de texto en tiempo real.
  - Selector de ordenamiento (A-Z, Costo, etc).
  - Badge indicando el conteo de ingredientes.

#### [NEW] src/app/productos/page.tsx
- Página de listado principal.
*(Nota: Aunque en el Spec original no se especifica si va en `/productos` o `/inventario/productos`, asumiré `/productos` basado en el texto del spec "rutas de Next.js (`/productos`)").*

#### [NEW] src/app/productos/crear/page.tsx
- Página para alojar `<RecipeBuilder />` vacío.

#### [NEW] src/app/productos/[id]/editar/page.tsx
- Página para alojar `<RecipeBuilder />` con datos pre-cargados (nombre bloqueado).

## Verification Plan

### Automated Tests
- Ejecutaré `npx prisma db push` y `npx prisma generate`.
- Ejecutaré `npm run build` para garantizar que la compilación de TypeScript de Next.js (`tsc --noEmit` implícito) pase sin errores.

### Manual Verification
- Visualización de UI en la versión local.
- Hacer deploy local/remoto para verificar que el cálculo de `costoTotal` y las validaciones del array de Zod funcionen en la interfaz del cliente.
