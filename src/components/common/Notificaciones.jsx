import React, { useState, useEffect } from 'react';
import { MdClose, MdNotificationsActive, MdSchool, MdBusinessCenter, MdRestaurant, MdOutlineNotificationsNone, MdSettings, MdSave } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { formatRelativeDate } from '../../utils/formatters';
import Spinner from './Spinner';
import Button from './Button';

function ToggleButton({ checked, onChange }) {
  return (
    <button 
      onClick={onChange}
      className={`relative w-[50px] h-[25px] rounded-[25px] transition-colors shrink-0 ${checked ? 'bg-[#ceddff]' : 'bg-gray-300'}`}
    >
      <div 
        className={`absolute top-[4px] w-[17px] h-[17px] rounded-full transition-transform shadow-sm flex items-center justify-center ${checked ? 'translate-x-[29px] bg-[#0d3796]' : 'translate-x-[4px] bg-white'}`}
      />
    </button>
  );
}

export default function Notificaciones({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  
  const [prefs, setPrefs] = useState({ campus: true, lugares: true });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('Alerta_Global')
        .select('*')
        .eq('Activa', true)
        .order('Fecha_Creacion', { ascending: false });
        
      if (!error && data) {
        setNotifications(data);
      }
      setLoading(false);
    };

    const fetchPrefs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('Usuario')
          .select('Notif_Alertas_Globales, Notif_Recordatorios')
          .eq('ID_Usuario', user.id)
          .single();
        if (data) {
          setPrefs({
            campus: data.Notif_Alertas_Globales ?? true,
            lugares: data.Notif_Recordatorios ?? true
          });
        }
      }
    };

    fetchNotificaciones();
    fetchPrefs();
  }, []);

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('Usuario').update({
        Notif_Alertas_Globales: prefs.campus,
        Notif_Recordatorios: prefs.lugares
      }).eq('ID_Usuario', user.id);
    }
    setSavingPrefs(false);
    setIsPreferencesOpen(false);
  };

  const getIcon = (iconName) => {
    const icons = { MdSchool, MdBusinessCenter, MdRestaurant };
    const Icon = icons[iconName] || MdNotificationsActive;
    return <Icon className="text-[24px] text-blue-600" />;
  };

  return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[456px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-none sm:rounded-l-[30px] z-[60] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
        >
          {!isPreferencesOpen ? (
            <div className="flex flex-col w-full h-full">
              {/* Header Notificaciones */}
              <div className="flex items-center justify-between w-full mb-[30px] shrink-0">
                <div className="flex gap-[20px] items-center">
                  <div className="bg-[#fff4e5] flex items-center justify-center rounded-[100px] w-[60px] h-[60px] shrink-0">
                    <MdNotificationsActive className="text-[#f59e0b] text-[32px]" />
                  </div>
                  <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                    <span className="font-bold text-[#101828] text-[20px] leading-[26px]">Notificaciones</span>
                    <span className="font-medium text-[#f59e0b] text-[15px] leading-[26px]">Novedades y alertas</span>
                  </div>
                </div>
                <button onClick={onClose} className="bg-[#f0f0f0] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0">
                  <MdClose className="text-gray-700 text-[24px]" />
                </button>
              </div>

              {/* Lista */}
              <div className="flex flex-col gap-[16px] w-full pb-[80px]">
                {loading ? (
                  <Spinner color="border-yellow-500" text="Buscando alertas..." />
                ) : notifications.length === 0 ? (
                  <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[16px] border border-gray-100 flex flex-col items-center justify-center gap-2">
                    <MdOutlineNotificationsNone className="text-[48px] text-gray-300" />
                    <span>No tienes notificaciones pendientes.</span>
                  </div>
                ) : (
                  notifications.map((notif, index) => (
                    <div key={notif.ID_Alerta} className="bg-white border rounded-[16px] p-4 flex gap-4 transition-all border-blue-100 shadow-[0px_4px_16px_rgba(21,93,252,0.08)] bg-blue-50/30">
                      <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 bg-[#e8f0fe]">
                        {getIcon(null)}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-[15px] text-gray-800 leading-tight pr-4">{notif.Titulo}</span>
                          <div className="w-[8px] h-[8px] bg-blue-500 rounded-full shrink-0 mt-1"></div>
                        </div>
                        <span className="text-[14px] text-gray-600 leading-snug mb-2">{notif.Mensaje}</span>
                        <span className="text-[12px] font-bold text-gray-400">{formatRelativeDate(notif.Fecha_Creacion)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botón flotante para preferencias */}
              <div className="fixed bottom-[30px] right-[30px] sm:absolute sm:bottom-[30px] sm:right-[30px] z-10">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPreferencesOpen(true);
                  }}
                  className="bg-[#155dfc] hover:bg-blue-700 text-white w-[50px] h-[50px] rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  title="Preferencias de notificaciones"
                >
                  <MdSettings className="text-[24px]" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full h-full">
              {/* Header Preferencias (Mismo estilo que notificaciones) */}
              <div className="flex items-center justify-between w-full mb-[30px] shrink-0">
                <div className="flex gap-[20px] items-center">
                  <div className="bg-[#fff4e5] flex items-center justify-center rounded-[100px] w-[60px] h-[60px] shrink-0">
                    <MdSettings className="text-[#f59e0b] text-[32px]" />
                  </div>
                  <div className="flex flex-col font-['Plus_Jakarta_Sans'] font-medium leading-[26px]">
                    <span className="font-bold text-[#101828] text-[20px]">Notificaciones</span>
                    <span className="text-[#f59e0b] text-[15px]">Preferencias de avisos</span>
                  </div>
                </div>
                <button onClick={() => setIsPreferencesOpen(false)} className="bg-[#f0f0f0] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0">
                  <MdClose className="text-gray-700 text-[24px]" />
                </button>
              </div>

              {/* Body Preferencias */}
              <div className="flex flex-col gap-[20px] w-full flex-1">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-[#101828]">Ajustes de Campus</h3>

                <div className="flex flex-col gap-[16px] w-full">
                  {/* Opción 1 - Estilo de lista de notificaciones */}
                  <div className="bg-white border rounded-[16px] p-4 flex gap-4 items-center transition-all border-blue-100 shadow-[0px_4px_16px_rgba(21,93,252,0.08)] bg-blue-50/30">
                    <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 bg-[#e8f0fe]">
                      <MdSchool className="text-[24px] text-blue-600" />
                    </div>
                    <div className="flex flex-col flex-1 pl-1 font-['Plus_Jakarta_Sans']">
                      <span className="font-bold text-[15px] text-gray-800 leading-tight">Alerta del campus</span>
                      <span className="text-[13px] text-gray-600 leading-snug mt-1">Avisos importantes de la universidad</span>
                    </div>
                    <ToggleButton 
                      checked={prefs.campus} 
                      onChange={() => setPrefs(prev => ({ ...prev, campus: !prev.campus }))} 
                    />
                  </div>
                  
                  {/* Opción 2 - Estilo de lista de notificaciones */}
                  <div className="bg-white border rounded-[16px] p-4 flex gap-4 items-center transition-all border-blue-100 shadow-[0px_4px_16px_rgba(21,93,252,0.08)] bg-blue-50/30">
                    <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 bg-[#e8f0fe]">
                      <MdBusinessCenter className="text-[24px] text-blue-600" />
                    </div>
                    <div className="flex flex-col flex-1 pl-1 font-['Plus_Jakarta_Sans']">
                      <span className="font-bold text-[15px] text-gray-800 leading-tight">Lugares guardados</span>
                      <span className="text-[13px] text-gray-600 leading-snug mt-1">Recordatorios de tus favoritos</span>
                    </div>
                    <ToggleButton 
                      checked={prefs.lugares} 
                      onChange={() => setPrefs(prev => ({ ...prev, lugares: !prev.lugares }))} 
                    />
                  </div>
                </div>
              </div>

              {/* Guardar */}
              <div className="mt-auto pt-6 pb-2">
                <Button onClick={handleSavePrefs} disabled={savingPrefs} variant="primary">
                  <MdSave className="text-[24px] mr-2" />
                  {savingPrefs ? 'Guardando...' : 'Guardar Preferencias'}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </>
  );
}
