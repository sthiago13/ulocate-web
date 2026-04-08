import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdClose, MdStarBorder, MdStar, MdChevronLeft, MdChevronRight, MdDirectionsWalk } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { getUbicaciones } from '../../utils/localDB';
import ModalConfirmacion from './ModalConfirmacion';
import ModalFormulario from './ModalFormulario';
import Spinner from './Spinner';

/**
 * TarjetaUbicacion - Versión conectada a Supabase solicitada por el usuario.
 * Se integra con el sistema de navegación local mediante 'route_triggered'.
 */
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
  const [formData, setFormData] = useState({ titulo: '', dia: '', hora: '', notas: '' });

  useEffect(() => {
    if (!ubicacionId) return;
    
    const fetchAll = async () => {
      setLoading(true);
      
      // 1. Verificar si es una ubicación LOCAL (comienza con 'ubi_')
      if (typeof ubicacionId === 'string' && ubicacionId.startsWith('ubi_')) {
        const localData = getUbicaciones().find(u => u.id === ubicacionId);
        if (localData) {
          // Mapeamos campos locales a los que espera el componente (Supabase style)
          setUbicacion({
            ID_Ubicacion: localData.id,
            Nombre: localData.nombre,
            Descripcion: localData.descripcion,
            Categoria: { Nombre_Categoria: localData.categoria, Icono: 'MdPlace' },
            ID_Nodo: localData.nodeId
          });
          setImagenes([]);
          setLoading(false);
          return;
        }
      }

      try {
        // 2. Obtener Usuario
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        
        // 3. Obtener Ubicacion desde Supabase (solo si el ID es numérico o UUID válido)
        const { data: ubiData, error: ubiError } = await supabase
          .from('Ubicacion')
          .select(`
            *,
            Categoria (*),
            Zona (*)
          `)
          .eq('ID_Ubicacion', ubicacionId)
          .single();
          
        if (ubiData) {
          setUbicacion(ubiData);
          
          // Imagenes
          const { data: imgData } = await supabase
            .from('Referencias_Visuales')
            .select('URL_Imagen')
            .eq('ID_Ubicacion', ubicacionId);
          if (imgData) setImagenes(imgData.map(i => i.URL_Imagen).filter(url => url));

          // Favoritos
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
        }
      } catch (err) {
        console.warn("Aviso: No se pudo cargar desde Supabase (posible ID local):", err);
      } finally {
        setLoading(false);
      }
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
    if (!user) return;
    
    if (isFavorite) {
      setModalType('confirm_delete');
      setShowModal(true);
    } else {
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
        setFormData({ titulo: ubicacion.Nombre, dia: '', hora: '', notas: '' });
        setModalType('add_notes');
        setShowModal(true);
      }
    }
  };

  const handleTrazarRuta = () => {
    // Integración con el sistema de navegación local
    // Adaptamos el objeto de Supabase al formato que espera el motor de rutas local
    const targetUbi = {
      id: ubicacion.ID_Ubicacion,
      nombre: ubicacion.Nombre,
      nodeId: ubicacion.ID_Nodo || ubicacion.nodeId, // Asumimos que ID_Nodo existe en la BD
      categoria: ubicacion.Categoria?.Nombre_Categoria || ''
    };
    localStorage.setItem('active_route_target', JSON.stringify(targetUbi));
    window.dispatchEvent(new Event('route_triggered'));
    onClose();
  };

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
      await supabase.from('Ubicacion_Guardada').update({
        Titulo_Guardado: formData.titulo.trim() !== '' ? formData.titulo : null,
        Dia_Semana: formData.dia.trim() !== '' ? formData.dia : null,
        Hora: formData.hora.trim() !== '' ? formData.hora : null,
        Datos_Adicionales: formData.notas.trim() !== '' ? formData.notas : null
      }).eq('ID_Guardado', favoriteId);
    }
    setShowModal(false);
    setModalType(null);
  };

  if (loading) {
     return createPortal(
       <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-sm">
         <div className="bg-white p-8 rounded-3xl shadow-2xl">
           <Spinner text="Cargando ubicación..." />
         </div>
       </div>,
       document.body
     );
  }
  if (!ubicacion) return null;

  const IconComponent = ubicacion.Categoria && ubicacion.Categoria.Icono && MdIcons[ubicacion.Categoria.Icono] 
    ? MdIcons[ubicacion.Categoria.Icono] 
    : MdIcons.MdPlace;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] pointer-events-none flex justify-center items-end pb-[95px] md:pb-0 md:items-center md:justify-start">
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -30, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-[92%] sm:w-[380px] h-fit max-h-[75vh] md:max-h-[calc(100vh-140px)] bg-white md:rounded-l-none rounded-[32px] shadow-[0_12px_50px_rgba(0,0,0,0.2)] flex flex-col pointer-events-auto overflow-hidden mx-auto md:mx-0"
          >
            <div className="w-full flex flex-col px-5 pt-5 pb-3 scrollbar-hide overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between w-full mb-5">
                <div className="flex gap-4 items-center min-w-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl border border-blue-100 shrink-0 shadow-sm">
                    <IconComponent />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-bold text-[18px] text-gray-900 leading-tight truncate">
                      {ubicacion.Nombre}
                    </h2>
                    <span className="font-medium text-[13px] text-gray-500 mt-0.5">
                      {ubicacion.Categoria ? ubicacion.Categoria.Nombre_Categoria : "Sin Categoría"}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={onClose} 
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600 shrink-0"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              {/* Carrusel */}
              <div className="relative w-full aspect-video bg-gray-100 rounded-[24px] overflow-hidden mb-5 group shadow-inner">
                {imagenes.length > 0 ? (
                  <>
                    <img src={imagenes[imgIndex]} alt={ubicacion.Nombre} className="w-full h-full object-cover" />
                    {imagenes.length > 1 && (
                      <>
                        <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><MdChevronLeft className="w-6 h-6" /></button>
                        <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><MdChevronRight className="w-6 h-6" /></button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full">
                          {imagenes.map((_, idx) => (
                             <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${imgIndex === idx ? 'bg-white' : 'bg-white/40'}`}></div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#f8fafc] text-gray-400">
                    <MdIcons.MdImageNotSupported className="w-8 h-8 mb-1" />
                    <span className="text-[12px] font-medium">Sin imágenes</span>
                  </div>
                )}
              </div>

              {/* Descripcion */}
              <div className="mb-4">
                <p className="text-[14px] text-gray-600 leading-relaxed font-sans px-1">
                  {ubicacion.Descripcion}
                </p>
              </div>

              {showExtras && ubicacion.Detalles_Extras && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-4 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-[13px] text-gray-500 italic leading-relaxed">{ubicacion.Detalles_Extras}</p>
                </motion.div>
              )}

              {ubicacion.Zona && (
                 <div className="flex mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-[12px] font-bold rounded-full border border-blue-100">
                    <MdIcons.MdLocationOn className="w-3.5 h-3.5" />
                    {ubicacion.Zona.Nombre_Zona}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="w-full px-5 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3 shrink-0">
              <button 
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-2xl transition-all ${isFavorite ? 'bg-yellow-50 text-yellow-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                {isFavorite ? <MdStar className="w-7 h-7" /> : <MdStarBorder className="w-7 h-7" />}
              </button>
              <button 
                onClick={handleTrazarRuta}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[16px] py-3.5 rounded-2xl transition-all shadow-[0_8px_20px_rgba(21,93,252,0.3)] flex items-center justify-center gap-2"
              >
                <MdDirectionsWalk className="w-6 h-6" />
                Trazar Ruta
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <ModalConfirmacion isOpen={showModal && modalType==='confirm_delete'} onClose={() => setShowModal(false)} onConfirm={onConfirmModal} titulo="¿Eliminar Favorito?" mensaje={`¿Deseas quitar a ${ubicacion.Nombre} de tu lista?`} textoConfirmar="Eliminar" colorConfirmar="bg-red-600 hover:bg-red-700" />
      <ModalFormulario isOpen={showModal && modalType==='add_notes'} onClose={() => setShowModal(false)} onSubmit={onSaveNotes} titulo="¡Guardado!" subtitulo="¿Quieres agregar detalles adicionales?">
          <div className="space-y-3 pt-2">
            <input type="text" placeholder="Título" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Notas" value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} rows={3} className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
      </ModalFormulario>
    </>
    , document.body
  );
}
