-- 20260408040000_creacion_tabla_evento.sql

-- Tabla: Evento
CREATE TABLE IF NOT EXISTS public."Evento" (
    "ID_Evento" SERIAL PRIMARY KEY,
    "Titulo" VARCHAR(100) NOT NULL,
    "Descripcion" TEXT,
    "Organizador" VARCHAR(100),
    "Fecha_Inicio" TIMESTAMP WITH TIME ZONE NOT NULL,
    "Fecha_Fin" TIMESTAMP WITH TIME ZONE,
    "ID_Ubicacion" INTEGER REFERENCES public."Ubicacion"("ID_Ubicacion") ON DELETE SET NULL,
    "Etiquetas" TEXT[] DEFAULT '{}',
    "URL_Imagen" VARCHAR(255),
    "Creado_En" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public."Evento" ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Lectura pública de Eventos"
    ON public."Evento"
    FOR SELECT
    USING (true);

CREATE POLICY "Inserción de Eventos (Solo Admin)"
    ON public."Evento"
    FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT "ID_Usuario" FROM public."Usuario" WHERE "Rol" = 'Admin'));

CREATE POLICY "Actualización de Eventos (Solo Admin)"
    ON public."Evento"
    FOR UPDATE
    USING (auth.uid() IN (SELECT "ID_Usuario" FROM public."Usuario" WHERE "Rol" = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT "ID_Usuario" FROM public."Usuario" WHERE "Rol" = 'Admin'));

CREATE POLICY "Eliminación de Eventos (Solo Admin)"
    ON public."Evento"
    FOR DELETE
    USING (auth.uid() IN (SELECT "ID_Usuario" FROM public."Usuario" WHERE "Rol" = 'Admin'));
