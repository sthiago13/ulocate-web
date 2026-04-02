-- Función que se ejecuta tras crear un usuario
CREATE OR REPLACE FUNCTION public.crear_perfil_nuevo_usuario
()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path
= public
AS $$
BEGIN
    INSERT INTO public."Usuario"
        ("ID_Usuario", "Nombre", "Correo", "ID_Rol")
    VALUES
        (
            NEW.id,
            NEW.raw_user_meta_data ->> 'nombre_completo', -- Extraemos el nombre que mandó React
            NEW.email,
            1 -- Rol de Estudiante por defecto
  );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que vigila cuando se inserta alguien nuevo en Auth
CREATE TRIGGER luego_de_registro_crear_perfil
AFTER
INSERT ON
auth.users
FOR EACH ROW
EXECUTE
FUNCTION public.crear_perfil_nuevo_usuario
();