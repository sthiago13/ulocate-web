# 📍 U-Locate GPS

**No te pierdas en el campus.** Un mapa interactivo de navegación y geolocalización desarrollado específicamente para la comunidad de la Universidad Nacional Experimental del Táchira (UNET).

## 🚀 Características Principales

* **🗺️ Navegación Inteligente:** Encuentra la ruta más óptima entre edificios, aulas, laboratorios y zonas usando un motor de rutas propio basado en grafos (Nodos y Tramos) sobre un mapa interactivo.
* **⚡ Rendimiento Optimizado:** Carga de datos rápida y fluida gracias a la implementación de caché inteligente, mitigando los problemas de conexiones inestables.
* **🔐 Autenticación Exclusiva:** Acceso restringido a la comunidad universitaria validando correos institucionales (`@unet.edu.ve`) mediante Supabase Auth.
* **⚙️ Panel de Administración:** Interfaz robusta y dedicada para que los administradores gestionen la topología del mapa (nodos, tramos), editen ubicaciones, categorías y controlen accesos en tiempo real.
* **💾 Experiencia Personalizada:** Perfiles de usuario donde se pueden guardar lugares favoritos, revisar el historial de rutas y gestionar notificaciones.
* **📱 Diseño Responsivo:** Interfaz moderna y adaptada tanto para computadoras de escritorio como para dispositivos móviles.

## 🛠️ Tecnologías Utilizadas

### Frontend & UI
* **[React 19](https://react.dev/) + [Vite](https://vitejs.dev/):** Framework y empaquetador ultrarrápido para la interfaz de usuario.
* **[Tailwind CSS](https://tailwindcss.com/):** Estilos y diseño responsivo ágil.
* **[Framer Motion](https://www.framer.com/motion/):** Animaciones fluidas para modales, paneles laterales y menús.
* **[Three.js](https://threejs.org/) & React Three Fiber:** Utilizados exclusivamente para renderizar el elemento 3D interactivo (`Earth3D`) en la Landing Page.

### Mapas & Geolocalización
* **[Leaflet](https://leafletjs.com/) & React-Leaflet:** Motor principal para el renderizado interactivo del campus.
* **OpenStreetMap & GeoJSON:** Proveedor de mapas base y delimitación técnica del perímetro universitario.

### Estado & Gestión de Datos
* **[TanStack Query (React Query)](https://tanstack.com/query/latest):** Manejo del estado del servidor, caché de datos de Supabase y optimización de peticiones para usuarios y administradores.
* **React Router Dom:** Manejo de rutas del lado del cliente y protección de vistas según el rol del usuario.

### Backend & Base de Datos
* **[Supabase](https://supabase.com/):** Backend as a Service (BaaS) integral.
* **PostgreSQL:** Base de datos relacional que gestiona la topología espacial, entidades del campus y perfiles.
* **PostgreSQL Triggers & RLS (Row Level Security):** Seguridad a nivel de fila y validación estricta para proteger la integridad de los datos.

---

## ⚙️ Requisitos Previos

Para ejecutar este proyecto en tu entorno local, necesitas tener instalado:
* [Node.js](https://nodejs.org/) (Versión 18 o superior)
* npm, yarn o pnpm
* CLI de Supabase (Opcional, para manejar migraciones y la base de datos localmente)

## 💻 Instalación y Configuración Local

1. **Clona el repositorio**
   ```bash
   git clone [https://github.com/TU_USUARIO/ulocate-web.git](https://github.com/TU_USUARIO/ulocate-web.git)
   cd ulocate-web
   
2. **Instala las dependencias**

   ```bash
   npm install
   
3. **Configura las variables de entorno**
Crea un archivo .env.local en la raíz del proyecto y solicita las credenciales al equipo:

   ```Fragmento de código
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_llave_publica_de_supabase

4. **Inicia el servidor de desarrollo**

   ```Bash
   npm run dev

La aplicación estará disponible en http://localhost:5173 (tu entorno local por defecto proporcionado por Vite).

## 🗄️ Arquitectura del Sistema
El sistema se divide en varios bloques lógicos clave:

* **Core Espacial:** El campus se modela como un grafo matemático. Las coordenadas actúan como Nodos y las distancias físicas determinan el peso de los Tramos para el algoritmo de enrutamiento (routeEngine.js).

* **Sincronización de Datos:** Los custom hooks centralizan las llamadas a la base de datos, separando la lógica de lectura rápida (caché para estudiantes) de la lógica de escritura estricta (invalidación para administradores).

* **Gestión de Usuarios:** Perfiles protegidos y enlazados directamente al UUID del proveedor de Auth.

(Las migraciones SQL y la estructura exacta de las tablas se encuentran en la configuración de Supabase del proyecto).

---

## 👥 Equipo de Desarrollo
Este proyecto está siendo desarrollado como un esfuerzo colaborativo por un equipo de 3 estudiantes de Ingeniería Informática para las asignaturas de Sistemas de Información I y Multimedia.

Hecho con ❤️ para la comunidad de la UNET.
