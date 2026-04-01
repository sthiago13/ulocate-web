import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import ResultCard from './ResultCard';
import SearchBar from './SearchBar';
export default function SearchPanel({ onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = ["Academico", "Deporte", "Servicio"];
  const [activeCategory, setActiveCategory] = useState("Academico");

  // Resultados de demostración temporal para visualizar el componente
  const results = [
    { id: 1, title: "Edificio A", subtitle: "Academico", icon: "🎓" },
    { id: 2, title: "Edificio A", subtitle: "Academico", icon: "🎓" },
    { id: 3, title: "Edificio A", subtitle: "Academico", icon: "🎓" },
    { id: 4, title: "Edificio A", subtitle: "Academico", icon: "🎓" },
    { id: 5, title: "Edificio A", subtitle: "Academico", icon: "🎓" },
    { id: 6, title: "Edificio A", subtitle: "Academico", icon: "🎓" },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/10 z-30 transition-opacity"
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

        {/* Listado de Resultados ResultCard (Arriba como pidió el usuario) */}
        <div className="w-full flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
          {results.map((res, index) => (
            <ResultCard 
              key={`${res.id}-${index}`} 
              title={res.title} 
              subtitle={res.subtitle} 
              icon={res.icon} 
              variant="user" 
            />
          ))}
        </div>

        {/* Filtros Categorías (Desplegables según el SearchBar) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full flex items-center gap-3 overflow-x-auto scrollbar-hide mb-2 pb-1"
            >
              {categories.map(cat => (
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

        {/* Input Buscador (Extraído al componente compartido) */}
        <SearchBar 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          onFilterClick={() => setShowFilters(!showFilters)} 
        />

      </div>
    </>
  );
}
