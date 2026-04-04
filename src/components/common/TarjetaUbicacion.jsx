import React, { useEffect, useState } from 'react';
import { MdClose, MdStarBorder, MdStar, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import ModalConfirmacion from './ModalConfirmacion';

export default function TarjetaUbicacion({ ubicacionId, onClose }) {
  const [ubicacion, setUbicacion] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [imgIndex, setImgIndex] = useState(0);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  
  const [showExtras, setShowExtras] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // States for the ModalConfirmacion
  const [modalType, setModalType] = useState(null); // 'confirm_delete' | 'add_notes'
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!ubicacionId) return;
    
    const fetchAll = async () => {
      setLoading(true);
      // 1. Obtener Usuario
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      // 2. Obtener Ubicacion con sus relaciones (Categoria, Zona)
      const { data: ubiData } = await supabase
        .from('Ubicacion')
        .select(`
          *,
          Categoria (*),
          Zona (*)
        `)
        .eq('ID_Ubicacion', ubicacionId)
        .single();
        
      if (ubiData) setUbicacion(ubiData);

      // 3. Obtener Imagenes desde Referencias_Visuales
      const { data: imgData } = await supabase
        .from('Referencias_Visuales')
        .select('URL_Imagen')
        .eq('ID_Ubicacion', ubicacionId);
        
      if (imgData) setImagenes(imgData.map(i => i.URL_Imagen).filter(url => url));

      // 4. Verificar estado de Favorito para este usuario
      if (currentUser) {
        const { data: favData } = await supabase
          .from('Ubicacion_Guardada')
          .select('ID_Guardado')
          .eq('ID_Usuario', currentUser.id)
          .eq('ID_Ubicacion', ubicacionId)
          .maybeSingle();
          
        if (favData) {
          setIsFavorite(true);
          setFavoriteId(favData.ID_Guardado);
        }
      }
      
      setLoading(false);
    };
    fetchAll();
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
        // Sugerir añadir notas
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
    } else if (modalType === 'add_notes') {
      setShowModal(false);
      // TODO: Redirigir a LugaresFavoritos
      alert("En desarrollo: Aquí serías redirigido al componente LugaresFavoritos.jsx");
    }
  };

  if (loading) {
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
            
            <div className="w-full flex flex-col px-5 pt-5 pb-3">
              {/* Header */}
              <div className="flex items-start justify-between w-full mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-[100px] flex items-center justify-center text-blue-500 text-2xl border border-blue-200 shrink-0">
                    <IconComponent />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-jakarta font-medium text-[20px] text-gray-900 leading-tight">
                      {ubicacion.Nombre}
                    </h2>
                    <span className="font-jakarta font-normal text-[14px] text-gray-600 mt-1">
                      {ubicacion.Categoria ? ubicacion.Categoria.Nombre_Categoria : "Desconocido"}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={onClose} 
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600 shrink-0"
                  aria-label="Cerrar detalles"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              {/* Imagen Principal (Carrusel) */}
              <div className="relative w-full aspect-video bg-gray-100 rounded-[24px] overflow-hidden mb-5 group">
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
                    <span className="text-gray-500 font-jakarta font-medium text-sm">No hay imágenes para mostrar.</span>
                  </div>
                )}
              </div>

              {/* Descripcion */}
              <div className="mb-4">
                <p className="font-sans text-[14px] text-gray-700 leading-relaxed px-1">
                  {ubicacion.Descripcion}
                </p>
              </div>

              {/* Ver Más Detalles Toggler */}
              {ubicacion.Detalles_Extras && (
                <div className="mb-4 text-center">
                  <button 
                    onClick={() => setShowExtras(!showExtras)}
                    className="px-4 py-1.5 rounded-full bg-gray-100 text-blue-600 hover:bg-blue-50 font-jakarta font-medium text-[13px] transition-colors"
                  >
                    {showExtras ? "Ocultar detalles" : "Ver más detalles"}
                  </button>
                  
                  <AnimatePresence>
                    {showExtras && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden text-left"
                      >
                        <div className="bg-[#f5f5f5] border border-gray-200 rounded-[20px] px-4 py-3 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                          <p className="font-sans text-[13px] text-gray-600 leading-relaxed">
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
                <div className="flex justify-center mb-1">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 text-sm font-jakarta font-medium rounded-full shadow-sm">
                    <MdIcons.MdLocationOn className="w-4 h-4 text-blue-500" />
                    {ubicacion.Zona.Nombre_Zona}
                  </span>
                </div>
              )}

              <div className="h-8"></div> {/* Spacer inferior */}
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
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-jakarta font-medium text-[16px] py-3 rounded-2xl transition-colors shadow-[0_4px_12px_rgba(21,93,252,0.25)]">
                Trazar Ruta
              </button>
            </div>

          </motion.div>
        </div>
      </AnimatePresence>

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
    </>
  );
}
