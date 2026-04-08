import React, { useState, useEffect } from 'react';
import { MdClose, MdEvent, MdEdit, MdAdd, MdPlace, MdCalendarToday } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import SearchBar from './common/SearchBar';
import Spinner from './common/Spinner';
import CrearEvento from './CrearEvento';
import EditarEvento from './EditarEvento';

export default function GestionarEventos({ isOpen, onClose }) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchEventos = async () => {
        setLoading(true);
        // Intentamos cargar de una tabla "Evento" (ajustar si el nombre exacto difiere)
        const { data, error } = await supabase
          .from('Evento')
          .select('*')
          .order('Fecha_Inicio', { ascending: true })
          .limit(20);

        if (data) {
          setEventos(data);
        }
        setLoading(false);
      };

      fetchEventos();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtrados = eventos.filter(evt => {
    const searchLow = searchTerm.toLowerCase();
    const titulo = evt.Nombre || evt.Titulo || '';
    const ubicacion = evt.Ubicacion || evt.Lugar || '';
    return titulo.toLowerCase().includes(searchLow) || ubicacion.toLowerCase().includes(searchLow);
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[70] transition-opacity"
              onClick={onClose}
            />

            {/* Panel Derecha */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] overflow-y-auto bg-[#f9f9f9] flex flex-col pt-[30px] rounded-none sm:rounded-l-[30px] z-[80] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-[30px] w-full mb-[20px] shrink-0">
                <div className="flex gap-[15px] items-center">
                  <div className="bg-purple-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                    <MdEvent className="text-purple-600 text-[28px]" />
                  </div>
                  <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                    <span className="font-bold text-[#101828] text-[20px] leading-[26px]">Gestionar Eventos</span>
                    <span className="font-medium text-gray-500 text-[14px]">Pr├│ximas actividades</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
                >
                  <MdClose className="text-gray-700 text-[24px]" />
                </button>
              </div>

              {/* Buscador */}
              <div className="px-[30px] pb-[15px] shrink-0">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  showFilter={false}
                  placeholder="Buscar por nombre o lugar..."
                />
              </div>

              {/* Content List */}
              <div className="flex-1 overflow-y-auto px-[30px] flex flex-col gap-3 pb-[100px] font-['Plus_Jakarta_Sans']">
                {loading ? (
                  <Spinner text="Cargando pr├│ximos eventos..." />
                ) : filtrados.length === 0 ? (
                  <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[10px] border border-gray-200">
                    No se encontraron eventos para mostrar.
                  </div>
                ) : (
                  filtrados.map((evt) => {
                    const titulo = evt.Nombre || evt.Titulo || 'Evento Sin Nombre';
                    const ubicacion = evt.Ubicacion || evt.Lugar || 'Ubicaci├│n no especificada';
                    const descripcion = evt.Descripcion || '';

                    // Formatear la fecha si existe de forma simple
                    let fechaStr = "Fecha por definir";
                    if (evt.Fecha_Inicio || evt.Fecha) {
                      try {
                        const d = new Date(evt.Fecha_Inicio || evt.Fecha);
                        fechaStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                      } catch (e) { }
                    }

                    return (
                      <div
                        key={evt.ID_Evento}
                        className="flex items-start gap-[15px] bg-white p-[15px] rounded-[15px] shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
                      >
                        {/* Calendario chiquito decorativo */}
                        <div className="flex flex-col items-center justify-center w-[45px] h-[45px] rounded-[12px] bg-purple-50 text-purple-600 shrink-0 border border-purple-100">
                          <MdCalendarToday className="text-[20px]" />
                        </div>

                        {/* Info Evento */}
                        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                          <span className="font-semibold text-[15px] text-[#101828] leading-[20px]">
                            {titulo}
                          </span>

                          {descripcion && (
                            <p className="text-[12px] text-gray-500 mt-1 line-clamp-2 leading-[16px] pr-2">
                              {descripcion}
                            </p>
                          )}

                          <div className="flex items-center gap-1.5 text-gray-500 text-[12px] mt-1.5">
                            <MdCalendarToday className="shrink-0 text-[13px]" />
                            <span className="truncate">{fechaStr}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-gray-500 text-[12px] mt-0.5">
                            <MdPlace className="shrink-0 text-[14px]" />
                            <span className="truncate">{ubicacion}</span>
                          </div>
                        </div>

                        {/* Boton Editar (Lapiz) - Styled like user/places module */}
                        <div className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-center">
                          <button
                            onClick={() => setEditingEvent(evt)}
                            className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-colors"
                            title="Editar evento"
                          >
                            <MdEdit className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sticky Bottom Area: Crear Evento */}
              <div className="absolute bottom-0 left-0 right-0 p-[30px] bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent pointer-events-none">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full bg-[#101828] hover:bg-black transition-colors rounded-[16px] py-[14px] flex justify-center items-center gap-2 shadow-lg hover:shadow-xl pointer-events-auto"
                >
                  <MdAdd className="text-white text-[24px]" />
                  <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                    Crear Evento
                  </span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CrearEvento
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onCreate={async (newEvent) => {
          try {
            // newEvent contains: Nombre, Fecha, Ubicacion, Descripcion
            const dStr = newEvent.Fecha ? new Date(newEvent.Fecha).toISOString() : new Date().toISOString();
            
            const payload = {
              Titulo: newEvent.Nombre,
              Fecha_Inicio: dStr,
              Lugar: newEvent.Ubicacion,
              Descripcion: newEvent.Descripcion
            };

            const { data, error } = await supabase
              .from('Evento')
              .insert(payload)
              .select('*')
              .single();

            if (data) {
              setEventos(prev => [...prev, data]);
            }
          } catch(err) { console.error('Error creando evento', err); }
          setIsCreating(false);
        }}
      />

      <EditarEvento
        isOpen={!!editingEvent}
        evento={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={async (updatedEvent) => {
          try {
            // Asumiendo form idéntico
            const dStr = updatedEvent.Fecha ? new Date(updatedEvent.Fecha).toISOString() : new Date().toISOString();
            
            const payload = {
              Titulo: updatedEvent.Nombre || updatedEvent.Titulo,
              Fecha_Inicio: dStr,
              Lugar: updatedEvent.Ubicacion || updatedEvent.Lugar,
              Descripcion: updatedEvent.Descripcion
            };

            const { data, error } = await supabase
              .from('Evento')
              .update(payload)
              .eq('ID_Evento', updatedEvent.ID_Evento)
              .select('*')
              .single();

            if (data) {
              setEventos(prev => prev.map(e => e.ID_Evento === updatedEvent.ID_Evento ? data : e));
            }
          } catch(err) { console.error('Error actualizando evento', err); }
          setEditingEvent(null);
        }}
      />
    </>
  );
}