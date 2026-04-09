import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose, MdEdit, MdDelete, MdAddLink, MdPlace, MdArrowBack,
  MdSearch, MdAdd, MdWarning, MdHideSource
} from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { supabase } from '../../lib/supabaseClient';
import ModalConfirmacion from '../common/ModalConfirmacion';
import EditorLugar from './EditorLugar';

export default function NodeEditorPanel({
  node,                    // { id, lat, lng, label }
  ubicacion,               // objeto ubicacion (mappedUbi) o null
  isOpen,
  onClose,
  onStartConnect,          // () => void – activa modo conexión desde este nodo
  onDeleteNode,            // (nodeId) => void
  onOpenGestionarLugares,  // (searchTerm) => void
  onReloadMap,             // () => void
}) {
  // ── Draggable ──────────────────────────────────────────────────────────────
  const panelRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('[data-drag-handle]')) {
      e.preventDefault();
      dragState.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    }
  }, [pos]);
  const onMouseMove = useCallback((e) => {
    if (!dragState.current.dragging) return;
    setPos({ x: dragState.current.origX + (e.clientX - dragState.current.startX), y: dragState.current.origY + (e.clientY - dragState.current.startY) });
  }, []);
  const onMouseUp = useCallback(() => { dragState.current.dragging = false; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  // ── Vistas: 'actions' | 'assign_place' ─────────────────────────────────────
  const [view, setView] = useState('actions');
  const [searchTerm, setSearchTerm]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]       = useState(false);
  const [confirmAssign, setConfirmAssign] = useState({ isOpen: false, place: null });
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Reset al cambiar de nodo
  useEffect(() => {
    if (isOpen) {
      setPos({ x: 0, y: 0 });
      setView('actions');
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [isOpen, node?.id]);

  // Búsqueda de lugares existentes
  useEffect(() => {
    if (view !== 'assign_place') return;
    const run = async () => {
      setSearching(true);
      let q = supabase.from('Ubicacion').select('*, Categoria(*)').order('Nombre');
      if (searchTerm.trim()) q = q.ilike('Nombre', `%${searchTerm}%`);
      const { data } = await q.limit(25);
      setSearchResults(data || []);
      setSearching(false);
    };
    const timer = setTimeout(run, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, view]);

  // Reasignar lugar existente a este nodo
  const handleAssignPlace = async () => {
    const place = confirmAssign.place;
    if (!place || !node) return;
    const { error } = await supabase
      .from('Ubicacion')
      .update({ ID_Nodo: node.id })
      .eq('ID_Ubicacion', place.ID_Ubicacion);
    if (!error) {
      setConfirmAssign({ isOpen: false, place: null });
      onReloadMap?.();
      onClose();
    }
  };

  if (!node) return null;

  const IconComp = ubicacion?.supaObj?.Categoria?.Icono && MdIcons[ubicacion.supaObj.Categoria.Icono]
    ? MdIcons[ubicacion.supaObj.Categoria.Icono]
    : MdIcons.MdPlace;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onMouseDown={onMouseDown}
            style={{
              zIndex: 9999,
              position: 'fixed',
              top:  `calc(80px + ${pos.y}px)`,
              left: `calc(16px + ${pos.x}px)`,
              userSelect: 'none',
            }}
            className="w-[280px] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.14)] border border-gray-100 overflow-hidden font-['Plus_Jakarta_Sans']"
          >
            {/* Header – drag handle */}
            <div
              data-drag-handle="true"
              className="flex items-center justify-between px-4 py-3 bg-[#155dfc] cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-2">
                {view === 'assign_place' && (
                  <button
                    onClick={() => setView('actions')}
                    className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <MdArrowBack className="text-[15px]" />
                  </button>
                )}
                <MdPlace className="text-white text-[18px]" />
                <span className="font-bold text-[13px] text-white">
                  {view === 'actions' ? `Nodo #${node.id}` : 'Asignar Lugar'}
                </span>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <MdClose className="text-[15px]" />
              </button>
            </div>

            {/* VISTA: Acciones */}
            {view === 'actions' && (
              <div className="px-4 py-3 flex flex-col gap-3">

                {/* Info lugar */}
                {ubicacion ? (
                  <div className="flex items-center gap-3 bg-blue-50 rounded-[14px] px-3 py-2.5">
                    <div className="w-9 h-9 bg-[#155dfc] rounded-full flex items-center justify-center shrink-0">
                      <IconComp className="text-white text-[16px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[13px] text-gray-900 truncate">{ubicacion.nombre}</p>
                      <p className="text-[11px] text-gray-500">{ubicacion.categoria || 'Sin categoría'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-[14px] px-3 py-2.5">
                    <MdHideSource className="text-gray-400 text-[18px]" />
                    <p className="text-[12px] text-gray-500 font-medium">Sin lugar asignado</p>
                  </div>
                )}

                <p className="text-[11px] text-gray-400 text-center">
                  {node.lat.toFixed(5)}, {node.lng.toFixed(5)}
                </p>

                <div className="h-px bg-gray-100" />

                {/* Botones de acción */}
                <div className="grid grid-cols-3 gap-2">
                  <ActionBtn
                    icon={MdAddLink}
                    label="Conectar"
                    color="text-indigo-600"
                    bg="bg-indigo-50 hover:bg-indigo-100"
                    onClick={() => { onStartConnect?.(); onClose(); }}
                    title="Conectar con otro nodo"
                  />
                  <ActionBtn
                    icon={MdEdit}
                    label={ubicacion ? 'Asignado' : 'Asignar'}
                    color={ubicacion ? "text-gray-400" : "text-[#155dfc]"}
                    bg={ubicacion ? "bg-gray-50" : "bg-blue-50 hover:bg-blue-100"}
                    onClick={() => {
                      if (!ubicacion) setView('assign_place');
                    }}
                    disabled={!!ubicacion}
                    title={ubicacion ? 'Este nodo ya tiene un lugar. No se puede reasignar desde aquí.' : 'Asignar o crear un lugar para este nodo'}
                  />
                  {ubicacion ? (
                    <ActionBtn
                      icon={MdDelete}
                      label="Eliminar"
                      color="text-gray-300"
                      bg="bg-gray-50"
                      onClick={() => {}}
                      title="Elimina el lugar primero para poder borrar este nodo"
                      disabled
                    />
                  ) : (
                    <ActionBtn
                      icon={MdDelete}
                      label="Eliminar"
                      color="text-red-500"
                      bg="bg-red-50 hover:bg-red-100"
                      onClick={() => { onDeleteNode?.(node.id); onClose(); }}
                      title="Eliminar nodo y sus tramos"
                    />
                  )}
                </div>

                {/* Aviso: para borrar nodo con lugar, ir a Gestionar Lugares */}
                {ubicacion && (
                  <button
                    onClick={() => onOpenGestionarLugares?.(ubicacion.nombre)}
                    className="flex items-start gap-2 w-full text-left bg-amber-50 border border-amber-100 rounded-[12px] px-3 py-2.5 text-[11px] text-amber-800 hover:bg-amber-100 transition-colors"
                  >
                    <MdWarning className="text-amber-400 text-[16px] shrink-0 mt-0.5" />
                    <span>
                      Para eliminar este nodo primero debes eliminar su lugar.&nbsp;
                      <span className="font-bold underline">Ver en Gestionar Lugares →</span>
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* VISTA: Asignar lugar */}
            {view === 'assign_place' && (
              <div className="flex flex-col">
                {/* Crear nuevo */}
                <div className="px-4 pt-3 pb-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-2 font-medium">Elige una opción:</p>
                  <button
                    onClick={() => setIsEditorOpen(true)}
                    className="flex items-center justify-center gap-2 w-full bg-[#155dfc] hover:bg-blue-700 text-white rounded-[12px] px-3 py-2.5 text-[12px] font-bold transition-colors"
                  >
                    <MdAdd className="text-[16px]" />
                    Crear lugar nuevo para este nodo
                  </button>
                </div>

                {/* Buscar existente */}
                <div className="px-4 pt-3 pb-2">
                  <p className="text-[11px] font-bold text-gray-600 mb-2">O reasignar uno existente:</p>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-[12px] px-3 py-2">
                    <MdSearch className="text-gray-400 text-[15px] shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar lugar..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent text-[12px] text-gray-700 outline-none placeholder:text-gray-400"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Resultados */}
                <div className="max-h-[220px] overflow-y-auto px-4 pb-4 flex flex-col gap-1.5 mt-1">
                  {searching ? (
                    <p className="text-[11px] text-gray-400 text-center py-4">Buscando...</p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-[11px] text-gray-400 text-center py-4">
                      {searchTerm ? 'Sin resultados' : 'Escribe para buscar...'}
                    </p>
                  ) : (
                    searchResults.map(place => {
                      const PlaceIcon = place.Categoria?.Icono && MdIcons[place.Categoria.Icono]
                        ? MdIcons[place.Categoria.Icono] : MdIcons.MdPlace;
                      const isCurrentNode = place.ID_Nodo === node.id;
                      return (
                        <button
                          key={place.ID_Ubicacion}
                          onClick={() => !isCurrentNode && setConfirmAssign({ isOpen: true, place })}
                          disabled={isCurrentNode}
                          className={`flex items-center gap-2.5 w-full rounded-[12px] px-3 py-2.5 text-left transition-colors border ${
                            isCurrentNode
                              ? 'bg-green-50 border-green-200 cursor-default'
                              : 'bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200 cursor-pointer'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isCurrentNode ? 'bg-green-500' : 'bg-[#155dfc]'}`}>
                            <PlaceIcon className="text-white text-[13px]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[12px] text-gray-800 truncate">{place.Nombre}</p>
                            <p className="text-[10px] text-gray-400">{place.Categoria?.Nombre_Categoria || '—'}</p>
                          </div>
                          {isCurrentNode && (
                            <span className="text-[9px] font-bold text-green-700 bg-green-100 rounded-full px-2 py-0.5 shrink-0">ACTUAL</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: confirmar reasignación */}
      <ModalConfirmacion
        isOpen={confirmAssign.isOpen}
        onClose={() => setConfirmAssign({ isOpen: false, place: null })}
        onConfirm={handleAssignPlace}
        titulo="¿Reasignar lugar?"
        mensaje={`"${confirmAssign.place?.Nombre}" será reasignado al Nodo #${node?.id}. El nodo anterior perderá este lugar.`}
        textoConfirmar="Sí, reasignar"
        textoCancelar="Cancelar"
        colorConfirmar="bg-[#155dfc] hover:bg-blue-700"
      />

      {/* EditorLugar: crear lugar nuevo */}
      <EditorLugar
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        lugarToEdit={ubicacion ? (ubicacion.supaObj || ubicacion) : { ID_Nodo: node?.id }}
        onSuccess={() => {
          setIsEditorOpen(false);
          onReloadMap?.();
          onClose();
        }}
      />
    </>
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────────
function ActionBtn({ icon: Icon, label, color, bg, onClick, title, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex flex-col items-center gap-1 rounded-[14px] py-2.5 px-1 transition-colors ${bg} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <Icon className={`text-[20px] ${color}`} />
      <span className={`text-[10px] font-semibold ${color}`}>{label}</span>
    </button>
  );
}
