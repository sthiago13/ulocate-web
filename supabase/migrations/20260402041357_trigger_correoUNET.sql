-- 1. Reemplazamos la función para añadir SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.verificar_dominio_unet
()
RETURNS TRIGGER 
SECURITY DEFINER
-- Elevamos los privilegios de ejecución
SET search_path
= public
AS $$
BEGIN
  IF NEW.email NOT LIKE '%@unet.edu.ve' THEN
    RAISE EXCEPTION 'Acceso denegado: Solo se permiten correos de la universidad (@unet.edu.ve).';
END
IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Aseguramos que el trigger se recree limpiamente
DROP TRIGGER IF EXISTS validar_correo_universitario
ON auth.users;

CREATE TRIGGER validar_correo_universitario
BEFORE
INSERT ON
auth.users
FOR EACH ROW
EXECUTE
FUNCTION public.verificar_dominio_unet
();