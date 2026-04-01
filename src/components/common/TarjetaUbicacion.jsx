import React, { useEffect, useState } from 'react';
import { MdClose, MdStarBorder, MdStar } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { ubicaciones, categorias, zonas } from '../../data/mockData';

export default function TarjetaUbicacion({ ubicacionId, onClose }) {
  const [ubicacion, setUbicacion] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [zona, setZona] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  useEffect(() => {
    if (ubicacionId) {
      const ubi = ubicaciones.find(u => u.ID_Ubicacion === ubicacionId);
      if (ubi) {
        setUbicacion(ubi);
        setCategoria(categorias.find(c => c.ID_Categoria === ubi.ID_Categoria));
        setZona(zonas.find(z => z.ID_Zona === ubi.ID_Zona));
      }
    }
  }, [ubicacionId]);

  if (!ubicacion) return null;

  // Render dinamico del icono segun la BD, default: MdPlace
  const IconComponent = categoria && categoria.Icono && MdIcons[categoria.Icono] 
    ? MdIcons[categoria.Icono] 
    : MdIcons.MdPlace;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-10 pointer-events-none flex justify-center items-end pb-[95px] md:pb-0 md:items-center md:justify-start">
        
        {/* Modal / Sidebar ajustado */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-[92%] sm:w-[380px] md:ml-[0px] h-fit max-h-[75vh] md:max-h-[calc(100vh-180px)] bg-white md:rounded-l-none  rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] flex flex-col pointer-events-auto overflow-hidden z-20 mx-auto md:mx-0"
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
                    {categoria ? categoria.Nombre_Categoria : "Desconocido"}
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

            {/* Imagen Principal */}
            <div className="w-full aspect-video bg-gray-100 rounded-[24px] overflow-hidden mb-5">
              <img 
                src={ubicacion.URL_Imagen} 
                alt={ubicacion.Nombre} 
                className="w-full h-full object-cover"
              />
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
            {zona && (
              <div className="flex justify-center mb-1">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 text-sm font-jakarta font-medium rounded-full shadow-sm">
                  <MdIcons.MdLocationOn className="w-4 h-4 text-blue-500" />
                  {zona.Nombre_Zona}
                </span>
              </div>
            )}

            <div className="h-8"></div> {/* Spacer inferior */}
          </div>

          {/* Footer de Acciones Fijo */}
          <div className="w-full px-5 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3 shrink-0">
            <button 
                onClick={() => setIsFavorite(!isFavorite)}
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
  );
}
