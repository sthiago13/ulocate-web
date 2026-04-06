import React, { useEffect, useState } from 'react';
import { MdClose, MdHistory, MdLocationOn, MdDirections, MdAccessTime } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function HistorialRutas({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Simulando carga de historial desde la base de datos
    setTimeout(() => {
      setHistory([
        { id: 1, origen: 'Entrada Principal', destino: 'Facultad de Ingeniería', fecha: 'Hoy, 09:30 AM', duracion: '5 min' },
        { id: 2, origen: 'Facultad de Ingeniería', destino: 'Comedor Universitario', fecha: 'Hoy, 12:45 PM', duracion: '8 min' },
        { id: 3, origen: 'Biblioteca Central', destino: 'Centro de Idiomas', fecha: 'Ayer, 15:20 PM', duracion: '12 min' },
        { id: 4, origen: 'Centro de Idiomas', destino: 'Canchas Deportivas', fecha: 'Ayer, 17:10 PM', duracion: '15 min' }
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <>
      {/* Background Overlay - No onClick para que solo se cierre con la X */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
      />

      {/* Sidebar Modal */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-[90%] sm:w-[456px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-l-[30px] z-[60] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-[30px]">
          <div className="flex gap-[20px] items-center">
            <div className="bg-[#e8f0fe] flex items-center justify-center rounded-[100px] w-[60px] h-[60px] shrink-0">
              <MdHistory className="text-[#155dfc] text-[32px]" />
            </div>
            <div className="flex flex-col font-['Plus_Jakarta_Sans']">
              <span className="font-bold text-[#101828] text-[20px] leading-[26px]">Historial de rutas</span>
              <span className="font-medium text-[#155dfc] text-[15px] leading-[26px]">Tus recorridos recientes</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-[#f0f0f0] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
            title="Cerrar"
          >
            <MdClose className="text-gray-700 text-[24px]" />
          </button>
        </div>

        {/* History List */}
        <div className="flex flex-col gap-[20px] w-full mb-[30px] pb-[40px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-sans text-gray-500 font-medium">Cargando historial...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[16px] border border-gray-100 flex flex-col items-center justify-center gap-2">
              <MdHistory className="text-[48px] text-gray-300" />
              <span>Aún no tienes rutas en tu historial.</span>
            </div>
          ) : (
            history.map((route, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={route.id}
                className="bg-white border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] rounded-[20px] p-[20px] flex flex-col gap-4 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.06)] transition-shadow"
              >
                {/* Meta info */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MdAccessTime className="text-[18px]" />
                    <span className="font-medium text-[13px]">{route.fecha}</span>
                  </div>
                  <div className="bg-[#e8f0fe] text-[#155dfc] text-[12px] font-bold px-3 py-1.5 rounded-full w-fit flex items-center">
                    {route.duracion}
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-3 relative py-1">
                  {/* Vertical line connecting origin and destination */}
                  <div className="absolute left-[11px] top-[24px] bottom-[22px] w-[2px] bg-gray-200"></div>

                  {/* Origen */}
                  <div className="flex items-center gap-4 relative z-10 w-full">
                    <div className="w-[24px] h-[24px] bg-white border-[3px] border-green-500 rounded-full flex items-center justify-center shrink-0 shadow-sm relative">
                    </div>
                    <div className="flex flex-col flex-1 truncate">
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Origen</span>
                      <span className="text-[15px] font-bold text-gray-800 truncate">{route.origen}</span>
                    </div>
                  </div>

                  {/* Destino */}
                  <div className="flex items-center gap-4 relative z-10 w-full mt-2">
                    <div className="w-[24px] h-[24px] bg-[#fff0f0] border-[3px] border-white shadow-[0_0_0_2px_#ef4444] rounded-full flex items-center justify-center shrink-0">
                      <div className="w-[8px] h-[8px] bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex flex-col flex-1 truncate">
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Destino</span>
                      <span className="text-[15px] font-bold text-gray-800 truncate">{route.destino}</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-1 pt-3 border-t border-gray-50">
                  <button className="text-[#155dfc] bg-[#f5f8ff] hover:bg-[#e8f0fe] flex items-center justify-center gap-2 w-full py-[10px] rounded-[12px] text-[14px] font-bold transition-colors">
                    <MdDirections className="text-[20px]" />
                    Repetir ruta
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}
