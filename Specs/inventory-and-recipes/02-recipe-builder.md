# Spec Atómico: 02-recipe-builder (Gestión de Productos y Recetas Base)[cite: 6, 7]

## 1. Visión General & Alcance
* **Objetivo:** Implementar la gestión completa del catálogo comercial de productos estáticos (creación con configuración de receta, edición de receta con recálculo de costos y listado con búsqueda/ordenamiento) calculando automáticamente el costo total de preparación con base en los costos unitarios vigentes de los insumos[cite: 6, 7].
* **Fuera de alcance:**[cite: 6, 7]
  * Modificadores dinámicos o variaciones de tipo de leche/azúcar (los productos son estáticos)[cite: 6].
  * Definición de precios de venta al público, impuestos, promociones o márgenes de ganancia[cite: 7].
  * Control de inventario físico, stock o descuento automático de insumos por venta[cite: 7].
  * Eliminación física o borrado de productos[cite: 7].
  * Paginación o scroll infinito (se cargan todos los registros)[cite: 7].
  * Exportación del catálogo a archivos externos (PDF, CSV, Excel)[cite: 7].

---

## 2. Contratos de Datos & Esquemas

### Esquema de Validación (Zod)[cite: 6, 7]
```typescript
// src/features/inventory/schemas/producto.ts
import { z } from 'zod';

export const ItemRecetaSchema = z.object({
  insumoId: z.string().uuid("Seleccione un insumo válido"),
  cantidad: z
    .number({ invalid_type_error: "Ingrese una cantidad válida" })
    .gt(0, "La cantidad debe ser mayor a 0"),
});

export const CreateProductoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre del producto es obligatorio")
    .max(150, "El nombre no puede exceder 150 caracteres")
    .transform((val) => val.trim().toLowerCase()),
  insumos: z
    .array(ItemRecetaSchema)
    .min(1, "Debe asociar al menos 1 insumo para crear el producto"),
});

export const UpdateProductoSchema = z.object({
  insumos: z
    .array(ItemRecetaSchema)
    .min(1, "El producto debe contener al menos 1 insumo en su receta"),
});

export type CreateProductoInput = z.input<typeof CreateProductoSchema>;
export type UpdateProductoInput = z.infer<typeof UpdateProductoSchema>;
```

### Modelo de Base de Datos (Prisma)[cite: 7]
```prisma
model Producto {
  id         String       @id @default(uuid())
  nombre     String       @unique @db.VarChar(150)
  costoTotal Decimal      @map("costo_total") @db.Decimal(12, 2)
  createdAt  DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt  DateTime     @updatedAt @map("updated_at") @db.Timestamptz

  receta     RecetaItem[]
  ordenes    DetallePedido[]

  @@index([nombre])
  @@index([costoTotal])
  @@map("productos")
}

model RecetaItem {
  id            String   @id @default(uuid())
  productoId    String   @map("producto_id")
  producto      Producto @relation(fields: [productoId], references: [id], onDelete: Cascade)
  insumoId      String   @map("insumo_id")
  insumo        Insumo   @relation(fields: [insumoId], references: [id])
  cantidad      Decimal  @db.Decimal(12, 2)
  costoSubtotal Decimal  @map("costo_subtotal") @db.Decimal(12, 2)

  @@unique([productoId, insumoId])
  @@map("producto_insumos")
}
```

---

## 3. Reglas de Negocio & UI/UX

### Cálculos y Validaciones Económicas
* **Fórmula de Costo Total:** CostoTotalProducto = Σ (CostoUnitarioVigente_i × Cantidad_i)[cite: 6, 7].
* **Precálculo Reactivo Client-Side:** La interfaz debe calcular y actualizar dinámicamente en tiempo real los subtotales por insumo y el costo total acumulado del producto a medida que se agregan, modifican o remueven insumos[cite: 6, 7].
* **Re-validación de Costos Server-Side:** En el momento de procesar la solicitud (POST o PUT), el backend DEBE consultar los `costoUnitario` más recientes de cada insumo en la base de datos para recalcular y verificar la precisión económica antes de persistir[cite: 7].
* **Precisión de Almacenamiento:** Las cantidades de los insumos y los costos (subtotales y total) se guardan en base de datos con **2 decimales exactos**[cite: 7].

### Restricciones del Constructor de Recetas (Formulario)
* **Obligatoriedad de Receta:** Todo producto debe contener **al menos 1 insumo**[cite: 6, 7]. Se deshabilita la opción de guardar si la receta queda vacía[cite: 7]. Sin tope máximo de insumos[cite: 7].
* **Restricción de Cantidades:** Toda cantidad debe ser estrictamente mayor a cero (Cantidad > 0)[cite: 6, 7].
* **Prevención de Duplicados en Selector:** Al desplegar el selector de insumos, los insumos que ya forman parte de la receta actual deben mostrarse deshabilitados/no seleccionables[cite: 7].
* **Etiqueta de Unidad de Medida:** La interfaz debe desplegar de forma fija la unidad de medida base del insumo seleccionado como una etiqueta estática junto al campo de cantidad (ej: "gramos", "mililitros")[cite: 7].
* **Sanitización y Unicidad del Nombre (Creación):** El nombre del producto debe ser único[cite: 7]. Se aplica `trim()` y normalización a minúsculas antes de evaluar unicidad (*case-insensitive*)[cite: 7].
* **Inmutabilidad del Nombre (Edición):** En la pantalla de edición, el campo `Nombre del producto` permanece bloqueado/deshabilitado (solo lectura)[cite: 7].
* **Modal de Confirmación al Eliminar Insumo:** Al hacer clic en el botón/icono "Eliminar" de una fila de insumo en la receta, se despliega un modal de confirmación (*"¿Está seguro de eliminar este insumo de la receta?"*) antes de removerlo de la vista[cite: 7].
* **Acción de Cancelar:** El botón "Cancelar" descarta la edición/creación sin ejecutar llamadas a la API y redirige al listado principal[cite: 7].

### Comportamiento del Listado Principal (UX)
* **Atributos por Ítem:** Nombre del producto, Costo total (formateado con símbolo de moneda), Indicador visual explícito de cantidad de insumos en la receta (ej: "3 insumos") y botón de acción `Editar`[cite: 7].
* **Orden por Defecto:** Alfabético Ascendente (A-Z) por `Nombre`[cite: 7].
* **Criterios de Ordenamiento Permitidos:**[cite: 7]
  * Nombre: Alfabético Ascendente (A-Z) y Descendente (Z-A)[cite: 7].
  * Costo Total: Numérico Descendente (Mayor a Menor) y Ascendente (Menor a Mayor)[cite: 7].
* **Buscador por Texto Libre:** Filtrado dinámico en tiempo real en frontend/backend por coincidencia parcial en `Nombre` (*case-insensitive* y *accent-insensitive*)[cite: 7].
* **Empty State:** Si no existen productos o la búsqueda no arroja resultados, mostrar `"No se encontraron productos"` junto al botón de `"Crear Producto"`[cite: 7].
* **Manejo de Error de Red/Servidor:** Si ocurre una falla al cargar el listado, desplegar la alerta `"No se pudo cargar el listado de productos. Intente nuevamente más tarde"`[cite: 7].

---

## 4. Plan de Ejecución Atómico (Secuencial)
* [ ] **Paso 1:** Crear esquemas de validación Zod y tipos de TypeScript en `src/features/inventory/schemas/producto.ts`[cite: 6].
* [ ] **Paso 2:** Crear Server Action `createProducto` que valide la unicidad del nombre, consulte en BD los costos unitarios vigentes de los insumos seleccionados, calcule el costo total y persista `Producto` junto con sus `RecetaItem` en una transacción (`prisma.$transaction`)[cite: 6, 7].
* [ ] **Paso 3:** Crear Server Action `updateProducto` que reciba el ID, ignore modificaciones al nombre, re-consulte los costos unitarios vigentes de los insumos en la receta, sincronice/reemplace los registros en `producto_insumos` y actualice `costoTotal` en una transacción[cite: 7].
* [ ] **Paso 4:** Crear Server Action `getProductos` que consulte todos los productos incluyendo el conteo de insumos (`_count`) y soporte ordenamiento y filtrado[cite: 7].
* [ ] **Paso 5:** Crear componente UI `<RecipeBuilder />` con selector de insumos (con opción deshabilitada si ya fue añadido), etiqueta estática de unidad de medida, campos de cantidad con precálculo de subtotales/total en tiempo real y modal de confirmación para eliminación de ítems[cite: 6, 7].
* [ ] **Paso 6:** Crear componente UI `<ProductoTable />` / listado con buscador por texto libre, selector de ordenamiento, badge indicador de cantidad de insumos y estado vacío[cite: 7].
* [ ] **Paso 7:** Ensamblar vistas en las rutas de Next.js (`/productos`, `/productos/crear`, `/productos/[id]/editar`) con notificaciones *toast* y redirección post-guardado[cite: 7].

---

## 5. Casos Borde y Manejo de Errores

| Escenario | Comportamiento Esperado | Respuesta / Estado |
| :--- | :--- | :--- |
| **Nombre de producto duplicado (ej. " café americano " vs "Café Americano")**[cite: 7] | Interrumpir la transacción y marcar el campo `Nombre`[cite: 7]. | Error HTTP 409 / 400: `"El producto ya existe"`[cite: 7]. |
| **Intento de guardar producto sin insumos**[cite: 6, 7] | Inhabilitar el envío del formulario[cite: 7]. | Alerta visual: `"Debe asociar al menos 1 insumo para crear el producto"`[cite: 7]. |
| **Cantidad de insumo <= 0**[cite: 6, 7] | Deshabilitar botón de guardado y mostrar alerta en la fila[cite: 7]. | Alerta visual: `"La cantidad debe ser mayor a 0"`[cite: 7]. |
| **Intento de modificar Nombre en actualización**[cite: 7] | El campo está bloqueado en UI y el backend ignora cualquier parámetro `nombre` en el payload[cite: 7]. | Mantiene el nombre inalterado[cite: 7]. |
| **Eliminación de insumo de la receta en edición**[cite: 7] | Detener la acción hasta obtener respuesta afirmativa en modal[cite: 7]. | Modal: `"¿Está seguro de eliminar este insumo de la receta?"`[cite: 7]. |
| **Eliminar todos los insumos durante edición**[cite: 7] | Bloquear el botón de guardado de cambios[cite: 7]. | Alerta visual: `"El producto debe contener al menos 1 insumo en su receta"`[cite: 7]. |
| **Falla en servidor o red al cargar listado**[cite: 7] | Capturar la excepción y mostrar feedback en la pantalla[cite: 7]. | Alerta: `"No se pudo cargar el listado de productos. Intente nuevamente más tarde"`[cite: 7]. |

---

## 6. Criterios de Aceptación (Escenarios BDD)[cite: 7]

```gherkin
Feature: Gestión de Productos y Recetas Base

  # CREACIÓN DE PRODUCTO
  Scenario: Creación exitosa de un producto con receta (Happy Path)
    Given que el usuario se encuentra en el formulario "Crear Producto"
    And no existe ningún producto registrado previamente con el nombre "Café Americano 8oz"
    When ingresa el Nombre "Café Americano 8oz", selecciona "Café Tostado" con cantidad 18 y "Agua Filtrada" con cantidad 200
    Then la pantalla calcula e indica dinámicamente los subtotales por insumo y el costo total acumulado
    And al presionar "Guardar Producto", el backend valida los costos vigentes de los insumos y persiste la información en la base de datos con precisión de 2 decimales
    And muestra la notificación "Producto creado exitosamente"
    And redirige al usuario a la pantalla principal del listado de productos.

  Scenario: Rechazo por intentar guardar un producto sin insumos
    Given que el usuario ha ingresado el Nombre del producto
    When no vincula ningún insumo a la receta e intenta guardar
    Then el sistema detiene el proceso de guardado
    And muestra la alerta de validación "Debe asociar al menos 1 insumo para crear el producto".

  Scenario: Rechazo por duplicidad en el nombre del producto
    Given que ya existe un producto registrado con el nombre "Café Americano 8oz"
    When el usuario intenta crear un producto con el nombre " café americano 8oz "
    Then la validación identifica la coincidencia tras normalizar el texto
    And interrumpe la transacción mostrando el mensaje "El producto ya existe".

  Scenario: Rechazo por cantidad de insumo menor o igual a cero
    Given que el usuario vincula un insumo a la receta
    When ingresa el valor 0 o un número negativo en el campo "Cantidad"
    Then el sistema muestra el mensaje de error "La cantidad debe ser mayor a 0"
    And mantiene inhabilitado el botón "Guardar Producto".

  Scenario: Inhabilitación de insumos previamente seleccionados en el selector
    Given que el usuario ya agregó el insumo "Café Tostado" a la receta actual
    When abre nuevamente el selector para agregar otro insumo
    Then la opción "Café Tostado" aparece inhabilitada en la lista desplegable.

  # EDICIÓN DE RECETA DE PRODUCTO
  Scenario: Edición exitosa de receta de producto
    Given que el usuario selecciona "Editar" en el producto "Café Americano 8oz" desde el listado general
    And el formulario carga la receta actual con el Nombre bloqueado
    When el usuario modifica la cantidad de "Café Tostado" a 22, confirma la eliminación de "Agua Filtrada" en el modal y agrega "Leche Entera" con cantidad 150
    Then la pantalla calcula dinámicamente los subtotales por insumo y el costo total general actualizado
    And al presionar "Guardar Cambios", el backend valida los costos vigentes y actualiza el producto y su detalle en la base de datos
    And muestra la notificación "Producto actualizado exitosamente"
    And redirige al usuario a la pantalla del listado principal de productos.

  Scenario: Confirmación previa al eliminar un insumo de la receta
    Given que el usuario se encuentra editando la receta de un producto
    When hace clic en el botón "Eliminar" de uno de los insumos asociados
    Then la interfaz despliega un modal de confirmación con el mensaje "¿Está seguro de eliminar este insumo de la receta?"
    And solo remueve el insumo de la vista si el usuario presiona "Confirmar".

  Scenario: Bloqueo al intentar guardar un producto editado sin insumos
    Given que el usuario elimina todos los insumos de la receta en el formulario de edición
    When intenta presionar "Guardar Cambios"
    Then el sistema detiene el proceso de guardado
    And muestra el mensaje de error "El producto debe contener al menos 1 insumo en su receta".

  Scenario: Inmutabilidad del nombre del producto
    Given que el usuario se encuentra en la pantalla de edición de un producto
    When intenta enfocar o modificar el campo Nombre del producto
    Then el campo permanece deshabilitado/solo lectura impidiendo cualquier modificación.

  Scenario: Descarte de cambios por cancelación
    Given que el usuario realiza modificaciones en la receta en pantalla
    When presiona el botón "Cancelar"
    Then el sistema descarta todos los cambios sin ejecutar peticiones HTTP de actualización
    And redirige al usuario a la pantalla del listado principal de productos.

  # LISTADO, BÚSQUEDA Y NAVEGACIÓN
  Scenario: Carga inicial exitosa con orden alfabético A-Z por defecto
    Given que existen productos registrados en el sistema
    When el usuario navega a la pantalla principal de "Productos"
    Then la interfaz consulta la lista de productos
    And despliega la totalidad de los productos ordenados alfabéticamente de la A-Z por Nombre
    And cada fila presenta el Nombre, Costo total, indicador de cantidad de insumos y el botón "Editar".

  Scenario: Búsqueda de producto por texto libre case-insensitive
    Given que la pantalla despliega la lista de productos
    When el usuario ingresa "capuchino" en el campo de búsqueda
    Then la interfaz filtra dinámicamente mostrando únicamente los productos cuyo nombre contenga el término escrito.

  Scenario: Ordenamiento por Costo Total de Mayor a Menor
    Given que el usuario visualiza el listado de productos
    When selecciona el criterio de ordenamiento "Costo total: Mayor a Menor"
    Then la pantalla reordena los ítems posicionando en primer lugar el producto con el costo total más elevado.

  Scenario: Estado vacío por ausencia de productos o sin coincidencias
    Given que no existen productos registrados en la base de datos o la búsqueda no arroja coincidencias
    When el usuario carga la pantalla o realiza un filtro
    Then la interfaz despliega el mensaje "No se encontraron productos"
    And mantiene visible el botón "Crear Producto".

  Scenario: Manejo de error de servicio
    Given que ocurre un fallo de red o el servidor responde con estatus 500 Internal Server Error
    When el usuario consulta la vista
    Then la interfaz muestra la alerta "No se pudo cargar el listado de productos. Intente nuevamente más tarde".
```

---

## 7. Definición de Hecho (DoD)
* [ ] `npx tsc --noEmit` ejecuta sin ningún error de tipos[cite: 6].
* [ ] `npm run lint` pasa sin advertencias ni errores.
* [ ] Test unitario que valida que el costo total sume correctamente $(CostoUnitarioVigente_i \times Cantidad_i)$ y redondee a 2 decimales[cite: 7].
* [ ] Test unitario que valida la sanitización del nombre (`trim` y `toLowerCase`) en creación[cite: 7].
* [ ] Pruebas de integración para las Server Actions de `createProducto`, `updateProducto` y `getProductos`[cite: 6, 7].
* [ ] Verificación manual en interfaz responsive para escritorio y dispositivos móviles[cite: 7].