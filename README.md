# 📍 U-Locate 

**No te pierdas en el campus.** Un mapa interactivo de navegación y geolocalización desarrollado específicamente para la comunidad de la Universidad Nacional Experimental del Táchira (UNET).

## 🚀 Características Principales

* **🗺️ Navegación Inteligente:** (En desarrollo) Encuentra la ruta más óptima entre edificios, aulas, laboratorios y zonas administrativas usando un sistema de grafos (Nodos y Tramos).
* **🔐 Autenticación Exclusiva:** Acceso restringido a la comunidad universitaria validando correos institucionales (`@unet.edu.ve`) mediante Supabase Auth.
* **💾 Lugares Favoritos:** Los usuarios pueden guardar ubicaciones concurrentes en su perfil personal para acceso rápido.
* **📱 Diseño Responsivo:** Interfaz adaptada tanto para computadoras de escritorio como para dispositivos móviles.

## 🛠️ Tecnologías Utilizadas

### Frontend
* **[React](https://reactjs.org/) + [Vite](https://vitejs.dev/):** Framework y empaquetador ultrarrápido para la interfaz de usuario.
* **[Tailwind CSS](https://tailwindcss.com/):** Estilos y diseño responsivo.
* **[Framer Motion](https://www.framer.com/motion/):** Animaciones fluidas para modales y menús.
* **[Three.js](https://threejs.org/):** Renderizado del mapa interactivo en 3D del campus.
* **React Router Dom:** Manejo de rutas y navegación protegida.

### Backend & Base de Datos
* **[Supabase](https://supabase.com/):** Backend as a Service (BaaS).
* **PostgreSQL:** Base de datos relacional para gestionar la topología del mapa (Tramos y Nodos), usuarios y permisos.
* **PostgreSQL Triggers & RLS:** Seguridad a nivel de fila y validación estricta en la base de datos para el flujo de registro.

---

## ⚙️ Requisitos Previos

Para ejecutar este proyecto en tu entorno local, necesitas tener instalado:
* [Node.js](https://nodejs.org/) (Versión 18 o superior)
* npm, yarn o pnpm
* CLI de Supabase (Opcional, para manejar migraciones localmente)

## 💻 Instalación y Configuración Local

1. **Clona el repositorio**
   ```bash
   git clone [https://github.com/TU_USUARIO/ulocate-web.git](https://github.com/TU_USUARIO/ulocate-web.git)
   cd ulocate-web
   ```

2. **Instala las dependencias**

```bash
npm install
```

3. **Configura las variables de entorno**
Crea un archivo .env.local en la raíz del proyecto y solicita las credenciales al equipo:

```bash
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_llave_publica_de_supabase
```

4. **Inicia el servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (tu entorno local por defecto proporcionado por Vite).

## 🗄️ **Arquitectura de la Base de Datos**
El sistema utiliza una estructura relacional dividida en dos bloques:

* **Gestión de Usuarios:** Perfiles públicos enlazados al UUID de Supabase Auth, protegidos por políticas RLS.
* **Topología del Mapa:** El campus se modela como un grafo usando Nodos (Coordenadas) y Tramos (Conexiones con peso en distancia), agrupados en Zonas y Categorías para facilitar las búsquedas.

(Las migraciones SQL y la estructura exacta se encuentran en la carpeta supabase/migrations/).

## 👥 Equipo de Desarrollo
Este proyecto está siendo desarrollado como un esfuerzo colaborativo por un equipo de 3 estudiantes de Ingeniería Informática para las asignaturas de Sistemas de Información I y Multimedia.

Hecho con ❤️ para la comunidad de la UNET.