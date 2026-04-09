import React, { useState, useEffect } from 'react';
import { MdClose, MdNotificationsActive, MdSchool, MdBusinessCenter, MdOutlineNotificationsNone, MdSettings, MdSave, MdCampaign, MdStar, MdPlace } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { formatRelativeDate } from '../../utils/formatters';
import Spinner from '../common/Spinner';
import Button from '../common/Button';

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
    const fetchAll = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Preferencias del usuario
      let userPrefs = { campus: true, lugares: true };
      if (user) {
        const { data: dbUser } = await supabase
          .from('Usuario')
          .select('Notif_Alertas_Globales, Notif_Recordatorios')
          .eq('ID_Usuario', user.id)
          .single();
        if (dbUser) {
          userPrefs = {
            campus: dbUser.Notif_Alertas_Globales ?? true,
            lugares: dbUser.Notif_Recordatorios ?? true,
          };
          setPrefs(userPrefs);
        }
      }

      const combined = [];

      // 2. Alertas globales (solo si preferencia activa)
      if (userPrefs.campus) {
        const { data: alertas } = await supabase
          .from('Alerta_Global')
          .select('*, Ubicacion(ID_Ubicacion, Nombre, Categoria(Icono, Nombre_Categoria))')
          .eq('Activa', true)
          .or(`Fecha_Expiracion.is.null,Fecha_Expiracion.gt.${new Date().toISOString()}`)
          .order('Fecha_Creacion', { ascending: false });

        if (alertas) {
          alertas.forEach(a => combined.push({ tipo: 'global', data: a, fecha: a.Fecha_Creacion }));
        }
      }

      // 3. Recordatorios de lugares favoritos (solo si preferencia activa y hay sesión)
      if (userPrefs.lugares && user) {
        const { data: favs } = await supabase
          .from('Ubicacion_Guardada')
          .select('*, Ubicacion(ID_Ubicacion, Nombre, Categoria(Icono, Nombre_Categoria))')
          .eq('ID_Usuario', user.id)
          .order('ID_Guardado', { ascending: false });

        if (favs) {
          // Solo mostrar favoritos que tengan día y/o hora agendados
          favs
            .filter(f => f.Dia_Semana || f.Hora)
            .forEach(f => combined.push({ tipo: 'favorito', data: f, fecha: null }));
        }
      }

      // Ordenar: globales primero, luego favoritos (las globales ya tienen fecha)
      combined.sort((a, b) => {
        if (a.tipo === b.tipo) return 0;
        return a.tipo === 'global' ? -1 : 1;
      });

      setNotifications(combined);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('Usuario').update({
        Notif_Alertas_Globales: prefs.campus,
        Notif_Recordatorios: prefs.lugares,
      }).eq('ID_Usuario', user.id);
    }
    setSavingPrefs(false);
    setIsPreferencesOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
      />

      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[456px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-none sm:rounded-l-[30px] z-[60] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
      >
        {!isPreferencesOpen ? (
          <div className="flex flex-col w-full h-full">
            {/* Header */}
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
            <div className="flex flex-col gap-[14px] w-full pb-[80px]">
              {loading ? (
                <Spinner color="border-yellow-500" text="Buscando notificaciones..." />
              ) : notifications.length === 0 ? (
                <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[16px] border border-gray-100 flex flex-col items-center justify-center gap-2">
                  <MdOutlineNotificationsNone className="text-[48px] text-gray-300" />
                  <span>No tienes notificaciones pendientes.</span>
                </div>
              ) : (
                notifications.map((notif, index) => {
                  if (notif.tipo === 'global') {
                    // ── Alerta Global ──────────────────────────────────────
                    const alerta = notif.data;
                    const iconoKey = alerta.Ubicacion?.Categoria?.Icono;
                    const IconoComp = (iconoKey && MdIcons[iconoKey]) ? MdIcons[iconoKey] : MdCampaign;
                    const nombreLugar = alerta.Ubicacion?.Nombre;

                    return (
                      <div
                        key={`global-${alerta.ID_Alerta}`}
                        className="bg-amber-50/40 border border-amber-100 rounded-[16px] p-4 flex gap-4 transition-all shadow-[0px_4px_16px_rgba(245,158,11,0.08)]"
                      >
                        {/* Icono */}
                        <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 bg-amber-100">
                          <IconoComp className="text-[24px] text-amber-600" />
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                          {/* Badge tipo + título */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex flex-col min-w-0">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 w-fit mb-1">
                                <MdCampaign className="text-[11px]" /> Aviso Global
                              </span>
                              <span className="font-bold text-[15px] text-gray-800 leading-tight">{alerta.Titulo}</span>
                            </div>
                            <div className="w-[8px] h-[8px] bg-amber-500 rounded-full shrink-0 mt-1" />
                          </div>

                          <span className="text-[13px] text-gray-600 leading-snug mb-1">{alerta.Mensaje}</span>

                          {nombreLugar && (
                            <div className="flex items-center gap-1 text-[12px] text-amber-700 mb-1">
                              <MdPlace className="text-[13px] shrink-0" />
                              <span className="truncate">{nombreLugar}</span>
                            </div>
                          )}

                          <span className="text-[11px] font-bold text-gray-400">{formatRelativeDate(alerta.Fecha_Creacion)}</span>
                        </div>
                      </div>
                    );
                  } else {
                    // ── Recordatorio de Favorito ───────────────────────────
                    const fav = notif.data;
                    const ubi = fav.Ubicacion || {};
                    const cat = ubi.Categoria || {};
                    const IconoFav = (cat.Icono && MdIcons[cat.Icono]) ? MdIcons[cat.Icono] : MdPlace;
                    const titulo = fav.Titulo_Guardado || ubi.Nombre || 'Lugar guardado';

                    return (
                      <div
                        key={`fav-${fav.ID_Guardado}`}
                        className="bg-yellow-50/40 border border-yellow-100 rounded-[16px] p-4 flex gap-4 transition-all shadow-[0px_4px_16px_rgba(234,179,8,0.08)]"
                      >
                        {/* Icono */}
                        <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 bg-yellow-100">
                          <IconoFav className="text-[24px] text-yellow-600" />
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex flex-col min-w-0">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-700 bg-yellow-100 rounded-full px-2 py-0.5 w-fit mb-1">
                                <MdStar className="text-[11px]" /> Lugar Favorito
                              </span>
                              <span className="font-bold text-[15px] text-gray-800 leading-tight">{titulo}</span>
                            </div>
                            <div className="w-[8px] h-[8px] bg-yellow-500 rounded-full shrink-0 mt-1" />
                          </div>

                          <span className="text-[13px] text-gray-600 leading-snug mb-1">
                            {cat.Nombre_Categoria || 'Sin categoría'}{ubi.Nombre ? ` · ${ubi.Nombre}` : ''}
                          </span>

                          {fav.Dia_Semana && (
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-yellow-700 bg-yellow-100 rounded-full px-2 py-0.5 font-bold">
                                {fav.Dia_Semana}{fav.Hora ? ` · ${fav.Hora.substring(0, 5)}` : ''}
                              </span>
                            </div>
                          )}

                          {fav.Datos_Adicionales && (
                            <span className="text-[12px] text-gray-500 mt-1 line-clamp-1">{fav.Datos_Adicionales}</span>
                          )}
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>

            {/* Botón flotante preferencias */}
            <div className="fixed bottom-[30px] right-[30px] sm:absolute sm:bottom-[30px] sm:right-[30px] z-10">
              <button
                onClick={(e) => { e.stopPropagation(); setIsPreferencesOpen(true); }}
                className="bg-[#155dfc] hover:bg-blue-700 text-white w-[50px] h-[50px] rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                title="Preferencias de notificaciones"
              >
                <MdSettings className="text-[24px]" />
              </button>
            </div>
          </div>
        ) : (
          // ── Panel de Preferencias ─────────────────────────────────────────
          <div className="flex flex-col w-full h-full">
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

            <div className="flex flex-col gap-[20px] w-full flex-1">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-[#101828]">Ajustes de Campus</h3>

              <div className="flex flex-col gap-[16px] w-full">
                {/* Alertas Globales */}
                <div className="bg-amber-50/40 border border-amber-100 rounded-[16px] p-4 flex gap-4 items-center shadow-[0px_4px_16px_rgba(245,158,11,0.08)]">
                  <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 bg-amber-100">
                    <MdCampaign className="text-[24px] text-amber-600" />
                  </div>
                  <div className="flex flex-col flex-1 pl-1 font-['Plus_Jakarta_Sans']">
                    <span className="font-bold text-[15px] text-gray-800 leading-tight">Avisos del campus</span>
                    <span className="text-[13px] text-gray-600 leading-snug mt-1">Alertas globales de la universidad</span>
                  </div>
                  <ToggleButton checked={prefs.campus} onChange={() => setPrefs(prev => ({ ...prev, campus: !prev.campus }))} />
                </div>

                {/* Favoritos */}
                <div className="bg-yellow-50/40 border border-yellow-100 rounded-[16px] p-4 flex gap-4 items-center shadow-[0px_4px_16px_rgba(234,179,8,0.08)]">
                  <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 bg-yellow-100">
                    <MdStar className="text-[24px] text-yellow-600" />
                  </div>
                  <div className="flex flex-col flex-1 pl-1 font-['Plus_Jakarta_Sans']">
                    <span className="font-bold text-[15px] text-gray-800 leading-tight">Lugares guardados</span>
                    <span className="text-[13px] text-gray-600 leading-snug mt-1">Recordatorios de tus favoritos</span>
                  </div>
                  <ToggleButton checked={prefs.lugares} onChange={() => setPrefs(prev => ({ ...prev, lugares: !prev.lugares }))} />
                </div>
              </div>
            </div>

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
