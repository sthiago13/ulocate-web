-- 1. Creamos el tipo ENUM para los días de la semana
CREATE TYPE dias_semana AS ENUM
(
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
);

-- 2. Creación de tablas
CREATE TABLE "Rol"
(
    "ID_Rol" SERIAL PRIMARY KEY,
    "Nombre_Rol" VARCHAR(50) NOT NULL
);

CREATE TABLE "Usuario"
(
    "ID_Usuario" UUID PRIMARY KEY,
    -- Enlazado con auth.users de Supabase
    "Nombre" VARCHAR(100) NOT NULL,
    "Correo" VARCHAR(100) UNIQUE NOT NULL,
    "ID_Rol" INT NOT NULL,
    "Activo" BOOLEAN DEFAULT true
);

CREATE TABLE "Categoria"
(
    "ID_Categoria" SERIAL PRIMARY KEY,
    "Nombre_Categoria" VARCHAR(100) NOT NULL,
    "Icono" TEXT
    -- Cambiado a TEXT para URLs largas
);

CREATE TABLE "Zona"
(
    "ID_Zona" SERIAL PRIMARY KEY,
    "Nombre_Zona" VARCHAR(100) NOT NULL
);

CREATE TABLE "Nodo"
(
    "ID_Nodo" SERIAL PRIMARY KEY,
    "Latitud" DECIMAL(10,8) NOT NULL,
    "Longitud" DECIMAL(11,8) NOT NULL
);

CREATE TABLE "Tramo"
(
    "ID_Tramo" SERIAL PRIMARY KEY,
    "ID_Nodo_Origen" INT NOT NULL,
    "ID_Nodo_Destino" INT NOT NULL,
    "Distancia_Metros" DECIMAL(8,2) NOT NULL
    -- Mantenemos esto para cálculos de rutas
);

CREATE TABLE "Ubicacion"
(
    "ID_Ubicacion" SERIAL PRIMARY KEY,
    "Nombre" VARCHAR(100) NOT NULL,
    "Descripcion" TEXT,
    "Detalles_Extras" TEXT,
    "Acceso_Publico" BOOLEAN DEFAULT true,
    "ID_Categoria" INT NOT NULL,
    "ID_Zona" INT,
    "ID_Nodo" INT NOT NULL
);

CREATE TABLE "Referencias_Visuales"
(
    "ID_Referencia" SERIAL PRIMARY KEY,
    "ID_Ubicacion" INT NOT NULL,
    "Descripcion" TEXT,
    "URL_Imagen" TEXT
    -- Cambiado a TEXT para URLs de Supabase Storage
);

CREATE TABLE "Ubicacion_Guardada"
(
    "ID_Guardado" SERIAL PRIMARY KEY,
    "ID_Usuario" UUID NOT NULL,
    "ID_Ubicacion" INT NOT NULL,
    "Titulo_Guardado" VARCHAR(100) NOT NULL,
    "Dia_Semana" dias_semana,
    -- Usamos el ENUM que creamos arriba
    "Hora" TIME,
    "Datos_Adicionales" TEXT
);

-- 3. Definición de Relaciones (Foreign Keys)
ALTER TABLE "Usuario" ADD FOREIGN KEY ("ID_Rol") REFERENCES "Rol" ("ID_Rol");
ALTER TABLE "Tramo" ADD FOREIGN KEY ("ID_Nodo_Origen") REFERENCES "Nodo" ("ID_Nodo");
ALTER TABLE "Tramo" ADD FOREIGN KEY ("ID_Nodo_Destino") REFERENCES "Nodo" ("ID_Nodo");
ALTER TABLE "Ubicacion" ADD FOREIGN KEY ("ID_Categoria") REFERENCES "Categoria" ("ID_Categoria");
ALTER TABLE "Ubicacion" ADD FOREIGN KEY ("ID_Zona") REFERENCES "Zona" ("ID_Zona");
ALTER TABLE "Ubicacion" ADD FOREIGN KEY ("ID_Nodo") REFERENCES "Nodo" ("ID_Nodo");
ALTER TABLE "Ubicacion_Guardada" ADD FOREIGN KEY ("ID_Usuario") REFERENCES "Usuario" ("ID_Usuario");
ALTER TABLE "Ubicacion_Guardada" ADD FOREIGN KEY ("ID_Ubicacion") REFERENCES "Ubicacion" ("ID_Ubicacion");
ALTER TABLE "Referencias_Visuales" ADD FOREIGN KEY ("ID_Ubicacion") REFERENCES "Ubicacion" ("ID_Ubicacion");