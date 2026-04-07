import React, { useState, useEffect, useCallback } from 'react';
import { MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import ResultCard from './ResultCard';
import SearchBar from './SearchBar';
import TarjetaUbicacion from './TarjetaUbicacion';
import { getUbicaciones } from '../../utils/localDB';

const CATEGORIAS = ['Académico', 'Alimentación', 'Servicios', 'Administrativo', 'Recreación'];

const CATEGORY_ICONS = {
  'Académico':      '🎓',
  'Alimentación':   '🍽️',
  'Servicios':      '🛠️',
  'Administrativo': '🏛️',
  'Recreación':     '⚽',
};

export default function SearchPanel({ onClose }) {
  const [searchTerm,          setSearchTerm]          = useState('');
  const [showFilters,         setShowFilters]          = useState(false);
  const [selectedUbi,         setSelectedUbi]          = useState(null);   // objeto completo de localDB
  const [ubicaciones,         setUbicaciones]          = useState([]);
  const [activeCategory,      setActiveCategory]       = useState('Todos');

  // Leer desde localDB cada vez que se abre el panel
  useEffect(() => {
    setUbicaciones(getUbicaciones());
  }, []);

  const categoryFilters = ['Todos', ...CATEGORIAS];

  const results = ubicaciones.filter(u => {
    const matchSearch   = u.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === 'Todos' || u.categoria === activeCategory;
    return matchSearch && matchCategory;
  });

  // Si hay ubicación seleccionada, mostrar tarjeta de detalle
  if (selectedUbi) {
    return (
      <TarjetaUbicacion
        ubicacion={selectedUbi}
        onClose={() => { setSelectedUbi(null); onClose(); }}
      />
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/10 z-30 transition-opacity md:bg-transparent"
        onClick={onClose}
      />

      <div className="fixed bottom-32 left-[5%] sm:left-[calc(50%-225px)] w-[90%] sm:w-[450px] bg-white flex flex-col items-center p-5 rounded-[30px] z-40 shadow-[0px_4px_24px_rgba(0,0,0,0.15)] max-h-[60vh] overflow-hidden">

        {/* Cabecera */}
        <div className="w-full flex justify-between items-center mb-3">
          <h2 className="font-jakarta font-bold text-gray-800 text-lg ml-2">Buscar Lugares</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors">
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Resultados */}
        <div className="w-full flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
          {ubicaciones.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 font-sans text-sm px-4">
              <p className="text-3xl mb-2">🗺️</p>
              <p className="font-semibold text-gray-600">No hay lugares registrados aún</p>
              <p className="text-xs text-gray-400 mt-1">El administrador debe agregar lugares usando el Modo Editor del mapa.</p>
            </div>
          ) : results.length > 0 ? (
            results.map((res) => (
              <ResultCard
                key={res.id}
                title={res.nombre}
                subtitle={res.categoria}
                icon={<span className="text-[22px]">{CATEGORY_ICONS[res.categoria] || '📍'}</span>}
                onClick={() => setSelectedUbi(res)}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 mt-10 font-sans text-sm">
              No se encontraron lugares con ese nombre.
            </div>
          )}
        </div>

        {/* Filtros Categorías */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full shrink-0 flex items-center gap-3 overflow-x-auto scrollbar-hide py-3 mb-2"
            >
              {categoryFilters.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 whitespace-nowrap rounded-full font-jakarta font-bold text-[14px] transition-colors ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white border-transparent'
                      : 'bg-[#f9f9f9] text-[#4a4a4a] border border-[#4a4a4a] hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buscador */}
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFilterClick={() => setShowFilters(!showFilters)}
        />
      </div>
    </>
  );
}
