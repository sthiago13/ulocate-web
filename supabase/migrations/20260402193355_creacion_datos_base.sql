-- 1. Insertar Roles Iniciales
INSERT INTO "Rol"
    ("ID_Rol", "Nombre_Rol")
VALUES
    (1, 'Estudiante'),
    (2, 'Administrador'),
    (3, 'Pendiente');

-- 2. Insertar Categorías Base (Ejemplos para la UNET)
INSERT INTO "Categoria"
    ("Nombre_Categoria", "Icono")
VALUES
    ('Aula', 'MdSchool'),
    ('Laboratorio', 'MdBiotech'),
    ('Baño', 'MdWc'),
    ('Oficina Administrativa', 'MdBusinessCenter'),
    ('Comedor', 'MdRestaurant'),
    ('Cafeteria', 'MdCoffee'),
    ('Biblioteca', 'MdMenuBook'),
    ('Cancha Deportiva', 'MdSportsSoccer');

-- 3. Insertar Zonas del Campus
INSERT INTO "Zona"
    ("Nombre_Zona")
VALUES
    ('Edificio A'),
    ('Edificio B'),
    ('Edificio C'),
    ('Edificio Administrativo'),
    ('Biblioteca'),
    ('Edificio de Combate'),
    ('Comedor');