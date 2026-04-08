import React, { useState, useEffect } from 'react';
import { MdClose, MdMap, MdEdit, MdAdd, MdDelete } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import SearchBar from './SearchBar';
import Spinner from './Spinner';
import ModalConfirmacion from './ModalConfirmacion';
import EditorZona from './EditorZona';

export default function GestionarZonas({ isOpen, onClose }) {
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [zonaToEdit, setZonaToEdit] = useState(null);
  // phase: 0=cerrado, 1=primera confirmación, 2=confirmación definitiva
  const [deleteConf, setDeleteConf] = useState({ phase: 0, item: null });

  const fetchZonas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Zona')
      .select('*')
      .order('Nombre_Zona', { ascending: true });

    if (!error && data) setZonas(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchZonas();
  }, [isOpen]);

  const openEditor = (zona = null) => {
    setZonaToEdit(zona);
    setIsEditorOpen(true);
  };

  const performDelete = async () => {
    const target = deleteConf.item;
    if (target) {
      const { error } = await supabase
        .from('Zona')
        .delete()
        .eq('ID_Zona', target.ID_Zona);

      if (!error) {
        setZonas(prev => prev.filter(z => z.ID_Zona !== target.ID_Zona));
      } else {
        console.error('Error al eliminar zona:', error);
      }
    }
    setDeleteConf({ phase: 0, item: null });
  };

  if (!isOpen && !isEditorOpen) return null;

  const filtrados = zonas.filter(zona =>
    (zona.Nombre_Zona || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] overflow-y-auto bg-[#f9f9f9] flex flex-col pt-[30px] rounded-none sm:rounded-l-[30px] z-[80] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-[30px] w-full mb-[20px] shrink-0">
                <div className="flex gap-[15px] items-center">
                  <div className="bg-teal-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                    <MdMap className="text-teal-600 text-[28px]" />
                  </div>
                  <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                    <span className="font-bold text-[#101828] text-[20px] leading-[26px]">Gestionar Zonas</span>
                    <span className="font-medium text-gray-500 text-[14px]">Áreas del campus universitario</span>
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
                  placeholder="Buscar zona..."
                />
              </div>

              {/* Lista */}
              <div className="flex-1 overflow-y-auto px-[30px] flex flex-col gap-3 pb-[100px] font-['Plus_Jakarta_Sans']">
                {loading ? (
                  <Spinner text="Cargando zonas..." />
                ) : filtrados.length === 0 ? (
                  <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[10px] border border-gray-200">
                    No se encontraron zonas.
                  </div>
                ) : (
                  filtrados.map((zona) => (
                    <div
                      key={zona.ID_Zona}
                      className="flex items-center gap-[15px] bg-white p-[15px] rounded-[15px] shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
                    >
                      {/* Info */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-semibold text-[15px] text-[#101828] leading-[20px]">
                          {zona.Nombre_Zona}
                        </span>
                      </div>

                      {/* Acciones */}
                      <div className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                          onClick={() => openEditor(zona)}
                          className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors"
                          title="Editar zona"
                        >
                          <MdEdit className="text-[20px]" />
                        </button>
                        <button
                          onClick={() => setDeleteConf({ phase: 1, item: zona })}
                          className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                          title="Eliminar zona"
                        >
                          <MdDelete className="text-[20px]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botón Agregar */}
              <div className="absolute bottom-0 left-0 right-0 p-[30px] bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent pointer-events-none">
                <button
                  onClick={() => openEditor(null)}
                  className="w-full bg-[#101828] hover:bg-black transition-colors rounded-[16px] py-[14px] flex justify-center items-center gap-2 shadow-lg hover:shadow-xl pointer-events-auto"
                >
                  <MdAdd className="text-white text-[24px]" />
                  <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                    Agregar Zona
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sub-panel: crear/editar zona */}
      <EditorZona
        isOpen={isEditorOpen}
        zonaToEdit={zonaToEdit}
        onClose={() => setIsEditorOpen(false)}
        onSuccess={() => {
          setIsEditorOpen(false);
          fetchZonas();
        }}
      />

      {/* Modal 1: Primera confirmación */}
      <ModalConfirmacion
        isOpen={deleteConf.phase === 1}
        onClose={() => setDeleteConf({ phase: 0, item: null })}
        onConfirm={() => setDeleteConf(prev => ({ ...prev, phase: 2 }))}
        titulo="Eliminar Zona"
        mensaje={
          <span>
            ¿Estás seguro que deseas eliminar la zona <strong>{deleteConf.item?.Nombre_Zona}</strong>?
          </span>
        }
        textoConfirmar="Continuar"
        textoCancelar="Cancelar"
        colorConfirmar="bg-red-600 hover:bg-red-700"
      />

      {/* Modal 2: Confirmación definitiva */}
      <ModalConfirmacion
        isOpen={deleteConf.phase === 2}
        onClose={() => setDeleteConf({ phase: 0, item: null })}
        onConfirm={performDelete}
        titulo="⚠️ Acción Irreversible"
        mensaje={`Estás a punto de eliminar permanentemente la zona "${deleteConf.item?.Nombre_Zona}". Las ubicaciones asociadas a esta zona perderán su referencia de zona. Esta acción no se puede deshacer. ¿Estás completamente seguro?`}
        textoConfirmar="Sí, eliminar definitivamente"
        textoCancelar="No, cancelar"
        colorConfirmar="bg-red-600 hover:bg-red-700 animate-pulse"
      />
    </>
  );
}
