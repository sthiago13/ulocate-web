import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdSearch, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import EditorLugar from './EditorLugar';
import ModalConfirmacion from './ModalConfirmacion';
import { supabase } from '../../lib/supabaseClient';

export default function GestionarLugares({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, item: null });

  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga desde Supabase
  const fetchLugares = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Ubicacion')
      .select('*, Categoria (*)')
      .order('Nombre', { ascending: true });

    if (!error) {
      setLugares(data || []);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (isOpen) fetchLugares();
  }, [isOpen]);

  const filtrados = lugares.filter(lugar => 
    lugar.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (lugar.Categoria?.Nombre_Categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (lugar) => {
    setIsEditorOpen(lugar); // Now we pass the object directly, using isEditorOpen state
  };

  const confirmarEliminar = (lugar) => {
    setDeleteConfirmation({ isOpen: true, item: lugar });
  };

  const handleEliminar = async () => {
    if (!deleteConfirmation.item) return;
    const id = deleteConfirmation.item.ID_Ubicacion;

    await supabase.from('Referencias_Visuales').delete().eq('ID_Ubicacion', id);
    await supabase.from('Ubicacion_Guardada').delete().eq('ID_Ubicacion', id);
    const { error } = await supabase.from('Ubicacion').delete().eq('ID_Ubicacion', id);

    if (!error) {
      setLugares(prev => prev.filter(l => l.ID_Ubicacion !== id));
    }
    setDeleteConfirmation({ isOpen: false, item: null });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[50] transition-opacity"
          />

          {/* Drawer Principal */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[456px] overflow-hidden bg-[#f9fafb] flex flex-col z-[60] shadow-[-4px_0_24px_rgba(0,0,0,0.15)] rounded-none sm:rounded-l-[30px]"
          >
            {/* Header Fijo */}
            <div className="flex items-center justify-between w-full p-[30px] pb-[20px] bg-white shrink-0 shadow-sm z-10">
              <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                <span className="font-bold text-[24px] text-[#101828] leading-[30px]">Gestionar Lugares</span>
                <span className="text-[#667085] text-[14px]">
                  {loading ? 'Cargando...' : `${lugares.length} ubicaciones registradas`}
                </span>
              </div>
              <button
                onClick={onClose}
                className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <MdClose className="text-gray-700 text-[24px]" />
              </button>
            </div>

            {/* Buscador */}
            <div className="px-[30px] py-[20px] shrink-0 bg-[#f9fafb]">
              <div className="relative">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[24px]" />
                <input
                  type="text"
                  placeholder="Buscar ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-[#d0d5dd] rounded-[15px] pl-[45px] pr-[15px] h-[55px] text-[16px] text-gray-900 font-['Plus_Jakarta_Sans'] focus:outline-none focus:ring-2 focus:ring-[#155dfc] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Contenido (Lista Scrollable) */}
            <div className="flex-1 overflow-y-auto px-[30px] flex flex-col gap-3 pb-[100px]">
              {filtrados.length > 0 ? (
                filtrados.map((lugar) => (
                  <div key={lugar.ID_Ubicacion} className="bg-white border border-gray-100 p-4 rounded-[16px] shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
                    <div className="flex flex-col">
                      <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#101828] text-[16px]">
                        {lugar.Nombre}
                      </span>
                      <span className="font-['Plus_Jakarta_Sans'] text-gray-500 text-[13px]">
                        {lugar.Categoria?.Nombre_Categoria || 'Sin categoría'}
                      </span>
                    </div>
                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(lugar)}
                        className="w-10 h-10 rounded-full bg-blue-50 text-[#155dfc] flex items-center justify-center hover:bg-[#155dfc] hover:text-white transition-colors"
                      >
                        <MdEdit className="text-[20px]"/>
                      </button>
                      <button 
                        onClick={() => confirmarEliminar(lugar)}
                        className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <MdDelete className="text-[20px]"/>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 font-['Plus_Jakarta_Sans'] mt-10">
                  No se encontraron lugares con ese nombre.
                </div>
              )}
            </div>

            {/* Footer Fijo con Botón Agregar */}
            <div className="absolute bottom-0 w-full left-0 p-[30px] bg-gradient-to-t from-[#f9fafb] via-[#f9fafb] to-transparent shrink-0">
               <button 
                  onClick={() => setIsEditorOpen(true)}
                  className="bg-[#155dfc] hover:bg-blue-700 transition-colors w-full rounded-[16px] py-[16px] flex justify-center items-center shadow-[0_8px_20px_rgba(21,93,252,0.3)] gap-2"
                >
                  <MdAdd className="text-white text-[24px]" />
                  <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                    Agregar Nuevo
                  </span>
                </button>
            </div>
          </motion.div>

          {/* Modal Condicional: Editor */}
          <EditorLugar 
            isOpen={!!isEditorOpen} 
            lugar={isEditorOpen === true ? null : isEditorOpen}
            onClose={() => setIsEditorOpen(false)} 
            onSaved={() => { setIsEditorOpen(false); fetchLugares(); }}
          />

          {/* Modal de Confirmación para Delete */}
          <ModalConfirmacion
            isOpen={deleteConfirmation.isOpen}
            onClose={() => setDeleteConfirmation({ isOpen: false, item: null })}
            onConfirm={handleEliminar}
            titulo="Eliminar Lugar"
            mensaje={`¿Estás seguro de que deseas eliminar permanentemente "${deleteConfirmation.item?.Nombre}"?`}
            textoConfirmar="Eliminar"
            textoCancelar="Cancelar"
            colorConfirmar="bg-red-600 hover:bg-red-700"
          />
        </>
      )}
    </AnimatePresence>
  );
}
