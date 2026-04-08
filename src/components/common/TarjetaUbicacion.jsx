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
 * TarjetaUbicacion - Versión híbrida (LocalDB + Supabase) con UI Premium del equipo.
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
      
      // 1. Detección de ID LOCAL
      if (typeof ubicacionId === 'string' && ubicacionId.startsWith('ubi_')) {
        const localData = getUbicaciones().find(u => u.id === ubicacionId);
        if (localData) {
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
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        
        const { data: ubiData } = await supabase
          .from('Ubicacion')
          .select(`*, Categoria (*), Zona (*)`)
          .eq('ID_Ubicacion', ubicacionId)
          .single();
          
        if (ubiData) {
          setUbicacion(ubiData);
          const { data: imgData } = await supabase.from('Referencias_Visuales').select('URL_Imagen').eq('ID_Ubicacion', ubicacionId);
          if (imgData) setImagenes(imgData.map(i => i.URL_Imagen).filter(url => url));

          if (currentUser) {
            const { data: favData } = await supabase.from('Ubicacion_Guardada').select('ID_Guardado').eq('ID_Usuario', currentUser.id).eq('ID_Ubicacion', ubicacionId).maybeSingle();
            if (favData) { setIsFavorite(true); setFavoriteId(favData.ID_Guardado); }
          }
        }
      } catch (err) {
        console.warn("Aviso: No se pudo cargar desde Supabase (ID Local probable):", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [ubicacionId]);

  const handleTrazarRuta = () => {
    const targetUbi = {
      id: ubicacion.ID_Ubicacion,
      nombre: ubicacion.Nombre,
      nodeId: ubicacion.ID_Nodo || ubicacion.nodeId,
      categoria: ubicacion.Categoria?.Nombre_Categoria || ''
    };
    localStorage.setItem('active_route_target', JSON.stringify(targetUbi));
    window.dispatchEvent(new Event('route_triggered'));
    onClose();
  };

  const handleToggleFavorite = async () => {
    if (!user) return;
    if (isFavorite) { setModalType('confirm_delete'); setShowModal(true); } 
    else {
      const { data, error } = await supabase.from('Ubicacion_Guardada').insert({
        ID_Usuario: user.id, ID_Ubicacion: ubicacionId, Titulo_Guardado: ubicacion.Nombre
      }).select('ID_Guardado').single();
      if (!error && data) {
        setIsFavorite(true); setFavoriteId(data.ID_Guardado);
        setFormData({ titulo: ubicacion.Nombre, dia: '', hora: '', notas: '' });
        setModalType('add_notes'); setShowModal(true);
      }
    }
  };

  if (loading) return createPortal(<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-sm"><div className="bg-white p-8 rounded-3xl shadow-2xl"><Spinner text="Cargando ubicación..." /></div></div>, document.body);
  if (!ubicacion) return null;

  const IconComponent = ubicacion.Categoria && ubicacion.Categoria.Icono && MdIcons[ubicacion.Categoria.Icono] ? MdIcons[ubicacion.Categoria.Icono] : MdIcons.MdPlace;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] pointer-events-none flex justify-center items-end pb-[95px] md:pb-0 md:items-center md:justify-start">
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, x: -30, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: -30, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="relative w-[92%] sm:w-[380px] h-fit max-h-[75vh] md:max-h-[calc(100vh-140px)] bg-white md:rounded-l-none rounded-[32px] shadow-[0_12px_50px_rgba(0,0,0,0.2)] flex flex-col pointer-events-auto overflow-hidden mx-auto md:mx-0">
            <div className="w-full flex flex-col px-5 pt-5 pb-3 overflow-y-auto scrollbar-hide">
              <div className="flex items-start justify-between w-full mb-5">
                <div className="flex gap-4 items-center min-w-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl border border-blue-100 shrink-0 shadow-sm"><IconComponent /></div>
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-bold text-[18px] text-gray-900 leading-tight truncate">{ubicacion.Nombre}</h2>
                    <span className="font-medium text-[13px] text-gray-500 mt-0.5">{ubicacion.Categoria?.Nombre_Categoria || "Sin Categoría"}</span>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600 shrink-0"><MdClose className="w-6 h-6" /></button>
              </div>
              <div className="relative w-full aspect-video bg-gray-100 rounded-[24px] overflow-hidden mb-5 group shadow-inner">
                {imagenes.length > 0 ? (
                  <>
                    <img src={imagenes[imgIndex]} alt={ubicacion.Nombre} className="w-full h-full object-cover" />
                    {imagenes.length > 1 && (<><button onClick={() => setImgIndex(Math.max(0, imgIndex-1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white opacity-0 group-hover:opacity-100"><MdChevronLeft /></button><button onClick={() => setImgIndex((imgIndex+1)%imagenes.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white opacity-0 group-hover:opacity-100"><MdChevronRight /></button></>)}
                  </>
                ) : <div className="w-full h-full flex flex-col items-center justify-center bg-[#f8fafc] text-gray-400"><MdIcons.MdImageNotSupported className="w-8 h-8" /></div>}
              </div>
              <div className="mb-4 text-[14px] text-gray-600 leading-relaxed font-sans px-1 text-pretty">{ubicacion.Descripcion}</div>
              {ubicacion.Zona && <div className="flex mb-4"><span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-[12px] font-bold rounded-full border border-blue-100"><MdIcons.MdLocationOn />{ubicacion.Zona.Nombre_Zona}</span></div>}
            </div>
            <div className="w-full px-5 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3 shrink-0">
              <button onClick={handleToggleFavorite} className={`p-3 rounded-2xl transition-all ${isFavorite ? 'bg-yellow-50 text-yellow-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{isFavorite ? <MdStar className="w-7 h-7" /> : <MdStarBorder className="w-7 h-7" />}</button>
              <button onClick={handleTrazarRuta} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[16px] py-3.5 rounded-2xl shadow-[0_8px_20px_rgba(21,93,252,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95"><MdDirectionsWalk className="w-6 h-6" />Trazar Ruta</button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <ModalConfirmacion isOpen={showModal && modalType==='confirm_delete'} onClose={() => setShowModal(false)} onConfirm={async () => { await supabase.from('Ubicacion_Guardada').delete().eq('ID_Guardado', favoriteId); setIsFavorite(false); setShowModal(false); }} titulo="¿Eliminar?" mensaje="¿Quitar de favoritos?" textoConfirmar="Eliminar" colorConfirmar="bg-red-600" />
      <ModalFormulario isOpen={showModal && modalType==='add_notes'} onClose={() => setShowModal(false)} onSubmit={async () => { if (favoriteId) await supabase.from('Ubicacion_Guardada').update({ Titulo_Guardado: formData.titulo, Datos_Adicionales: formData.notas }).eq('ID_Guardado', favoriteId); setShowModal(false); }} titulo="¡Guardado!" subtitulo="Añadir notas opcionales">
          <div className="space-y-3 pt-2"><input type="text" placeholder="Título" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-4 py-2 bg-gray-50 rounded-xl" /><textarea placeholder="Notas" value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} rows={3} className="w-full px-4 py-2 bg-gray-50 rounded-xl resize-none" /></div>
      </ModalFormulario>
    </>
    , document.body
  );
}
