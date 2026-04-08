import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import * as MdIcons from 'react-icons/md';
import ResultCard from './ResultCard';
import SearchBar from './SearchBar';
import TarjetaUbicacion from './TarjetaUbicacion';
import { supabase } from '../../lib/supabaseClient';
import Spinner from './Spinner';

// Store the data in module-level variables so it's cached between open/closes
let cachedUbicaciones = null;
let cachedCategorias = null;

export default function SearchPanel({ onClose, onLocationSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUbicacionId, setSelectedUbicacionId] = useState(null);
  
  const [ubicaciones, setUbicaciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("Todos");

  useEffect(() => {
    const fetchData = async () => {
      if (cachedUbicaciones && cachedCategorias) {
         setUbicaciones(cachedUbicaciones);
         setCategorias(cachedCategorias);
         setLoading(false);
         return;
      }

      setLoading(true);
      const [catRes, ubiRes] = await Promise.all([
        supabase.from('Categoria').select('*'),
        supabase.from('Ubicacion').select('*')
      ]);

      if (catRes.error) console.error("Error Categoria:", catRes.error);
      if (ubiRes.error) console.error("Error Ubicacion:", ubiRes.error);

      if (catRes.data) {
         setCategorias(catRes.data);
         cachedCategorias = catRes.data;
      }
      if (ubiRes.data) {
         setUbicaciones(ubiRes.data);
         cachedUbicaciones = ubiRes.data;
      }
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const categoryFilters = ["Todos", ...categorias.map(c => c.Nombre_Categoria)];

  // Resultados filtrados a tiempo real
  const results = ubicaciones.filter(u => {
      const gCat = categorias.find(c => c.ID_Categoria === u.ID_Categoria);
      const matchesSearch = u.Nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "Todos" || (gCat && gCat.Nombre_Categoria === activeCategory);
      return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Fondo oscuro overlay solo para panel de búsqueda */}
      <div
        className="fixed inset-0 bg-black/10 z-30 transition-opacity md:bg-transparent"
        onClick={onClose}
      />

      <div className="fixed bottom-32 left-[5%] sm:left-[calc(50%-225px)] w-[90%] sm:w-[450px] bg-white flex flex-col items-center p-5 rounded-[30px] z-40 shadow-[0px_4px_24px_rgba(0,0,0,0.15)] max-h-[60vh] overflow-hidden">
        
        {/* Cabecera / Close para mejor UX en mobile */}
        <div className="w-full flex justify-between items-center mb-3">
            <h2 className="font-jakarta font-bold text-gray-800 text-lg ml-2">Buscar Lugares</h2>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors">
                <MdClose className="w-5 h-5" />
            </button>
        </div>

        {/* Listado de Resultados ResultCard */}
        <div className="w-full flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
          {loading ? (
            <Spinner text="Cargando ubicaciones..." />
          ) : results.length > 0 ? (
            results.map((res) => {
              const catObj = categorias.find(c => c.ID_Categoria === res.ID_Categoria);
              const catName = catObj ? catObj.Nombre_Categoria : "Desconocido";
              const IconComponent = catObj && catObj.Icono && MdIcons[catObj.Icono] ? MdIcons[catObj.Icono] : MdIcons.MdPlace;

              return (
                <ResultCard 
                  key={res.ID_Ubicacion}
                  title={res.Nombre} 
                  subtitle={catName} 
                  icon={<IconComponent className="text-[#101828] text-[24px]" />} 
                  onClick={() => {
                    if (onLocationSelect) onLocationSelect(res.ID_Ubicacion);
                  }}
                />
              );
            })
          ) : (
            <div className="text-center text-gray-500 mt-10 font-sans">
              No se encontraron lugares.
            </div>
          )}
        </div>

        {/* Filtros Categorías */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full shrink-0 flex items-center gap-3 overflow-x-auto scrollbar-hide py-3 mb-2"
            >
              {categoryFilters.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 whitespace-nowrap rounded-full font-jakarta font-bold text-[14px] transition-colors ${
                    activeCategory === cat 
                      ? "bg-blue-600 text-white border-transparent" 
                      : "bg-[#f9f9f9] text-[#4a4a4a] border border-[#4a4a4a] hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Buscador */}
        <SearchBar 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          onFilterClick={() => setShowFilters(!showFilters)} 
        />

      </div>
    </>
  );
}
