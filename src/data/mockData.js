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

// Helper para manejar persistencia local para el prototipo
function getPersistentData(key, fallbackData) {
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);
  localStorage.setItem(key, JSON.stringify(fallbackData));
  return fallbackData;
}

export const nodos = getPersistentData('unet_graph_nodes', [
  { id: "101", lat: 7.79153, lng: -72.2012 },
  { id: "102", lat: 7.79165, lng: -72.20135 },
  { id: "103", lat: 7.7918, lng: -72.2011 },
]);

export const ubicaciones = getPersistentData('unet_ubicaciones', [
  {
    ID_Ubicacion: 1,
    Nombre: "Laboratorio de Computación B",
    Descripcion: "Laboratorio principal para prácticas de programación.",
    Detalles_Extras: "Equipado con 30 equipos i7",
    URL_Imagen: "https://via.placeholder.com/1200x800?text=Laboratorio+C",
    Acceso_Publico: true,
    ID_Categoria: 1,
    ID_Zona: 2,
    ID_Nodo: "101",
  },
  {
    ID_Ubicacion: 2,
    Nombre: "Cafetín Central",
    Descripcion: "Venta de desayunos, almuerzos y snacks.",
    Detalles_Extras: "Opciones vegetarianas disponibles.",
    URL_Imagen: "https://via.placeholder.com/1200x800?text=Cafetin+Central",
    Acceso_Publico: true,
    ID_Categoria: 2,
    ID_Zona: 4,
    ID_Nodo: "102",
  },
]);

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

export const notificaciones = [
  {
    ID_Notificacion: 1,
    Titulo: "Clase de Programación",
    Mensaje: "Recuerda llevar tu laptop.",
    Tiempo: "Hace 10 min",
    Leida: false,
    Icono: "MdSchool"
  },
  {
    ID_Notificacion: 2,
    Titulo: "Control de Estudios",
    Mensaje: "Tu cita es mañana a las 8:00 AM.",
    Tiempo: "Hace 1 hora",
    Leida: true,
    Icono: "MdBusinessCenter"
  },
  {
    ID_Notificacion: 3,
    Titulo: "Cafetín Central",
    Mensaje: "¡Menú vegetariano disponible hoy!",
    Tiempo: "Hace 3 horas",
    Leida: true,
    Icono: "MdRestaurant"
  }
];
