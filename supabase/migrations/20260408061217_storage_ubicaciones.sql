-------------------------------------------------------------------------
-- 1. CREACIÓN DEL BUCKET DE STORAGE
-------------------------------------------------------------------------
-- Insertamos el bucket de forma segura. Si ya existe, no hace nada y no da error.
INSERT INTO storage.buckets
    (id, name, public)
VALUES
    ('ubicaciones_imagenes', 'ubicaciones_imagenes', true)
ON CONFLICT
(id) DO
UPDATE SET public = true;
-- Nos aseguramos de que sea público

-------------------------------------------------------------------------
-- 2. LIMPIEZA DE POLÍTICAS ANTERIORES (Para evitar errores de nombres duplicados)
-------------------------------------------------------------------------
DROP POLICY
IF EXISTS "Admins pueden subir imagenes" ON storage.objects;
DROP POLICY
IF EXISTS "Admins pueden editar imagenes" ON storage.objects;
DROP POLICY
IF EXISTS "Admins pueden borrar imagenes" ON storage.objects;

-------------------------------------------------------------------------
-- 3. POLÍTICAS DE SEGURIDAD PARA LAS IMÁGENES
-------------------------------------------------------------------------

-- Inserción: Solo los Admins pueden subir nuevas fotos
CREATE POLICY "Admins pueden subir imagenes" 
ON storage.objects FOR
INSERT 
WITH CHECK
    ( bucket_id
= 'ubicaciones_imagenes' AND public.es_admin
() );

-- Actualización: Solo los Admins pueden reemplazar fotos existentes
CREATE POLICY "Admins pueden editar imagenes" 
ON storage.objects FOR
UPDATE 
USING ( bucket_id = 'ubicaciones_imagenes'
AND public.es_admin
() );

-- Eliminación: Solo los Admins pueden borrar fotos del servidor
CREATE POLICY "Admins pueden borrar imagenes" 
ON storage.objects FOR
DELETE 
USING ( bucket_id
= 'ubicaciones_imagenes' AND public.es_admin
() );