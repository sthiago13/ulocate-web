-- 1. Insertar 8 Nodos de prueba (Coordenadas aproximadas)
INSERT INTO "Nodo"
    ("ID_Nodo", "Latitud", "Longitud")
VALUES
    (1, 7.79470000, -72.19830000),
    -- Para el Aula
    (2, 7.79450000, -72.19750000),
    -- Para el Laboratorio
    (3, 7.79420000, -72.19850000),
    -- Para el Baño
    (4, 7.79520000, -72.19950000),
    -- Para la Oficina
    (5, 7.79350000, -72.19900000),
    -- Para el Comedor
    (6, 7.79480000, -72.19820000),
    -- Para el Cafetín
    (7, 7.79500000, -72.19800000),
    -- Para la Biblioteca
    (8, 7.79250000, -72.19600000);
-- Para la Cancha

-- 2. Insertar 8 Ubicaciones (Una por cada categoría)
INSERT INTO "Ubicacion"
    ("ID_Ubicacion", "Nombre", "Descripcion", "Detalles_Extras", "Acceso_Publico", "ID_Categoria", "ID_Zona", "ID_Nodo")
VALUES
    (1, 'Aula 01A', 'Aula de clases tradicional', 'Ubicada en la primera planta.', true, 1, 1, 1),
    (2, 'Laboratorio de Computación C-01', 'Laboratorio de prácticas informáticas', 'Equipos con Windows y conexion a internet.', true, 2, 3, 2),
    (3, 'Baños del Edificio B', 'Baños públicos planta baja', 'Disponibilidad de agua intermitente.', true, 3, 2, 3),
    (4, 'Control de Estudios', 'Taquilla principal administrativa', 'Horario de atención: 8:00 AM - 12:00 PM.', true, 4, 1, 4),
    (5, 'Comedor Estudiantil', 'Comedor principal de la universidad', 'Requiere ticket para el servicio de almuerzo.', true, 5, 7, 5),
    (6, 'Cafetín Edificio A', 'Venta de empanadas, pasteles y café', 'Aceptan pago móvil y efectivo.', true, 6, 1, 6),
    (7, 'Biblioteca Central', 'Biblioteca principal de la UNET', 'Se requiere presentar el carnet estudiantil vigente.', true, 7, 5, 7),
    (8, 'Cancha Edificio de Combate', 'Cancha de usos múltiples', 'Usada frecuentemente para torneos internos.', true, 8, 6, 8);

-- 3. Sincronizar las secuencias autoincrementales
-- Esto evita errores al crear nuevas ubicaciones desde el panel de administrador
SELECT setval('"Nodo_ID_Nodo_seq"', 8);
SELECT setval('"Ubicacion_ID_Ubicacion_seq"', 8);