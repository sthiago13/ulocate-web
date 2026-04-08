import React, { useState, useEffect } from 'react';
import { MdClose, MdCategory, MdEdit, MdAdd } from 'react-icons/md';
import * as mdIcons from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import SearchBar from './common/SearchBar';
import Spinner from './common/Spinner';
import CrearCategoria from './CrearCategoria';
import EditarCategoria from './EditarCategoria';

export default function GestionarCategorias({ isOpen, onClose }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchCategorias = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('Categoria')
          .select('*')
          .order('Nombre_Categoria', { ascending: true })
          .limit(50);

        if (data && data.length > 0) {
          setCategorias(data);
        } else {
          // Datos mock
          setCategorias([
            { ID_Categoria: 1, Nombre_Categoria: "Acad├®mico", Icono: "MdSchool" },
            { ID_Categoria: 2, Nombre_Categoria: "Alimentaci├│n", Icono: "MdRestaurant" },
            { ID_Categoria: 3, Nombre_Categoria: "Servicios", Icono: "MdLocalPrintshop" },
            { ID_Categoria: 4, Nombre_Categoria: "Administrativo", Icono: "MdBusinessCenter" },
          ]);
        }
        setLoading(false);
      };

      fetchCategorias();
    }
  }, [isOpen]);

  if (!isOpen && !isCreating && !editingCategory) return null;

  const filtrados = categorias.filter(cat => {
    const searchLow = searchTerm.toLowerCase();
    const titulo = cat.Nombre_Categoria || '';
    return titulo.toLowerCase().includes(searchLow);
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
                  <div className="bg-amber-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                    <MdCategory className="text-amber-600 text-[28px]" />
                  </div>
                  <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                    <span className="font-bold text-[#101828] text-[20px] leading-[26px]">Gestionar Categor├¡as</span>
                    <span className="font-medium text-gray-500 text-[14px]">Estructura de lugares</span>
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
                  placeholder="Buscar categor├¡a..."
                />
              </div>

              {/* Content List */}
              <div className="flex-1 overflow-y-auto px-[30px] flex flex-col gap-3 pb-[100px] font-['Plus_Jakarta_Sans']">
                {loading ? (
                  <Spinner text="Cargando categor├¡as..." />
                ) : filtrados.length === 0 ? (
                  <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[10px] border border-gray-200">
                    No se encontraron categor├¡as.
                  </div>
                ) : (
                  filtrados.map((cat) => {
                    const titulo = cat.Nombre_Categoria || 'Categor├¡a Sin Nombre';
                    
                    // Render icono dinamico o fallback
                    const IconoDinamico = (cat.Icono && mdIcons[cat.Icono]) ? mdIcons[cat.Icono] : MdCategory;

                    return (
                      <div
                        key={cat.ID_Categoria}
                        className="flex items-center gap-[15px] bg-white p-[15px] rounded-[15px] shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
                      >
                        {/* Icono de Categoria */}
                        <div className="flex flex-col items-center justify-center w-[45px] h-[45px] rounded-[12px] bg-amber-50 text-amber-600 shrink-0 border border-amber-100">
                          <IconoDinamico className="text-[22px]" />
                        </div>

                        {/* Info */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-semibold text-[15px] text-[#101828] leading-[20px]">
                            {titulo}
                          </span>
                          <span className="text-[12px] text-gray-400 mt-0.5">
                            {cat.Icono || 'Sin Icono'}
                          </span>
                        </div>

                        {/* Boton Editar (Lapiz) */}
                        <div className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingCategory(cat)}
                            className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors"
                            title="Editar categor├¡a"
                          >
                            <MdEdit className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sticky Bottom Area */}
              <div className="absolute bottom-0 left-0 right-0 p-[30px] bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent pointer-events-none">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full bg-[#101828] hover:bg-black transition-colors rounded-[16px] py-[14px] flex justify-center items-center gap-2 shadow-lg hover:shadow-xl pointer-events-auto"
                >
                  <MdAdd className="text-white text-[24px]" />
                  <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                    Agregar Categor├¡a
                  </span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modales Secundarios */}
      <CrearCategoria
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onCreate={async (newCat) => {
          try {
            const { data, error } = await supabase
              .from('Categoria')
              .insert(newCat)
              .select()
              .single();
            if (data) {
              setCategorias(prev => [...prev, data].sort((a,b) => a.Nombre_Categoria.localeCompare(b.Nombre_Categoria)));
            }
          } catch(err) { console.error('Error insertando categoria', err); }
          setIsCreating(false);
        }}
      />

      <EditarCategoria
        isOpen={!!editingCategory}
        categoria={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSave={async (updatedCat) => {
          try {
            const { data, error } = await supabase
              .from('Categoria')
              .update({
                Nombre_Categoria: updatedCat.Nombre_Categoria,
                Icono: updatedCat.Icono
              })
              .eq('ID_Categoria', updatedCat.ID_Categoria)
              .select()
              .single();
            if (data) {
              setCategorias(prev => prev.map(c => c.ID_Categoria === updatedCat.ID_Categoria ? data : c));
            }
          } catch(err) { console.error('Error actualizando categoria', err); }
          setEditingCategory(null);
        }}
      />
    </>
  );
}