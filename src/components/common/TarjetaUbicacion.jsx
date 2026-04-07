import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MdClose, MdStarBorder, MdStar, MdDirectionsWalk, MdPlace } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICONS = {
  'Académico':      '🎓',
  'Alimentación':   '🍽️',
  'Servicios':      '🛠️',
  'Administrativo': '🏛️',
  'Recreación':     '⚽',
};

/**
 * TarjetaUbicacion – ahora recibe directamente el objeto `ubicacion`
 * desde localDB (no un ID de Supabase).
 *
 * Estructura esperada:
 * {
 *   id: string,
 *   nodeId: string,
 *   nombre: string,
 *   descripcion: string,
 *   categoria: string,
 *   icono: string,
 * }
 */
export default function TarjetaUbicacion({ ubicacion, onClose }) {
  const [isFavorite, setIsFavorite] = useState(() => {
    const favs = JSON.parse(localStorage.getItem('unet_favoritos') || '[]');
    return favs.includes(ubicacion?.id);
  });
  const [routeTriggered, setRouteTriggered] = useState(false);

  if (!ubicacion) return null;

  const emoji = ubicacion.icono || CATEGORY_ICONS[ubicacion.categoria] || '📍';

  const toggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem('unet_favoritos') || '[]');
    let newFavs;
    if (isFavorite) {
      newFavs = favs.filter(id => id !== ubicacion.id);
    } else {
      newFavs = [...favs, ubicacion.id];
    }
    localStorage.setItem('unet_favoritos', JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  };

  const handleTrazarRuta = () => {
    // Guardar el objetivo de la ruta y disparar el evento
    localStorage.setItem('active_route_target', JSON.stringify(ubicacion));
    window.dispatchEvent(new Event('route_triggered'));
    setRouteTriggered(true);
    onClose();
  };

  return createPortal(
    <div 
      style={{ zIndex: 9999 }}
      className="fixed inset-0 pointer-events-none flex justify-center items-end pb-[95px] md:pb-0 md:items-center md:justify-start"
    >
      <AnimatePresence>
        <motion.div
          key="tarjeta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-[92%] sm:w-[380px] md:ml-0 bg-white md:rounded-l-none rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.15)] flex flex-col pointer-events-auto mx-auto md:mx-0 overflow-hidden"
        >
          {/* Cabecera de color */}
          <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 pt-6 pb-8 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
            >
              <MdClose className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-jakarta font-bold text-[20px] text-white leading-tight truncate">
                  {ubicacion.nombre}
                </h2>
                <span className="font-jakarta font-normal text-[13px] text-blue-100 flex items-center gap-1 mt-0.5">
                  <MdPlace className="w-4 h-4" />
                  {ubicacion.categoria || 'Sin categoría'}
                </span>
              </div>
              <button
                onClick={toggleFavorite}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white shrink-0"
              >
                {isFavorite
                  ? <MdStar className="w-6 h-6 text-yellow-300" />
                  : <MdStarBorder className="w-6 h-6" />
                }
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-6 py-5 flex flex-col gap-4">
            {ubicacion.descripcion ? (
              <p className="text-gray-600 text-[14px] leading-relaxed font-sans">
                {ubicacion.descripcion}
              </p>
            ) : (
              <p className="text-gray-400 text-[13px] italic font-sans">
                Sin descripción disponible.
              </p>
            )}

            {/* Info nodo */}
            <div className="bg-blue-50 rounded-xl p-3 text-[12px] text-blue-700 font-sans">
              🔗 Nodo ID: <span className="font-mono font-bold">{ubicacion.nodeId || 'Sin asignar'}</span>
            </div>

            {/* Botón Trazar Ruta */}
            <button
              onClick={handleTrazarRuta}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-jakarta font-semibold text-[16px] py-4 rounded-2xl transition-all shadow-[0_4px_12px_rgba(21,93,252,0.35)] flex items-center justify-center gap-2"
            >
              <MdDirectionsWalk className="w-6 h-6" />
              Trazar Ruta
            </button>

            {ubicacion.nodeId ? null : (
              <p className="text-[12px] text-amber-600 text-center -mt-2">
                ⚠️ Este lugar no está conectado a un nodo del mapa aún.
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
