import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose, MdTimeline, MdAddLocation, MdDelete, MdInfo,
  MdMyLocation, MdLink, MdDeleteForever, MdHelpOutline,
  MdToggleOn, MdToggleOff
} from 'react-icons/md';
import { supabase } from '../../lib/supabaseClient';
import ModalConfirmacion from '../common/ModalConfirmacion';

export default function GestionarNodos({
  isOpen,
  onClose,
  canAddNodes,
  setCanAddNodes,
  nodeCount,
  edgeCount,
  onClearAll,
}) {
  // ── Draggable logic ──────────────────────────────────────────────────────────
  const panelRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Reset position when opened
  useEffect(() => {
    if (isOpen) setPos({ x: 0, y: 0 });
  }, [isOpen]);

  const onMouseDown = useCallback((e) => {
    // Solo mover si el click es en el header (drag handle)
    if (e.target.closest('[data-drag-handle]')) {
      e.preventDefault();
      const rect = panelRef.current?.getBoundingClientRect();
      dragState.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
      };
    }
  }, [pos]);

  const onMouseMove = useCallback((e) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
  }, []);

  const onMouseUp = useCallback(() => {
    dragState.current.dragging = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── Render ───────────────────────────────────────────────────────────────────
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
              top: `calc(80px + ${pos.y}px)`,
              right: `calc(16px - ${pos.x}px)`,
              userSelect: 'none',
            }}
            className="w-[260px] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden font-['Plus_Jakarta_Sans']"
          >
            {/* Header – drag handle */}
            <div
              data-drag-handle="true"
              className="flex items-center justify-between px-4 py-3 bg-[#155dfc] cursor-grab active:cursor-grabbing"
              title="Arrastra para mover el panel"
            >
              <div className="flex items-center gap-2">
                <MdTimeline className="text-white text-[20px]" />
                <span className="font-bold text-[14px] text-white">Editor de Mapa</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  title="Instrucciones"
                >
                  <MdHelpOutline className="text-[16px]" />
                </button>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Cerrar panel"
                >
                  <MdClose className="text-[16px]" />
                </button>
              </div>
            </div>

            {/* Instrucciones (colapsable) */}
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-blue-50 border-b border-blue-100"
                >
                  <div className="px-4 py-3 flex flex-col gap-1.5">
                    <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wide mb-1">Cómo usar</p>
                    <HelpItem icon={MdAddLocation} color="text-blue-600" text="Activa el interruptor y haz clic en el mapa para añadir nodos" />
                    <HelpItem icon={MdMyLocation} color="text-indigo-600" text="Clic en un nodo → lo selecciona (borde rojo)" />
                    <HelpItem icon={MdLink} color="text-green-600" text="Clic en otro nodo → los conecta con un tramo" />
                    <HelpItem icon={MdInfo} color="text-orange-500" text="Doble clic en nodo → asignar o editar ubicación" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Body */}
            <div className="px-4 py-3 flex flex-col gap-3">

              {/* Toggle Crear Nodos */}
              <button
                type="button"
                onClick={() => setCanAddNodes(!canAddNodes)}
                className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 rounded-[14px] px-3 py-2.5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MdAddLocation className={`text-[18px] ${canAddNodes ? 'text-[#155dfc]' : 'text-gray-400'}`} />
                  <span className="text-[13px] font-semibold text-gray-700">Añadir Nodos</span>
                </div>
                {canAddNodes
                  ? <MdToggleOn className="text-[28px] text-[#155dfc]" />
                  : <MdToggleOff className="text-[28px] text-gray-300" />
                }
              </button>

              {canAddNodes && (
                <p className="text-[11px] text-[#155dfc] font-semibold text-center -mt-1 animate-pulse">
                  ● Haz clic en el mapa para añadir
                </p>
              )}

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-2">
                <StatCard icon={MdMyLocation} label="Nodos" value={nodeCount} color="text-indigo-600" bg="bg-indigo-50" />
                <StatCard icon={MdLink} label="Tramos" value={edgeCount} color="text-green-600" bg="bg-green-50" />
              </div>

              {/* Separador */}
              <div className="h-px bg-gray-100" />

              {/* Botón Limpiar */}
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-600 rounded-[14px] py-2.5 text-[13px] font-semibold transition-colors"
              >
                <MdDeleteForever className="text-[17px]" />
                Limpiar todos los datos
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm modal – fuera del panel para que el z-index no interfiera */}
      <ModalConfirmacion
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => { setShowClearConfirm(false); onClearAll(); }}
        titulo="¿Limpiar todo el mapa?"
        mensaje="Esta acción eliminará TODOS los nodos, tramos y sus ubicaciones asociadas de la base de datos. No se puede deshacer."
        textoConfirmar="Sí, limpiar todo"
        textoCancelar="Cancelar"
        colorConfirmar="bg-red-600 hover:bg-red-700"
      />
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-[14px] px-3 py-2.5 flex flex-col items-center gap-0.5`}>
      <Icon className={`text-[20px] ${color}`} />
      <span className={`text-[18px] font-black ${color} leading-none`}>{value}</span>
      <span className="text-[11px] text-gray-500 font-medium">{label}</span>
    </div>
  );
}

function HelpItem({ icon: Icon, color, text }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className={`${color} text-[14px] shrink-0 mt-0.5`} />
      <span className="text-[11px] text-blue-900 leading-tight">{text}</span>
    </div>
  );
}
