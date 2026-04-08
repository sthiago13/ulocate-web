-------------------------------------------------------------------------
-- 1. ACTUALIZAR TABLA USUARIO CON PREFERENCIAS DE NOTIFICACIÓN
-------------------------------------------------------------------------
ALTER TABLE "Usuario" 
ADD COLUMN "Notif_Alertas_Globales" BOOLEAN DEFAULT true,
ADD COLUMN "Notif_Recordatorios" BOOLEAN DEFAULT true;

-------------------------------------------------------------------------
-- 2. CREAR TABLA PARA EL HISTORIAL DE RUTAS
-------------------------------------------------------------------------
CREATE TABLE "Historial_Ruta"
(
    "ID_Historial" SERIAL PRIMARY KEY,
    "ID_Usuario" UUID NOT NULL REFERENCES "Usuario"("ID_Usuario") ON DELETE CASCADE,
    "ID_Ubicacion_Origen" INT REFERENCES "Ubicacion"("ID_Ubicacion") ON DELETE SET NULL,
    "ID_Ubicacion_Destino" INT REFERENCES "Ubicacion"("ID_Ubicacion") ON DELETE SET NULL,
    "Fecha_Hora" TIMESTAMP
    WITH TIME ZONE DEFAULT timezone
    ('utc'::text, now
    ()),
    "Distancia_Total_Metros" DECIMAL
    (8,2) -- Opcional, para estadísticas futuras
);

    -------------------------------------------------------------------------
    -- 3. CREAR TABLA PARA ALERTAS/AVISOS GLOBALES (ADMINS)
    -------------------------------------------------------------------------
    CREATE TABLE "Alerta_Global"
    (
        "ID_Alerta" SERIAL PRIMARY KEY,
        "ID_Admin_Creador" UUID REFERENCES "Usuario"("ID_Usuario"),
        "Titulo" VARCHAR(100) NOT NULL,
        "Mensaje" TEXT NOT NULL,
        "ID_Ubicacion" INT REFERENCES "Ubicacion"("ID_Ubicacion") ON DELETE SET NULL,
        -- Relación con el lugar afectado
        "Fecha_Creacion" TIMESTAMP
        WITH TIME ZONE DEFAULT timezone
        ('utc'::text, now
        ()),
    "Fecha_Expiracion" TIMESTAMP
        WITH TIME ZONE, -- Para que los avisos desaparezcan solos
    "Activa" BOOLEAN DEFAULT true
);

        -------------------------------------------------------------------------
        -- 4. POLÍTICAS RLS PARA LAS NUEVAS TABLAS
        -------------------------------------------------------------------------
        -- Seguridad para Historial_Ruta
        ALTER TABLE "Historial_Ruta" ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Usuarios ven su propio historial" ON "Historial_Ruta" FOR
        SELECT
            USING (auth.uid() = "ID_Usuario");

        CREATE POLICY "Usuarios insertan en su propio historial" ON "Historial_Ruta" FOR
        INSERT 
WITH CHECK (auth.uid() =
        "ID_Usuario");

        CREATE POLICY "Usuarios pueden borrar su propio historial" ON "Historial_Ruta" FOR
        DELETE 
USING (auth.uid
        () = "ID_Usuario");

        -- Seguridad para Alerta_Global
        ALTER TABLE "Alerta_Global" ENABLE ROW LEVEL SECURITY;

        -- Todos los usuarios logueados pueden LEER las alertas globales
        CREATE POLICY "Todos pueden leer alertas" ON "Alerta_Global" FOR
        SELECT
            USING (auth.role() = 'authenticated');

        -- Solo los Administradores pueden CREAR, EDITAR o BORRAR alertas
        CREATE POLICY "Admins gestionan alertas" ON "Alerta_Global" 
USING
        (public.es_admin
        ());