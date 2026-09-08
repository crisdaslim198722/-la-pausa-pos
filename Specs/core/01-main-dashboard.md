# Spec Atómico: 01-main-dashboard (Menú Principal / Launchpad)

## 1. Visión General & Alcance
* **Objetivo:** Construir la página de inicio (Landing Page) en la ruta raíz (`/`) que funcione como el panel de control central (Launchpad) de **la·Pausa Café**. Proveerá accesos directos y organizados a todos los módulos desarrollados previamente.
* **Experiencia de Usuario (UX):** Diseño limpio, espacioso y Mobile-First. Uso de tarjetas grandes con íconos representativos para facilitar la navegación táctil en pantallas de tablets o celulares.
* **Fuera de alcance:** Sistema de Autenticación de Usuarios (roles/permisos) se mantiene fuera de este spec y podrá abordarse en el futuro.

---

## 2. Estructura de Navegación (Módulos Existentes)

La interfaz agrupará los enlaces en categorías lógicas de negocio:

### ☕ Punto de Venta (Operación)
* **Toma de Pedidos (POS):** (`/pos`) - Interfaz de caja para registrar ventas rápidamente.
* **Seguimiento de Órdenes:** (`/pos/ordenes`) - Tablero Kanban para gestión de pedidos activos, despachos y cobros.

### 📦 Inventario y Catálogo (Gestión)
* **Gestión de Insumos:** (`/inventario/insumos`) - Control de stock, compras y costos unitarios.
* **Constructor de Recetas:** (`/productos`) - Creación de productos finales y desglose de ingredientes.

### 💰 Finanzas y Estrategia (Administración)
* **Precios y Márgenes:** (`/inventario/precios`) - Simulador de rentabilidad y asignación de precios de venta.
* **Reportes y Cierres:** (`/reportes`) - Métricas de ventas, ganancias, y productos más vendidos por rango de fechas.

---

## 3. Reglas de Negocio & UI/UX

1. **Reemplazo de Redirección:** Actualmente la ruta raíz (`/`) redirige automáticamente a `/inventario/insumos` (definido en Specs anteriores). Se eliminará esa redirección para renderizar el nuevo componente `HomeDashboard`.
2. **Diseño Visual:**
   * Encabezado de bienvenida con la marca corporativa de "la·Pausa Café".
   * Tarjetas interactivas con efecto *hover* (escalado ligero) utilizando la paleta de colores del negocio (Tierra, Naranja Cobrizo, Verde Oliva).
3. **Métricas Rápidas (Opcional pero recomendado):** En el encabezado del menú principal, se podría mostrar un pequeño resumen en vivo (ej. "Órdenes activas hoy" o "Ventas del día") llamando al Server Action ya existente de métricas, para dar un vistazo rápido sin entrar al módulo completo de reportes.

---

## 4. Plan de Ejecución Atómico (Secuencial)

* [ ] **Paso 1:** Reemplazar el archivo `src/app/page.tsx`. Quitar la redirección.
* [ ] **Paso 2:** Importar iconos desde `lucide-react` para cada módulo.
* [ ] **Paso 3:** Llamar a la acción `getFinancialMetrics()` del día de "Hoy" para inyectar una mini-tarjeta de resumen en la parte superior.
* [ ] **Paso 4:** Diseñar la grilla de tarjetas (Grid) agrupadas por las 3 categorías mencionadas.

---

## 5. Definición de Hecho (DoD)
* [ ] El usuario ingresa a `http://localhost:3000/` y ve el Launchpad en lugar de ser redirigido.
* [ ] Todos los enlaces dirigen correctamente a sus respectivos módulos sin errores 404.
* [ ] `npm run build` compila sin errores.
