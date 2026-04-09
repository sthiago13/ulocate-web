import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdClose, MdNavigation, MdMyLocation, MdSearch, MdPlace, MdSwapVert } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoutePlanner({ 
  onClose, 
  onExecute, 
  initialDestination, 
  ubicaciones = [], 
  userPosition 
}) {
  const [origin, setOrigin] = useState(null); // { id, nombre, type: 'location' | 'gps' }
  const [destination, setDestination] = useState(initialDestination || null);
  
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState(initialDestination?.nombre || initialDestination?.Nombre || '');
  
  const [activeField, setActiveField] = useState(null); // 'origin' | 'destination'
  
  const results = (term) => {
    if (!term || term.length < 2) return [];
    return ubicaciones.filter(u => 
      u.nombre.toLowerCase().includes(term.toLowerCase()) ||
      u.categoria.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5);
  };

  const handleSelectOrigin = (loc) => {
    setOrigin({ id: loc.id, nodeId: loc.nodeId, nombre: loc.nombre, type: 'location' });
    setOriginSearch(loc.nombre);
    setActiveField(null);
  };

  const handleSelectDest = (loc) => {
    setDestination(loc);
    setDestSearch(loc.nombre);
    setActiveField(null);
  };

  const handleUseGPS = () => {
    if (!userPosition) {
      alert("No se ha detectado tu ubicación GPS aún. Asegúrate de dar permisos de geolocalización.");
      return;
    }
    setOrigin({ id: 'gps', nombre: 'Mi ubicación actual', type: 'gps' });
    setOriginSearch('Mi ubicación actual');
    setActiveField(null);
  };

  const handleSwap = () => {
    const tempO = origin;
    const tempD = destination;
    const tempOS = originSearch;
    const tempDS = destSearch;

    if (tempD) {
       setOrigin({ id: tempD.id, nodeId: tempD.nodeId, nombre: tempD.nombre, type: 'location' });
       setOriginSearch(tempD.nombre);
    } else {
       setOrigin(null);
       setOriginSearch('');
    }

    if (tempO && tempO.type === 'location') {
       const locObj = ubicaciones.find(u => u.id === tempO.id);
       setDestination(locObj);
       setDestSearch(tempO.nombre);
    } else if (tempO && tempO.type === 'gps') {
       // GPS can't be destination for now in the routing engine easily without a node
       alert("Solo puedes usar ubicaciones fijas como destino.");
    } else {
       setDestination(null);
       setDestSearch('');
    }
  };

  return createPortal(
    <>
      {/* Overlay transparente para cerrar al hacer clic fuera si se desea, por ahora solo el panel */}
      <div className="fixed inset-0 z-[9990] pointer-events-none">
        
        <motion.div
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 100, opacity: 0, x: '-50%' }}
          className="fixed bottom-24 left-1/2 w-[92%] sm:w-[420px] bg-white rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.15)] p-5 border border-blue-50 pointer-events-auto flex flex-col gap-4 font-['Plus_Jakarta_Sans']"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <MdNavigation className="text-[18px]" />
              </div>
              <h3 className="font-bold text-gray-800 text-[17px]">Planificar Ruta</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <MdClose className="text-[20px]" />
            </button>
          </div>

          {/* Inputs Section */}
          <div className="relative flex flex-col gap-2">
            
            {/* Origen */}
            <div className="relative">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${activeField === 'origin' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 bg-gray-50'}`}>
                <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 shrink-0" />
                <input 
                  type="text"
                  placeholder="Punto de origen..."
                  value={originSearch}
                  onFocus={() => setActiveField('origin')}
                  onChange={(e) => { setOriginSearch(e.target.value); if(origin) setOrigin(null); }}
                  className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-800 placeholder-gray-400"
                />
                <button 
                  onClick={handleUseGPS}
                  className={`p-1.5 rounded-lg transition-colors ${origin?.type === 'gps' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-100'}`}
                  title="Usar mi ubicación"
                >
                  <MdMyLocation className="text-[20px]" />
                </button>
              </div>

              {/* Dropdown Origen */}
              <AnimatePresence>
                {activeField === 'origin' && (originSearch?.length || 0) >= 2 && !origin && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden max-h-[180px] overflow-y-auto"
                  >
                    {results(originSearch).map(loc => (
                      <button 
                        key={loc.id} 
                        onClick={() => handleSelectOrigin(loc)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-none text-left"
                      >
                         <MdPlace className="text-blue-500 shrink-0" />
                         <div className="flex flex-col min-w-0">
                           <span className="text-sm font-bold text-gray-800 truncate">{loc.nombre}</span>
                           <span className="text-[11px] text-gray-500 truncate">{loc.categoria}</span>
                         </div>
                      </button>
                    ))}
                    {results(originSearch).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-400 italic">No se encontraron lugares</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Swap Button Floating */}
            <button 
              onClick={handleSwap}
              className="absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all z-[5]"
            >
              <MdSwapVert className="text-[20px]" />
            </button>

            {/* Destino */}
            <div className="relative">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${activeField === 'destination' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 bg-gray-50'}`}>
                <div className="w-2.5 h-2.5 bg-red-500 rounded-sm shrink-0" />
                <input 
                  type="text"
                  placeholder="Punto de destino..."
                  value={destSearch}
                  onFocus={() => setActiveField('destination')}
                  onChange={(e) => { setDestSearch(e.target.value); if(destination) setDestination(null); }}
                  className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Dropdown Destino */}
              <AnimatePresence>
                {activeField === 'destination' && (destSearch?.length || 0) >= 2 && !destination && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden max-h-[180px] overflow-y-auto"
                  >
                    {results(destSearch).map(loc => (
                      <button 
                        key={loc.id} 
                        onClick={() => handleSelectDest(loc)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-none text-left"
                      >
                         <MdPlace className="text-red-500 shrink-0" />
                         <div className="flex flex-col min-w-0">
                           <span className="text-sm font-bold text-gray-800 truncate">{loc.nombre}</span>
                           <span className="text-[11px] text-gray-500 truncate">{loc.categoria}</span>
                         </div>
                      </button>
                    ))}
                    {results(destSearch).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-400 italic">No se encontraron lugares</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Button */}
          <button
            disabled={!origin || !destination}
            onClick={() => onExecute(origin, destination)}
            className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${(!origin || !destination) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95'}`}
          >
            <MdDirectionsWalk className="text-[22px]" />
            Comenzar Navegación
          </button>
        </motion.div>
      </div>
    </>,
    document.body
  );
}

function MdDirectionsWalk(props) {
    return <MdIcons.MdDirectionsWalk {...props} />;
}
