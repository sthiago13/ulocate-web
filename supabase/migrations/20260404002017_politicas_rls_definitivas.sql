-------------------------------------------------------------------------
-- 0. FUNCIÓN AUXILIAR: ¿Es el usuario actual un Administrador?
-------------------------------------------------------------------------
-- Usamos SECURITY DEFINER para que pueda leer la tabla Usuario sin causar un ciclo infinito
CREATE OR REPLACE FUNCTION public.es_admin
()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
SET search_path
= public
AS $$
SELECT EXISTS
(
    SELECT 1
FROM public."Usuario"
WHERE "ID_Usuario" = auth.uid() AND "ID_Rol" = 2
  );
$$;

-------------------------------------------------------------------------
-- 1. ACTIVAR RLS EN TODAS LAS TABLAS
-------------------------------------------------------------------------
ALTER TABLE "Rol" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Categoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Zona" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Nodo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tramo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ubicacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Referencias_Visuales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ubicacion_Guardada" ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------
-- 2. LIMPIAR POLÍTICAS ANTERIORES DE LA TABLA USUARIO
-------------------------------------------------------------------------
DROP POLICY
IF EXISTS "Permitir lectura a usuarios autenticados" ON "Usuario";
DROP POLICY
IF EXISTS "Permitir insercion del propio perfil" ON "Usuario";
DROP POLICY
IF EXISTS "Permitir actualizar propio perfil" ON "Usuario";

-------------------------------------------------------------------------
-- 3. POLÍTICAS: EL MAPA VISUAL (VISTAS ANÓNIMAS)
-------------------------------------------------------------------------
-- Zonas, Nodos y Tramos deben ser públicos para pintar el mapa a invitados (anónimos)
CREATE POLICY "Zonas visibles para todos" ON "Zona" FOR
SELECT USING (true);
CREATE POLICY "Nodos visibles para todos" ON "Nodo" FOR
SELECT USING (true);
CREATE POLICY "Tramos visibles para todos" ON "Tramo" FOR
SELECT USING (true);

-- Solo los Administradores pueden crear, editar o borrar el mapa visual
CREATE POLICY "Admins controlan Zonas" ON "Zona" USING
(public.es_admin
());
CREATE POLICY "Admins controlan Nodos" ON "Nodo" USING
(public.es_admin
());
CREATE POLICY "Admins controlan Tramos" ON "Tramo" USING
(public.es_admin
());

-------------------------------------------------------------------------
-- 4. POLÍTICAS: DETALLES DEL MAPA (SOLO LOGUEADOS)
-------------------------------------------------------------------------
-- Ubicaciones, Categorías y Referencias requieren estar logueado para ver la info
CREATE POLICY "Usuarios logueados ven Ubicaciones" ON "Ubicacion" FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuarios logueados ven Categorias" ON "Categoria" FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuarios logueados ven Referencias" ON "Referencias_Visuales" FOR
SELECT USING (auth.role() = 'authenticated');

-- Solo los Administradores pueden gestionar estos detalles
CREATE POLICY "Admins controlan Ubicaciones" ON "Ubicacion" USING
(public.es_admin
());
CREATE POLICY "Admins controlan Categorias" ON "Categoria" USING
(public.es_admin
());
CREATE POLICY "Admins controlan Referencias" ON "Referencias_Visuales" USING
(public.es_admin
());

-------------------------------------------------------------------------
-- 5. POLÍTICAS: PERFILES DE USUARIO
-------------------------------------------------------------------------
-- Lectura: Puedes ver tu propio perfil, O un admin puede verlos todos.
CREATE POLICY "Ver perfil propio o admin ve todos" ON "Usuario" FOR
SELECT
    USING (auth.uid() = "ID_Usuario" OR public.es_admin());

-- Actualización: Puedes editar tu propio perfil, O un admin puede editar a cualquiera.
CREATE POLICY "Editar perfil propio o admin edita todos" ON "Usuario" FOR
UPDATE 
USING (auth.uid()
= "ID_Usuario" OR public.es_admin
());

-- Borrado: Solo un admin puede eliminar usuarios desde la base de datos
CREATE POLICY "Admin borra usuarios" ON "Usuario" FOR
DELETE 
USING (public.es_admin
());

-- (La Inserción no requiere política pública porque lo hace tu Trigger interno)

-------------------------------------------------------------------------
-- 6. POLÍTICAS: LUGARES FAVORITOS
-------------------------------------------------------------------------
-- CRUD: Puedes gestionar tus propios favoritos, O un admin puede ver/gestionarlos todos.
CREATE POLICY "Gestionar favoritos propios o admin gestiona todos" ON "Ubicacion_Guardada" 
USING
(auth.uid
() = "ID_Usuario" OR public.es_admin
());

-------------------------------------------------------------------------
-- 7. POLÍTICAS: ROLES
-------------------------------------------------------------------------
-- Lectura pública (necesaria para el registro y sistema)
CREATE POLICY "Roles visibles para todos" ON "Rol" FOR
SELECT USING (true);
-- Solo admin modifica
CREATE POLICY "Admins controlan Roles" ON "Rol" USING
(public.es_admin
());