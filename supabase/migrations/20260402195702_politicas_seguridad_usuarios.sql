-- 1. Nos aseguramos de que RLS esté activo en la tabla
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;

-- 2. Política de Lectura: Los usuarios autenticados pueden ver los perfiles 
-- (útil en el futuro si quieren ver el nombre de quién creó una ruta)
CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON "Usuario" FOR
SELECT
    USING (auth.role() = 'authenticated');

-- 3. Política de Inserción: Permite al usuario guardar su propio perfil en el registro
CREATE POLICY "Permitir insercion del propio perfil" 
ON "Usuario" FOR
INSERT 
WITH CHECK (auth.uid() =
"ID_Usuario");

-- 4. Política de Actualización: Un usuario solo puede editar su propio nombre/datos
CREATE POLICY "Permitir actualizar propio perfil" 
ON "Usuario" FOR
UPDATE 
USING (auth.uid()
= "ID_Usuario");