# Reporte de Integración y Nuevos Componentes (feat/local-navigation-v2)

Este documento detalla todos los componentes, utilidades y estructuras de base de datos introducidos recienemente en esta rama que **no estaban presentes en la rama `main`** original del equipo. Fueron organizados y documentados para facilitar su revisión al momento de hacer *Merge*.

## 1. Organización de Archivos (Refactorización)

Para mantener el orden de la arquitectura, todos los componentes administrativos y modales auxiliares añadidos fueron reubicados dentro de `src/components/common/`. 

*   **Antes:** `src/components/GestionarCategorias.jsx`
*   **Ahora:** `src/components/common/GestionarCategorias.jsx`

Las importaciones relativas (como `InputField` y `Button`) fueron actualizadas para resolver correctamente dentro del directorio `common/`.

## 2. Nuevos Componentes Añadidos

Se añadieron nuevos componentes orientados a la gestión administrativa de la aplicación y la renderización en el mapa:

### Map Engine & Routing
*   **`src/components/CampusMap.jsx`**: *(Modificado/Evolucionado gravemente desde `main`)* Se convirtió en el motor principal de navegación incorporando Leaflet, modo edición de administrador, renderizado de polígonos GeoJSON y el listener del evento global `route_triggered` para iniciar el trazado de Dijkstra desde el destino hacia el GPS del usuario.

### Componentes de Administración (Nuevos en `common/`)
*   **`AdminRoutesPanel.jsx`**: Cajón lateral que permite habilitar el modo "Editor de Rutas" y observar los contadores en vivo de cuántos Nodos y Tramos existen localmente.
*   **`GestionarCategorias.jsx`**: Panel para listar y buscar todas las categorías registradas en Supabase.
*   **`CrearCategoria.jsx` / `EditarCategoria.jsx`**: Sub-modales para inserción y modificación en la tabla `Categoria` (asignando su ícono correspondiente).
*   **`GestionarEventos.jsx`**: Panel que permite administrar los eventos en el mapa.
*   **`CrearEvento.jsx` / `EditarEvento.jsx`**: Sub-modales conectados a la nueva tabla `Evento` de Supabase incluyendo `Lugar`, `Fecha_Inicio` y descripción.
*   **`GestionarUsuarios.jsx` / `EditarUsuario.jsx` / `InvitarUsuario.jsx`**: Interfaces diseñadas para operaciones de administración de cuentas.
*   **`Spinner.jsx`**: Componente visual ligero de carga reutilizado en las listas de resultados.

## 3. Nuevas Utilidades (src/utils/)

El equipo contaba únicamente con lógicas superficiales. Se introdujo una carpeta de herramientas vitales:

*   **`localDB.js`**: Puente transicional y capa de caché (`localStorage`) que provee métodos sincrónicos como `getNodes()`, `getTramos()`, y sincroniza los ID de `Supabase` evitando que la aplicación se congele al hacer cálculos geográficos.
*   **`routeEngine.js`**: Contiene la lógica matemática (`getDistance`, y la función de Grafo `findShortestPath`) para trazar las rutas usando el algoritmo de Dijkstra.
*   **`formatters.js`**: Agrupación de formatos para mostrar distancias, horas am/pm en el mapa.

## 4. Archivos de Base de Datos y Datos

*   **`une.geojson`**: Archivo de delimitación geográfica agregado en la raíz del proyecto para crear la "máscara oscura" excluyendo todo fuera del campus en Leaflet y delimitando los polígonos de la universidad.
*   **Carpeta `supabase/migrations/`**:
    *   `20260408040000_creacion_tabla_evento.sql`: Introduce la tabla "Evento" para enlazarla al lugar de la app.
    *   `20260407223727_historial_y_notificaciones.sql`: Introduce esquemas vitales orientados a reportes de rutas del GPS.

---
**Nota para el equipo:** La integración mantiene 100% compatibles los componentes visuales CSS diseñados en `main` (`TarjetaUbicacion`, `GestionarLugares`, `EditorLugar` y `SearchPanel`), los cuales tienen **inyectados los hooks de Supabase y Dijkstra por detrás** sin romper su vista visual original.
