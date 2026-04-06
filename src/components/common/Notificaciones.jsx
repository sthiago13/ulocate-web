import React, { useState, useEffect } from 'react';
import { MdClose, MdNotificationsActive, MdSchool, MdBusinessCenter, MdRestaurant, MdOutlineNotificationsNone } from 'react-icons/md';
import { motion } from 'framer-motion';
import { notificaciones as mockNotificaciones } from '../../data/mockData';

export default function Notificaciones({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando carga de datos desde mockData
    setTimeout(() => {
      setNotifications(mockNotificaciones || []);
      setLoading(false);
    }, 600);
  }, []);

  const getIcon = (iconName) => {
    const icons = {
      MdSchool,
      MdBusinessCenter,
      MdRestaurant
    };
    const Icon = icons[iconName] || MdNotificationsActive;
    return <Icon className="text-[24px] text-blue-600" />;
  };

  return (
    <>
      {/* Background Overlay */}
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
        className="fixed top-0 right-0 h-full w-[90%] sm:w-[456px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-l-[30px] z-[60] shadow-[-4px_0_30px_rgba(0,0,0,0.15)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-[30px]">
          <div className="flex gap-[20px] items-center">
            <div className="bg-[#fff4e5] flex items-center justify-center rounded-[100px] w-[60px] h-[60px] shrink-0">
              <MdNotificationsActive className="text-[#f59e0b] text-[32px]" />
            </div>
            <div className="flex flex-col font-['Plus_Jakarta_Sans']">
              <span className="font-bold text-[#101828] text-[20px] leading-[26px]">Notificaciones</span>
              <span className="font-medium text-[#f59e0b] text-[15px] leading-[26px]">Novedades y alertas</span>
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

        {/* Notificaciones List */}
        <div className="flex flex-col gap-[16px] w-full pb-[40px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-sans text-gray-500 font-medium">Buscando alertas...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[16px] border border-gray-100 flex flex-col items-center justify-center gap-2">
              <MdOutlineNotificationsNone className="text-[48px] text-gray-300" />
              <span>No tienes notificaciones pendientes.</span>
            </div>
          ) : (
            notifications.map((notif, index) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={notif.ID_Notificacion}
                className={`bg-white border rounded-[16px] p-4 flex gap-4 transition-all ${notif.Leida ? 'border-gray-100 opacity-70' : 'border-blue-100 shadow-[0px_4px_16px_rgba(21,93,252,0.08)] bg-blue-50/30'
                  }`}
              >
                <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 ${notif.Leida ? 'bg-gray-100' : 'bg-[#e8f0fe]'
                  }`}>
                  {getIcon(notif.Icono)}
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[15px] text-gray-800 leading-tight pr-4">
                      {notif.Titulo}
                    </span>
                    {!notif.Leida && <div className="w-[8px] h-[8px] bg-blue-500 rounded-full shrink-0 mt-1"></div>}
                  </div>
                  <span className="text-[14px] text-gray-600 leading-snug mb-2">
                    {notif.Mensaje}
                  </span>
                  <span className="text-[12px] font-bold text-gray-400">
                    {notif.Tiempo}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}
