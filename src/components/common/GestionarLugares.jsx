import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdSearch, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import EditorLugar from './EditorLugar';
import ModalConfirmacion from './ModalConfirmacion';
import SearchBar from './SearchBar';
import ResultCard from './ResultCard';
import { supabase } from '../../lib/supabaseClient';
import Spinner from './Spinner';

export default function GestionarLugares({ isOpen, onClose, onLocationSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [lugarToEdit, setLugarToEdit] = useState(null);
  
  // Double Confirmation State
  // phase: 0 = closed, 1 = first confirm, 2 = second confirm
  const [deleteConf, setDeleteConf] = useState({ phase: 0, item: null });

  const openEditor = (lugar = null) => {
    setLugarToEdit(lugar);
    setIsEditorOpen(true);
  };

  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLugares = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Ubicacion')
      .select('*, Categoria(*)');
    if (!error && data) {
      setLugares(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchLugares();
    }
  }, [isOpen]);

  // Derive categories from the existing places dynamically
  const categoryFilters = ["Todos", ...new Set(lugares.map(l => l.Categoria?.Nombre_Categoria).filter(Boolean))];

  const filtrados = lugares.filter(lugar => {
    const matchesSearch = lugar.Nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === "Todos" || lugar.Categoria?.Nombre_Categoria === activeCategory;
    return matchesSearch && matchCategory;
  });

  const startDelete = (lugar) => {
    setDeleteConf({ phase: 1, item: lugar });
  };

  const performDelete = async () => {
    const target = deleteConf.item;
    if (target) {
      // Execute the real backend delete 
      const { error } = await supabase.from('Ubicacion').delete().eq('ID_Ubicacion', target.ID_Ubicacion);
      if (!error) {
         setLugares(prev => prev.filter(l => l.ID_Ubicacion !== target.ID_Ubicacion));
      } else {
         console.error("Error al eliminar", error);
      }
    }
    setDeleteConf({ phase: 0, item: null });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[50] transition-opacity"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] overflow-hidden bg-[#f9fafb] flex flex-col z-[60] shadow-[-4px_0_24px_rgba(0,0,0,0.15)] rounded-none sm:rounded-l-[30px]"
          >
            {/* Header Fijo */}
            <div className="flex items-center justify-between w-full p-[30px] pb-[20px] bg-white shrink-0 shadow-sm z-10">
              <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                <span className="font-bold text-[24px] text-[#101828] leading-[30px]">Gestionar Lugares</span>
                <span className="text-[#667085] text-[14px]">Administra el directorio de sitios</span>
              </div>
              <button
                onClick={onClose}
                className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <MdClose className="text-gray-700 text-[24px]" />
              </button>
            </div>

            {/* Buscador */}
            <div className="px-[30px] pt-[20px] pb-[10px] shrink-0 bg-[#f9fafb]">
              <SearchBar 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                showFilter={true}
                onFilterClick={() => setShowFilters(!showFilters)} 
                placeholder="Buscar ubicación..." 
              />
              
              {/* Filtros Categorías */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="w-full shrink-0 flex items-center gap-3 overflow-x-auto scrollbar-hide py-3"
                  >
                    {categoryFilters.map((cat, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 whitespace-nowrap rounded-full font-['Plus_Jakarta_Sans'] font-bold text-[14px] transition-colors ${
                          activeCategory === cat 
                            ? "bg-blue-600 text-white border-transparent" 
                            : "bg-[#e9e9e9] text-[#4a4a4a] border border-transparent hover:bg-gray-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contenido (Lista Scrollable) */}
            <div className="flex-1 overflow-y-auto px-[30px] flex flex-col gap-3 pb-[100px] pt-2">
              {loading ? (
                <Spinner text="Cargando lugares..." />
              ) : filtrados.length > 0 ? (
                filtrados.map((lugar) => {
                  const Icon = lugar.Categoria?.Icono && MdIcons[lugar.Categoria.Icono] ? MdIcons[lugar.Categoria.Icono] : MdIcons.MdPlace;
                  return (
                    <ResultCard
                      key={lugar.ID_Ubicacion}
                      icon={<Icon className="text-[20px] text-gray-700" />}
                      title={lugar.Nombre}
                      subtitle={lugar.Categoria?.Nombre_Categoria || 'Sin Categoría'}
                      actions={
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { 
                               e.stopPropagation(); 
                               if (onLocationSelect) {
                                  onLocationSelect(lugar.ID_Ubicacion);
                                  onClose();
                               }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-sm font-bold flex items-center gap-1 hover:bg-green-600 hover:text-white transition-colors"
                          >
                            <MdIcons.MdVisibility className="text-[16px]"/> Ver lugar
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditor(lugar); }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#155dfc] text-sm font-bold flex items-center gap-1 hover:bg-[#155dfc] hover:text-white transition-colors"
                          >
                            <MdEdit className="text-[16px]"/> Editar
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); startDelete(lugar); }}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-bold flex items-center gap-1 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <MdDelete className="text-[16px]"/> Borrar
                          </button>
                        </div>
                      }
                    />
                  );
                })
              ) : (
                <div className="text-center text-gray-500 font-['Plus_Jakarta_Sans'] mt-10">
                  No se encontraron lugares con los filtros actuales.
                </div>
              )}
            </div>

            <div className="absolute bottom-0 w-full left-0 p-[30px] bg-gradient-to-t from-[#f9fafb] via-[#f9fafb] to-transparent shrink-0">
               <button 
                  onClick={() => openEditor(null)}
                  className="bg-[#155dfc] hover:bg-blue-700 transition-colors w-full rounded-[16px] py-[16px] flex justify-center items-center shadow-[0_8px_20px_rgba(21,93,252,0.3)] gap-2 pointer-events-auto"
                >
                  <MdAdd className="text-white text-[24px]" />
                  <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                    Agregar Nuevo
                  </span>
                </button>
            </div>
          </motion.div>

          <EditorLugar 
            isOpen={isEditorOpen} 
            lugarToEdit={lugarToEdit}
            onClose={() => setIsEditorOpen(false)} 
            onSuccess={() => {
              setIsEditorOpen(false);
              fetchLugares();
            }}
          />

          <ModalConfirmacion
            isOpen={deleteConf.phase === 1}
            onClose={() => setDeleteConf({ phase: 0, item: null })}
            onConfirm={() => setDeleteConf({ ...deleteConf, phase: 2 })}
            titulo="Eliminar Lugar"
            mensaje={`¿Deseas eliminar la ubicación "${deleteConf.item?.Nombre}" del mapa y la base de datos?`}
            textoConfirmar="Proceder a Eliminar"
            textoCancelar="Cancelar"
            colorConfirmar="bg-orange-500 hover:bg-orange-600"
          />

          <ModalConfirmacion
            isOpen={deleteConf.phase === 2}
            onClose={() => setDeleteConf({ phase: 0, item: null })}
            onConfirm={performDelete}
            titulo="⚠️ Acción Irreversible"
            mensaje={`ESTÁS A PUNTO DE ELIMINAR PERMANENTEMENTE "${deleteConf.item?.Nombre}". Esta acción destruirá cualquier dato registrado como favoritos e historiales de los usuarios asociados a este lugar. ¿Estás COMPLETAMENTE seguro de eliminarlo?`}
            textoConfirmar="SÍ, ELIMINAR DEFINITIVAMENTE"
            textoCancelar="No, me he equivocado"
            colorConfirmar="bg-red-600 hover:bg-red-700 animate-pulse"
          />
        </>
      )}
    </AnimatePresence>
  );
}
