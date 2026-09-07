# Spec Atómico: 01-insumos-crud (Gestión Completa de Insumos)

## 1. Visión General & Alcance

* **Objetivo:** Implementar la gestión completa de insumos (creación, edición sin alteración de nombre y listado con búsqueda/ordenamiento) calculando dinámicamente el costo unitario base con precisión de 2 decimales para alimentar el costeo de recetas.  
* **Fuera de alcance:**  
  * Alertas de stock mínimo o inventario crítico.  
  * Paginación o scroll infinito (se carga la totalidad de insumos).  
  * Historial de auditoría de cambios de precios.  
  * Recálculo en cascada de recetas asociadas.  
  * Importación/exportación masiva (CSV/Excel).

---

## 2. Contratos de Datos & Esquemas

El esquema de validación Zod define la estructura y sanitización de entrada para la creación y edición:

```ts
// src/features/inventory/schemas/insumo.ts
import { z } from 'zod';

export const UNIDADES_CATALOGO = ['gramos', 'mililitros', 'porcion', 'unidades'] as const;

export const CreateInsumoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre del insumo es obligatorio")
    .max(150, "El nombre no puede exceder 150 caracteres")
    .transform((val) => val.trim().toLowerCase()),
  unidadCompra: z.enum(UNIDADES_CATALOGO, {
    errorMap: () => ({ message: "Seleccione una unidad de compra válida" }),
  }),
  precioCompra: z
    .number({ invalid_type_error: "Ingrese un precio válido" })
    .min(0, "El precio de compra no puede ser negativo"),
  rendimientoUnidad: z
    .number({ invalid_type_error: "Ingrese un rendimiento válido" })
    .gt(0, "El rendimiento debe ser mayor a 0"),
  unidadMedida: z.enum(UNIDADES_CATALOGO, {
    errorMap: () => ({ message: "Seleccione una unidad de medida válida" }),
  }),
});

export const UpdateInsumoSchema = CreateInsumoSchema.omit({ nombre: true });

export type CreateInsumoInput = z.input<typeof CreateInsumoSchema>;
export type UpdateInsumoInput = z.infer<typeof UpdateInsumoSchema>;
```

El modelo relacional en Prisma para la tabla insumos establece los tipos de datos y los índices de búsqueda:

```prisma
enum UnidadMedidaEnum {
  gramos
  mililitros
  porcion
  unidades
}

model Insumo {
  id                 String           @id @default(uuid())
  nombre             String           @unique @db.VarChar(150)
  unidadCompra       UnidadMedidaEnum @map("unidad_compra")
  precioCompra       Decimal          @map("precio_compra") @db.Decimal(12, 2)
  rendimientoUnidad  Decimal          @map("rendimiento_unidad") @db.Decimal(12, 2)
  unidadMedida       UnidadMedidaEnum @map("unidad_medida")
  costoUnitario      Decimal          @map("costo_unitario") @db.Decimal(12, 2)
  cantidadDisponible Decimal          @default(0) @map("cantidad_disponible") @db.Decimal(12, 2)
  createdAt          DateTime         @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime         @updatedAt @map("updated_at") @db.Timestamptz

  recetas            RecetaItem[]
  gastos             Gasto[]

  @@index([nombre])
  @@index([costoUnitario])
  @@map("insumos")
}
```

## 3. Reglas de Negocio & UI/UX

### Cálculos y Precisión Numérica

* **Fórmula de Costo Unitario:** CostoUnitario = PrecioCompra / RendimientoUnidad.  
* **Almacenamiento:** El valor de `costo_unitario` se redondea y persiste en base de datos con **2 decimales exactos**.  
* **Precálculo Frontend:** El formulario debe ejecutar un evento `onInput` / `onChange` para recalcular y visualizar en tiempo real el CostoUnitario antes de enviar la solicitud.

### Restricciones de Formulario y Sanitización

* **Unicidad de Nombre:** Sanitizar el nombre mediante `trim()` y normalización a minúsculas antes de evaluar unicidad (ej. " Café " equivale a "café").  
* **Inmutabilidad en Edición:** En el formulario de edición, el campo Nombre debe estar deshabilitado/bloqueado (solo lectura).  
* **Mandatoriedad:** Ningún campo puede enviarse vacío (nombre, unidadCompra, precioCompra, rendimientoUnidad, unidadMedida).  
* **Límites Numéricos:** precioCompra >= 0 y rendimientoUnidad > 0.  
* **Catálogo de Unidades:** unidadCompra y unidadMedida están restringidas a: gramos, mililitros, porcion, unidades.

### Comportamiento del Listado (UX)

* **Campos por Fila:** Nombre, Unidad de compra, Precio de compra (formato moneda), Rendimiento, Unidad de medida, Costo unitario (2 decimales) y botón Editar.  
* **Orden por Defecto:** Alfabético Ascendente (A-Z) por Nombre.  
* **Criterios de Ordenamiento:**  
  * Nombre: A-Z / Z-A.  
  * Costo Unitario: Mayor a Menor / Menor a Mayor.  
* **Buscador:** Filtrado en tiempo real por coincidencia parcial en Nombre (*case-insensitive* y *accent-insensitive*).  
* **Empty State:** Si no existen registros o la búsqueda no arroja resultados, mostrar "No se encontraron insumos" y el botón hacia "Crear Insumo".  
* **Navegación:** Notificación *toast* tras guardar/editar y redirección automática a la vista de listado.

## 4. Plan de Ejecución Atómico (Secuencial)

1. **Paso 1:** Crear esquemas de Zod y tipos de TypeScript en `src/features/inventory/schemas/insumo.ts`.  
2. **Paso 2:** Crear Server Action `createInsumo` que sanitice el nombre, valide la unicidad, calcule `costoUnitario = precioCompra / rendimientoUnidad` y guarde en BD.  
3. **Paso 3:** Crear Server Action `updateInsumo` que reciba el ID, ignore modificaciones al nombre, recalcule `costoUnitario` y ejecute UPDATE.  
4. **Paso 4:** Crear Server Action `getInsumos` que retorne todos los registros ordenados por defecto A-Z por nombre.  
5. **Paso 5:** Crear Server Action `deleteInsumo` que verifique dependencias en `RecetaItem` antes de eliminar.  
6. **Paso 6:** Crear componente UI `<InsumoForm/>` reutilizable para alta y edición (con precálculo `onChange` y deshabilitación del campo nombre en modo edición).  
7. **Paso 7:** Crear componente UI `<InsumoTable/>` con filtro por buscador de texto libre, selector de ordenamiento y estado vacío.  
8. **Paso 8:** Ensamblar vistas en las rutas de Next.js (`/inventario/insumos`, `/inventario/insumos/crear`, `/inventario/insumos/[id]/editar`).

## 5. Casos Borde y Manejo de Errores

| Escenario | Comportamiento Esperado | Respuesta / Estado |
| :--- | :--- | :--- |
| **Nombre duplicado (ej. " café " vs "café")** | Detener envío y resaltar el campo Nombre. | Muestra error: "El insumo ya existe". |
| **Rendimiento <= 0** | Deshabilitar botón de guardado y cancelar precálculo. | Alerta visual: "El rendimiento debe ser mayor a 0". |
| **Precio de compra < 0** | Impedir el ingreso o enviar error de validación. | Alerta visual: "El precio de compra no puede ser negativo". |
| **Intento de modificar Nombre en PUT** | El backend ignora el parámetro nombre en la consulta SQL/Prisma. | Actualiza únicamente los campos permitidos. |
| **Eliminar insumo usado en receta** | Bloquear el borrado en base de datos. | Error: `{ error: "INSUMO_IN_USE", message: "No se puede eliminar un insumo asociado a una receta" }`. |
| **Omisión de campos obligatorios en Server Action** | Rechazar la ejecución antes de consultar la BD. | Lanza excepción de validación Zod / HTTP 400. |
| **Falla en servidor al listar** | Capturar error en la UI y mostrar mensaje amigable. | Alerta: "No se pudo cargar el listado de insumos. Intente nuevamente más tarde". |

## 6. Criterios de Aceptación (Escenarios BDD)

```gherkin
Feature: Gestión de Insumos

  # CREACIÓN DE INSUMO
  Scenario: Creación exitosa de un insumo con precálculo y redirección
    Given que el usuario se encuentra en el formulario de "Crear Insumo"
    And no existe ningún insumo registrado con el nombre "café tostado"
    When ingresa los datos: Nombre "Café Tostado", Unidad de compra "unidades", Precio "70000", Rendimiento "1000" y Unidad de medida "gramos"
    Then la pantalla calcula e indica automáticamente un costo unitario de 70.00
    And al hacer clic en "Guardar Insumo", el sistema persiste los datos en la base de datos con precisión de 2 decimales
    And muestra una notificación "Insumo creado exitosamente"
    And redirige al usuario a la pantalla del listado principal de insumos.

  Scenario: Bloqueo y validación por rendimiento menor o igual a cero
    Given que el usuario tiene un Precio de compra ingresado
    When digita el valor 0 o un número negativo en el campo "Rendimiento de la unidad"
    Then la interfaz despliega el mensaje de error "El rendimiento debe ser mayor a 0"
    And no genera la previsualización del costo unitario
    And mantiene deshabilitado el botón "Guardar Insumo".

  Scenario: Rechazo visual por nombre duplicado tras sanitización
    Given que ya existe un insumo registrado con el nombre "Café"
    When el usuario ingresa " café " en el campo Nombre y presiona "Guardar Insumo"
    Then la validación identifica la coincidencia tras la sanitización del texto
    And detiene el envío mostrando el mensaje de error "El insumo ya existe".

  Scenario: Rechazo por precio de compra negativo
    Given que el usuario ingresa un valor negativo (ej. -500) en el campo "Precio de compra"
    When el sistema valida el campo
    Then muestra la alerta de validación "El precio de compra no puede ser negativo"
    And evita el guardado de la información.

  # EDICIÓN DE INSUMO
  Scenario: Edición exitosa de un insumo con precálculo
    Given que el usuario selecciona "Editar" en el insumo "Café Tostado" desde el listado general
    And la interfaz carga los datos precargados con el campo Nombre bloqueado
    When modifica el "Precio de compra" a 85000 y mantiene el "Rendimiento" en 1000
    Then la pantalla calcula dinámicamente el costo unitario en 85.00
    And al hacer clic en "Guardar Cambios", el servidor persiste la actualización en la base de datos
    And muestra la notificación "Insumo actualizado exitosamente"
    And redirige al usuario a la pantalla del listado principal.

  Scenario: Bloqueo de edición en el nombre del insumo
    Given que el usuario se encuentra en el formulario de edición de un insumo
    When intenta enfocar o modificar el campo "Nombre del insumo"
    Then el campo permanece deshabilitado/solo lectura impidiendo la modificación.

  Scenario: Cancelación y descarte de cambios en edición
    Given que el usuario realiza modificaciones en el formulario de edición
    When presiona el botón "Cancelar"
    Then la interfaz descarta todos los cambios sin ejecutar peticiones de actualización
    And redirige al usuario al listado principal de insumos.

  # LISTADO Y BÚSQUEDA
  Scenario: Carga inicial exitosa con orden alfabético A-Z por defecto
    Given que existen insumos registrados en el sistema
    When el usuario navega a la pantalla del listado de insumos
    Then la interfaz invoca la consulta de insumos
    And despliega la totalidad de los insumos ordenados alfabéticamente de la A-Z por Nombre
    And cada fila presenta sus datos completos y el botón de acción "Editar".

  Scenario: Búsqueda de insumo por texto libre case-insensitive
    Given que la pantalla muestra el listado de insumos
    When el usuario escribe "café" en el campo de búsqueda
    Then la interfaz filtra dinámicamente y muestra únicamente los insumos cuyo nombre coincida.

  Scenario: Ordenamiento por Costo Unitario de Mayor a Menor
    Given que el usuario visualiza la lista de insumos
    When selecciona la opción de ordenamiento "Costo unitario: Mayor a Menor"
    Then la vista reordena los ítems posicionando en primer lugar el insumo con el costo unitario más elevado.

  Scenario: Visualización de estado vacío sin registros
    Given que no existen insumos registrados en la base de datos o la búsqueda no genera resultados
    When el usuario ingresa a la pantalla o filtra sin coincidencias
    Then el sistema no muestra filas en la tabla
    And presenta el mensaje "No se encontraron insumos" junto al botón de acceso a "Crear Insumo".

## 7. Definición de Hecho (DoD)

- [ ] `npx tsc --noEmit` ejecuta sin ningún error de tipos.  
- [ ] `npm run lint` pasa sin advertencias ni errores.  
- [ ] Test unitario que valida que CostoUnitario calcula exactamente PrecioCompra / RendimientoUnidad y redondea a 2 decimales.  
- [ ] Test unitario que valida la sanitización del nombre (`trim` y `toLowerCase`).  
- [ ] Pruebas de integración para las Server Actions de creación, edición y búsqueda.  
- [ ] Verificación manual en interfaz responsive para escritorio y dispositivos móviles.