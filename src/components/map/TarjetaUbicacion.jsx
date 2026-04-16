import React, { useEffect, useState } from 'react';
import { MdClose, MdStarBorder, MdStar, MdChevronLeft, MdChevronRight, MdDirectionsWalk } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import ModalConfirmacion from '../common/ModalConfirmacion';
import ModalFormulario from '../common/ModalFormulario';
import { useUbicaciones, useCategorias, useZonas, useImagenesUbicacion } from '../../hooks/useMapData';

export default function TarjetaUbicacion({ ubicacionId, onClose, isAdmin, onEdit, onRouteRequest }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [showExtras, setShowExtras] = useState(false);
  const [user, setUser] = useState(null);

  // States for the ModalConfirmacion
  const [modalType, setModalType] = useState(null); // 'confirm_delete' | 'add_notes'
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ dia: '', hora: '', notas: '' });

  // 1. Datos base desde caché con React Query (carga instantánea)
  const { data: ubicaciones = [], isLoading: isLoadingUbis } = useUbicaciones({ isAdmin });
  const { data: categorias = [], isLoading: isLoadingCats } = useCategorias({ isAdmin });
  const { data: zonas = [], isLoading: isLoadingZonas } = useZonas({ isAdmin });
  
  // 2. Imágenes cargadas "por detrás"
  const { data: imagenes = [] } = useImagenesUbicacion(ubicacionId);

  // Reconstruimos el objeto ubicacion para compatibilidad con el resto del componente
  const baseData = ubicaciones.find(u => u.ID_Ubicacion === ubicacionId);
  const ubicacion = baseData ? {
    ...baseData,
    Categoria: categorias.find(c => c.ID_Categoria === baseData.ID_Categoria) || null,
    Zona: zonas.find(z => z.ID_Zona === baseData.ID_Zona) || null
  } : null;

  const isLoadingBaseInfo = isLoadingUbis || isLoadingCats || isLoadingZonas;

  // 3. Pequeño fetch asíncrono para el perfil del usuario activo y sus favoritos guardados
  useEffect(() => {
    if (!ubicacionId) return;
    
    let isMounted = true;
    const fetchUserData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!isMounted) return;
      setUser(currentUser);
      
      if (currentUser) {
        const { data: favData } = await supabase
          .from('Ubicacion_Guardada')
          .select('ID_Guardado')
          .eq('ID_Usuario', currentUser.id)
          .eq('ID_Ubicacion', ubicacionId)
          .maybeSingle();
          
        if (isMounted && favData) {
          setIsFavorite(true);
          setFavoriteId(favData.ID_Guardado);
        }
      }
    };
    fetchUserData();
    
    return () => {
      isMounted = false;
    };
  }, [ubicacionId]);

  // Funciones Carrusel
  const handleNextImage = () => {
    if (imgIndex < imagenes.length - 1) setImgIndex(imgIndex + 1);
    else setImgIndex(0);
  };
  
  const handlePrevImage = () => {
    if (imgIndex > 0) setImgIndex(imgIndex - 1);
    else setImgIndex(imagenes.length - 1);
  };

  // Función Favoritos
  const handleToggleFavorite = async () => {
    if (!user) return; // Idealmente se mostraría que debe iniciar sesión
    
    if (isFavorite) {
      // Lanzar advertencia de eliminación
      setModalType('confirm_delete');
      setShowModal(true);
    } else {
      // Crear favorito de manera simple e inmediata
      const { data, error } = await supabase
        .from('Ubicacion_Guardada')
        .insert({
          ID_Usuario: user.id,
          ID_Ubicacion: ubicacionId,
          Titulo_Guardado: ubicacion.Nombre
        })
        .select('ID_Guardado')
        .single();
        
      if (!error && data) {
        setIsFavorite(true);
        setFavoriteId(data.ID_Guardado);
        setFormData({ dia: '', hora: '', notas: '' }); // Reset
        setModalType('add_notes');
        setShowModal(true);
      }
    }
  };

  // Acciones en el Modal
  const onConfirmModal = async () => {
    if (modalType === 'confirm_delete' && favoriteId) {
      await supabase.from('Ubicacion_Guardada').delete().eq('ID_Guardado', favoriteId);
      setIsFavorite(false);
      setFavoriteId(null);
      setShowModal(false);
    }
  };

  const onSaveNotes = async () => {
    if (favoriteId) {
      const dbDia = formData.dia.trim() !== '' ? formData.dia : null;
      const dbHora = formData.hora.trim() !== '' ? formData.hora : null;
      const dbNotas = formData.notas.trim() !== '' ? formData.notas : null;

      await supabase.from('Ubicacion_Guardada').update({
        Dia_Semana: dbDia,
        Hora: dbHora,
        Datos_Adicionales: dbNotas
      }).eq('ID_Guardado', favoriteId);
    }
    setShowModal(false);
    setModalType(null);
  };

  const cancelarModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const handleTrazarRuta = () => {
    if (ubicacion && ubicacion.ID_Nodo) {
      if (onRouteRequest) {
        onRouteRequest(ubicacion); // Pasamos el objeto completo de Supabase
      }
      onClose(); // Cerrar la tarjeta para ver el mapa
    } else {
      alert('No se puede trazar ruta: Esta ubicación no está asociada a un nodo del mapa.');
    }
  };

  if (isLoadingBaseInfo) {
     return null; // Podría ponerse un loader, o mantenerse transparente para que cargue rapidito en segundo plano
  }
  if (!ubicacion) return null;

  // Render dinamico del icono segun la BD, default: MdPlace
  const IconComponent = ubicacion.Categoria && ubicacion.Categoria.Icono && MdIcons[ubicacion.Categoria.Icono] 
    ? MdIcons[ubicacion.Categoria.Icono] 
    : MdIcons.MdPlace;

  // Lógica de textos para el modal dinámico
  const mTitulo = modalType === 'confirm_delete' ? 'Eliminar Guarda' : '¡Lugar Guardado!';
  const mMensaje = modalType === 'confirm_delete' 
      ? '¿Estás seguro de que deseas eliminar a ' + ubicacion.Nombre + ' de tus favoritos y alarmas?'
      : 'Has guardado a ' + ubicacion.Nombre + ' como favorito exitosamente. ¿Deseas configurarle datos adicionales/alarmas ahora?';
  const mConfirmar = modalType === 'confirm_delete' ? 'Eliminar' : 'Añadir datos';
  const mCancelar = modalType === 'confirm_delete' ? 'Cancelar' : 'Seguir navegando';
  const mColor = modalType === 'confirm_delete' ? 'bg-[#cd1e1e] hover:bg-red-800' : 'bg-[#155dfc] hover:bg-blue-700';

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[48] pointer-events-none flex justify-center items-end pb-[95px] md:pb-0 md:items-center md:justify-start">
          
          {/* Modal / Sidebar ajustado */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-[92%] sm:w-[380px] md:ml-[0px] h-fit max-h-[75vh] md:max-h-[calc(100vh-180px)] bg-white md:rounded-l-none rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] flex flex-col pointer-events-auto overflow-hidden mx-auto md:mx-0"
          >
            
            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              <div className="w-full flex flex-col px-5 pt-5 pb-3">
                {/* Header */}
                <div className="flex items-start justify-between w-full mb-6 py-1">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-[100px] flex items-center justify-center text-blue-500 text-2xl border border-blue-200 shrink-0 shadow-sm">
                      <IconComponent />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="font-jakarta font-bold text-[20px] text-gray-900 leading-[1.2]">
                        {ubicacion.Nombre}
                      </h2>
                      <span className="font-jakarta font-medium text-[14px] text-gray-500 mt-0.5">
                        {ubicacion.Categoria ? ubicacion.Categoria.Nombre_Categoria : "Desconocido"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isAdmin && (
                      <button 
                        onClick={() => onEdit(ubicacion)} 
                        className="p-2.5 bg-gray-100 hover:bg-emerald-100 rounded-full transition-colors text-gray-600 hover:text-emerald-600 shrink-0 border border-transparent hover:border-emerald-200"
                        title="Editar esta ubicación"
                      >
                        <MdIcons.MdEdit className="text-[20px]" />
                      </button>
                    )}
                    <button 
                      onClick={onClose} 
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600 shrink-0"
                      aria-label="Cerrar detalles"
                    >
                      <MdClose className="text-[20px]" />
                    </button>
                  </div>
                </div>

                {/* Imagen Principal (Carrusel) */}
                <div className="relative w-full aspect-video bg-gray-100 rounded-[24px] overflow-hidden mb-5 group shadow-inner">
                  {imagenes.length > 0 ? (
                    <>
                      <img 
                        src={imagenes[imgIndex]} 
                        alt={ubicacion.Nombre} 
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                      {/* Controles solo si hay más de 1 imagen */}
                      {imagenes.length > 1 && (
                        <>
                          <button 
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MdChevronLeft className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MdChevronRight className="w-6 h-6" />
                          </button>
                          {/* Indicadores Puntos */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-2 py-1 rounded-full">
                            {imagenes.map((_, idx) => (
                               <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${imgIndex === idx ? 'bg-white' : 'bg-white/50'}`}></div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#f0f0f0]">
                      <span className="text-gray-400 font-jakarta font-medium text-xs">No hay imágenes disponibles.</span>
                    </div>
                  )}
                </div>

                {/* Descripcion */}
                <div className="mb-4">
                  <p className="font-jakarta text-[14.5px] text-gray-700 leading-relaxed px-1">
                    {ubicacion.Descripcion}
                  </p>
                </div>

                {/* Ver Más Detalles Toggler */}
                {ubicacion.Detalles_Extras && (
                  <div className="mb-4 text-center">
                    <button 
                      onClick={() => setShowExtras(!showExtras)}
                      className="px-5 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-jakarta font-bold text-[13px] transition-colors border border-blue-100 shadow-sm"
                    >
                      {showExtras ? "Ocultar detalles adicionales" : "Ver más detalles técnicos"}
                    </button>
                    
                    <AnimatePresence>
                      {showExtras && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 14 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          className="overflow-hidden text-left"
                        >
                          <div className="bg-[#f8f9fa] border border-gray-200 rounded-[22px] px-5 py-4 shadow-inner">
                            <p className="font-jakarta text-[13.5px] text-gray-600 leading-[1.6]">
                              {ubicacion.Detalles_Extras}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                
                {/* Tag Zona */}
                {ubicacion.Zona && (
                  <div className="flex justify-center mb-6 mt-2">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-[13px] font-jakarta font-bold rounded-full shadow-sm">
                      <MdIcons.MdLocationOn className="w-4 h-4 text-blue-600" />
                      {ubicacion.Zona.Nombre_Zona}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer de Acciones Fijo */}
            <div className="w-full px-5 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3 shrink-0">
              <button 
                  onClick={handleToggleFavorite}
                  className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors flex-shrink-0"
                  aria-label="Marcar como favorito"
              >
                {isFavorite ? <MdStar className="w-7 h-7 text-yellow-500" /> : <MdStarBorder className="w-7 h-7 text-gray-400" />}
              </button>
              <button onClick={handleTrazarRuta} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-jakarta font-medium text-[16px] py-3 rounded-2xl transition-colors shadow-[0_4px_12px_rgba(21,93,252,0.25)] flex items-center justify-center gap-2">
                <MdDirectionsWalk className="w-6 h-6" />
                Trazar Ruta
              </button>
            </div>

          </motion.div>
        </div>
      </AnimatePresence>

      {modalType === 'confirm_delete' ? (
        <ModalConfirmacion 
          isOpen={showModal}
          onClose={cancelarModal}
          onConfirm={onConfirmModal}
          titulo={mTitulo}
          mensaje={mMensaje}
          textoConfirmar={mConfirmar}
          textoCancelar={mCancelar}
          colorConfirmar={mColor}
        />
      ) : modalType === 'add_notes' ? (
        <ModalFormulario
          isOpen={showModal}
          onClose={cancelarModal}
          onSubmit={onSaveNotes}
          titulo="¡Lugar Guardado!"
          subtitulo={`Has guardado a ${ubicacion.Nombre} en Favoritos. ¿Quieres agregarle detalles de rutina?`}
          textoConfirmar="Guardar Datos"
          textoCancelar="Omitir"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Día Frecuente</label>
            <select 
              value={formData.dia}
              onChange={e => setFormData({...formData, dia: e.target.value})}
              className="w-full font-sans px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecciona (Opcional)</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Hora</label>
            <input 
              type="time" 
              value={formData.hora}
              onChange={e => setFormData({...formData, hora: e.target.value})}
              className="w-full font-sans px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Notas adicionales</label>
            <textarea 
              rows="3"
              maxLength={100}
              placeholder="Ej: Traer la lapto, pedir cita previa..."
              value={formData.notas}
              onChange={e => setFormData({...formData, notas: e.target.value})}
              className="w-full font-sans px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <span className="text-xs text-gray-400 text-right">{formData.notas.length}/100</span>
          </div>
        </ModalFormulario>
      ) : null}
    </>
  );
}
