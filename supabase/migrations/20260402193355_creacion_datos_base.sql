-- 1. Insertar Roles Iniciales
INSERT INTO "Rol"
    ("ID_Rol", "Nombre_Rol")
VALUES
    (1, 'Estudiante'),
    (2, 'Administrador');

-- 2. Insertar Categorías Base (Ejemplos para la UNET)
INSERT INTO "Categoria"
    ("Nombre_Categoria", "Icono")
VALUES
    ('Aula', 'school'),
    ('Laboratorio', 'biotech'),
    ('Baño', 'wc'),
    ('Oficina Administrativa', 'business_center'),
    ('Comedor', 'restaurant'),
    ('Cafeteria', 'coffee'),
    ('Biblioteca', 'menu_book'),
    ('Cancha Deportiva', 'sports_soccer');

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