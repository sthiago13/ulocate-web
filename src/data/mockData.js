// src/data/mockData.js

export const roles = [
  { ID_Rol: 1, Nombre_Rol: "Estudiante" },
  { ID_Rol: 2, Nombre_Rol: "Administrador" },
];

export const usuarios = [
  {
    ID_Usuario: 1,
    Nombre: "Santiago",
    Correo: "santiago@unet.edu.ve",
    Contrasena: "123456", // En frontend esto no importa mucho ahora
    ID_Rol: 1,
  },
  {
    ID_Usuario: 2,
    Nombre: "Administrador",
    Correo: "admin@unet.edu.ve",
    Contrasena: "admin123", // En frontend esto no importa mucho ahora
    ID_Rol: 2,
  },
];

export const categorias = [
  { ID_Categoria: 1, Nombre_Categoria: "Académico", Icono: "MdSchool" },
  { ID_Categoria: 2, Nombre_Categoria: "Alimentación", Icono: "MdRestaurant" },
  { ID_Categoria: 3, Nombre_Categoria: "Servicios", Icono: "MdLocalPrintshop" },
  {
    ID_Categoria: 4,
    Nombre_Categoria: "Administrativo",
    Icono: "MdBusinessCenter",
  },
];

export const zonas = [
  { ID_Zona: 1, Nombre_Zona: "Edificio A" },
  { ID_Zona: 2, Nombre_Zona: "Edificio B" },
  { ID_Zona: 3, Nombre_Zona: "Edificio C" },
  { ID_Zona: 4, Nombre_Zona: "Áreas Comunes" },
];

export const nodos = [
  { ID_Nodo: 101, Latitud: 7.79153, Longitud: -72.2012 }, // Coordenadas ficticias de prueba
  { ID_Nodo: 102, Latitud: 7.79165, Longitud: -72.20135 },
  { ID_Nodo: 103, Latitud: 7.7918, Longitud: -72.2011 },
];

// Aquí unimos todo con las Foráneas (Foreign Keys) del DER
export const ubicaciones = [
  {
    ID_Ubicacion: 1,
    Nombre: "Laboratorio de Computación B",
    Descripcion: "Laboratorio principal para prácticas de programación y bases de datos.",
    Detalles_Extras: "Equipado con 30 equipos i7, acceso a internet por fibra óptica y proyector 4K.",
    URL_Imagen: "https://via.placeholder.com/1200x800?text=Laboratorio+C",
    Acceso_Publico: true,
    ID_Categoria: 1,
    ID_Zona: 2,
    ID_Nodo: 101,
  },
  {
    ID_Ubicacion: 2,
    Nombre: "Cafetín Central",
    Descripcion: "Venta de desayunos, almuerzos y snacks.",
    Detalles_Extras: "Opciones vegetarianas disponibles. Abierto de 7 AM a 5 PM.",
    URL_Imagen: "https://via.placeholder.com/1200x800?text=Cafetin+Central",
    Acceso_Publico: true,
    ID_Categoria: 2,
    ID_Zona: 4,
    ID_Nodo: 102,
  },
  {
    ID_Ubicacion: 3,
    Nombre: "Control de Estudios",
    Descripcion: "Taquillas para solicitud de constancias y trámites administrativos.",
    Detalles_Extras: "Requiere cita previa por la página web de la universidad.",
    URL_Imagen: "https://via.placeholder.com/1200x800?text=Control+de+Estudios",
    Acceso_Publico: true,
    ID_Categoria: 4,
    ID_Zona: 1,
    ID_Nodo: 103,
  },
];

export const ubicacionesGuardadas = [
  {
    ID_Guardado: 1,
    ID_Usuario: 1,
    ID_Ubicacion: 1,
    Titulo_Guardado: "Clase de Programación",
    Dia_Semana: "Lunes",
    Hora: "10:00:00",
    Datos_Adicionales: "Traer laptop",
  },
];
