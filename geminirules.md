# 📜 GEMINI.md - Reglas Globales del Proyecto y Guía del Agente

## ☕ 1. Visión General del Proyecto (Contexto del Dominio)
- **Nombre del Proyecto:** la·Pausa Café - POS Móvil, Gestión e Inventario[cite: 10]
- **Ubicación:** Bucaramanga, Colombia
- **Manifiesto de Marca:** "Creemos que parar también es avanzar, que darse un momento no es perder el ritmo, sino encontrarlo. No es solo café: es ese espacio que te das para bajar la velocidad, recargar energía y volver a ti..."[cite: 10]
- **Propósito:** Sistema web integral enfocado en la trazabilidad de insumos, costeo automático de recetas, toma ágil de pedidos desde dispositivos móviles (Mobile-First para baristas/bartenders) y control financiero del negocio (ventas, costos históricos y gastos).

### 👥 Audiencia / Personas[cite: 9]
1. **Barista / Bartender (POS Móvil):** Requiere una interfaz táctil rápida en su celular para registrar pedidos sin fricción, calcular cobros y descontar insumos automáticamente.
2. **Administrador / Dueño:** Encargado de cargar insumos, construir recetas, asignar precios de venta con márgenes en tiempo real, registrar gastos (operativos e insumos) y auditar el cierre financiero diario/mensual.

---

## 🤖 2. Rol de la IA e Instrucciones de Ejecución[cite: 9]
1. **Rol del Agente:** Arquitecto de Software Full-Stack Senior y Mentor Técnico[cite: 9].
2. **Explicación Previa:** Antes de escribir o modificar código, la IA debe explicar brevemente el *porqué* de las decisiones técnicas y la ubicación exacta de los archivos a intervenir[cite: 9].
3. **Refactorización Proactiva:** Si un archivo supera las 150 líneas de código o la arquitectura pierde cohesión, la IA debe sugerir la división en submódulos inmediatamente[cite: 9].

---

## 🛠️ 3. Stack Tecnológico & Convenciones Universales

### Stack[cite: 8]
- **Framework:** Next.js (App Router) con TypeScript (modo estricto)[cite: 8].
- **Estilos & UI:** TailwindCSS (Estrategia Mobile-First obligatoria)[cite: 8].
- **Validación & Contratos:** Zod (para formularios y payload de Server Actions)[cite: 8].
- **Base de Datos & ORM:** Prisma ORM conectado a PostgreSQL en Supabase[cite: 8].
- **Mutaciones:** Server Actions exclusivamente (evitar API REST tradicionales salvo webhooks/integraciones externas)[cite: 8].

### Convenciones de Código[cite: 9]
- **Modularidad por Feature:** Agrupar el código por dominios dentro de `src/features/` (ej. `inventory/`, `pos/`, `expenses/`)[cite: 9].
- **Límite de Tamaño:** Archivos delimitados a un máximo de 150 líneas[cite: 9].
- **Seguridad e Higiene:** Prohibido escribir credenciales o cadenas de conexión en texto plano. Usar siempre variables de entorno (`.env`)[cite: 9].
- **Resiliencia:** Manejo explícito de errores (`try/catch`) en Server Actions y respuestas estructuradas `{ success: boolean, error?: string, data?: T }`[cite: 9].
- **Código Limpio:** Prohibido entregar código con `console.log()` de prueba o bloques comentados sin uso[cite: 9].

---

## 🛡️ 4. Invariantes del Sistema (Reglas Negativas OBLIGATORIAS)[cite: 8]

1. **Snapshot e Inmutabilidad Histórica:** JAMÁS relaciones el costo o precio de un `DetallePedido` mediante claves foráneas directas a los precios dinámicos actuales de `Productos` o `Insumos`[cite: 8]. Precios y costos DEBEN copiarse como valores numéricos planos (`precioVentaHistorico`, `costoHistorico`) en el instante exacto del checkout[cite: 8].
2. **Transaccionalidad Atómica:** El checkout de una orden y el descuento de inventario de sus recetas correspondientes deben ejecutarse obligatoriamente dentro de una sola transacción de base de datos (`prisma.$transaction`)[cite: 8].
3. **Afectación de Stock por Gastos:** El registro de un gasto de tipo 'INSUMO' DEBE incrementar `cantidadDisponible` en la tabla `Insumo` en la misma transacción de base de datos[cite: 8].
4. **Estándar Numérico:** Todos los cálculos monetarios y de cantidades deben usar precisión decimal (`Decimal` de Prisma / TypeScript) para evitar errores de redondeo en coma flotante[cite: 8].
5. **Cero 'any':** Strict TypeScript en todo el código base.

---

## 📁 5. Arquitectura Estricta de Directorios[cite: 9]

```text
/
├── GEMINI.md                         # Nivel 1: Reglas globales del proyecto
├── specs/                            # Especificaciones y Specs por módulo
│   ├── inventory-and-recipes/        # Módulo de Insumos y Productos
│   │   ├── overview.md               # Nivel 2: Visión general del módulo
│   │   ├── 01-insumos-crud.md        # Nivel 3: Spec atómico
│   │   ├── 02-recipe-builder.md      # Nivel 3: Spec atómico
│   │   └── 03-pricing-margins.md     # Nivel 3: Spec atómico
│   ├── pos-and-orders/               # Módulo de POS Móvil y Cierre
│   │   ├── overview.md               # Nivel 2: Visión general del módulo
│   │   ├── 01-pos-mobile-interface.md# Nivel 3: Spec atómico
│   │   ├── 02-order-checkout.md      # Nivel 3: Spec atómico
│   │   ├── 03-daily-closure.md       # Nivel 3: Spec atómico
│   │   └── 04-cancel-order-restock.md# Nivel 3: Spec atómico
│   └── expenses/                     # Módulo de Gastos y Abasto
│       ├── overview.md               # Nivel 2: Visión general del módulo
│       └── 01-unified-expenses.md    # Nivel 3: Spec atómico
├── prisma/
│   └── schema.prisma                 # Modelos de datos relacionales
├── public/                           # Recursos estáticos
├── src/
│   ├── app/                          # Rutas de Next.js (App Router)
│   ├── components/                   # UI compartida (botones, modales, tablas)
│   ├── features/                     # Módulos de dominio
│   │   ├── inventory/
│   │   │   ├── actions/              # Server Actions (Insumos/Productos)
│   │   │   ├── components/           # UI específica del módulo
│   │   │   └── schemas/              # Validaciones Zod
│   │   ├── pos/
│   │   └── expenses/
│   ├── lib/                          # Configuración Prisma, Supabase y utilidades
│   └── types/                        # Tipos globales de TypeScript
└── .env                              # Variables de entorno
```

---

## 🎨 6. Identidad de Marca y Sistema de Diseño (la·Pausa Café)[cite: 10]

### 🎨 Paleta de Colores Oficial[cite: 10]
- **Fondo Principal (Blanco Crema / Off-White):** `#F4EEE2` (RGB: 244, 238, 226)[cite: 10]
  - *Uso:* Fondo general de la interfaz, tarjetas limpias y contenedores principales[cite: 10].
- **Acento Primario (Terracota / Rojo Ladrillo):** `#A13E21` (RGB: 161, 62, 33)[cite: 10]
  - *Uso:* Botones de acción principal, marca, resaltados de precios y estados activos[cite: 10].
- **Acento Secundario (Dorado Miel):** `#B49659` (RGB: 180, 150, 89)[cite: 10]
  - *Uso:* Insignias, bordes sutiles, métricas destacadas y elementos secundarios[cite: 10].
- **Acento Menta Suave (Verde Salvia Claro):** `#B8CCC5` (RGB: 184, 204, 197)[cite: 10]
  - *Uso:* Badges de éxito, fondos de interacción suave y chips de categoría[cite: 10].
- **Tono Oscuro (Verde Oliva Profundo):** `#6E6C41` (RGB: 110, 108, 65)[cite: 10]
  - *Uso:* Textos de encabezados, iconos contrastados y elementos de jerarquía alta[cite: 10].

### 🔤 Tipografías Oficiales[cite: 10]
- **Titulares & Display:** `Ramus Semi Bold` (Para logos, títulos principales de sección y tarjetas destacadas)[cite: 10].
- **Cuerpo, UI & Formularios:** `Early Sans Variable` (Para textos explicativos, etiquetas de formularios, botones e inputs)[cite: 10].

### 🚫 Usos Incorrectos de Marca (Reglas Negativas de UI)[cite: 10]
- **NO** quitar el relleno sólido a los isotipos o identificadores visuales[cite: 10].
- **NO** girar, inclinar o distorsionar los elementos del logo[cite: 10].
- **NO** alterar la jerarquía tipográfica entre "la·Pausa" y "Café"[cite: 10].
- **NO** aplicar efectos de relieve, sombras 3D toscas o biselados[cite: 10].
- **NO** usar colores ajenos a la paleta oficial (prohibido azulejos brillantes, verdes neón o negros puros `#000000`)[cite: 10].
- **NO** encerrar la marca en contenedores circulares o marcos innecesarios[cite: 10].

---

## ✅ 7. Definición de Hecho (DoD) Universal

Para dar por completada cualquier tarea o spec, se debe verificar:
- [ ] `npx tsc --noEmit` pasa sin ningún error de compilación.
- [ ] `npm run lint` no emite errores ni advertencias de estilo.
- [ ] Las validaciones de datos de entrada se realizan con Zod tanto en frontend como en backend.
- [ ] La interfaz ha sido probada en viewport móvil (Mobile-First) y responde sin desbordamientos ni lentitud táctil.
- [ ] La interfaz respeta la paleta de colores y las fuentes oficiales de **la·Pausa Café**[cite: 10].

---

## 📐 8. Metodología de Especificaciones (Spec-Driven Development)

Para garantizar la precisión en el desarrollo y evitar alucinaciones o refactorizaciones masivas, este repositorio utiliza una arquitectura de contexto en 3 niveles de granularidad:

### 📑 Jerarquía de Documentación

| Nivel | Archivo / Ubicación | Ámbito y Responsabilidad para el Agente |
| :--- | :--- | :--- |
| **Nivel 1 (Global)** | `GEMINI.md` | **Reglas Permanentes:** Stack técnico, invariantes de negocio globales, marca la·Pausa Café, arquitectura de carpetas y convenciones de código. Siempre activo en cada sesión.[cite: 10] |
| **Nivel 2 (Módulo)** | `specs/<modulo>/overview.md` | **Visión de Dominio:** Modelo de datos Prisma del sub-sistema, invariantes del módulo, límites de alcance y secuencia ordenada de desarrollo. <br><br>• `specs/inventory-and-recipes/overview.md`<br>• `specs/pos-and-orders/overview.md`<br>• `specs/expenses/overview.md` |
| **Nivel 3 (Atómico)** | `specs/<modulo>/<tarea>.md` | **Prompt Ejecutable:** Contratos de validación Zod, plan de ejecución paso a paso, casos borde y criterios de aceptación BDD del ticket específico. <br><br>• **Módulo Insumos y Recetas:** `01-insumos-crud.md`, `02-recipe-builder.md`, `03-pricing-margins.md`<br>• **Módulo POS y Pedidos:** `01-pos-mobile-interface.md`, `02-order-checkout.md`, `03-daily-closure.md`, `04-cancel-order-restock.md`<br>• **Módulo Gastos:** `01-unified-expenses.md` |

---

### 🔄 Protocolo de Trabajo para el Agente (IA)

1. **Aislamiento de Contexto (One Spec at a Time):**
   - Durante cualquier sesión de trabajo, la IA debe recibir únicamente:
     - `GEMINI.md` (Nivel 1)
     - `specs/<modulo>/overview.md` correspondiente (Nivel 2)
     - El spec atómico `specs/<modulo>/<tarea>.md` específico a desarrollar (Nivel 3)
   - *Regla:* Queda strictly prohibido cargar specs atómicos de otras tareas o módulos finalizados en la misma sesión.

2. **Ejecución Secuencial Atómica:**
   - La IA debe seguir el **Plan de Ejecución Atómico (Sección 4 del Nivel 3)** en orden numérico estricto paso a paso.
   - Tras completar cada paso, se deben verificar los tipos con `npx tsc --noEmit` antes de avanzar al siguiente.

3. **Inmutabilidad y Specs de Delta:**
   - Una vez que los criterios de aceptación (BDD) de un spec atómico de Nivel 3 son cumplidos y aprobados, el spec se considera **cerrado y finalizado**.
   - Si surge un ajuste o refactorización sobre código previamente entregado, **NUNCA se modifica el spec viejo**. Se creará un nuevo spec atómico de incremento (`specs/<modulo>/XX-delta-mejora.md`) declarando únicamente los contratos y archivos modificados.