import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdClose, MdPlace } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import ResultCard from '../common/ResultCard';
import SearchBar from '../common/SearchBar';
import { supabase } from '../../lib/supabaseClient';
import Spinner from '../common/Spinner';

export default function SearchPanel({ onClose, onLocationSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  
  const [ubicacionesRemotas, setUbicacionesRemotas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: ubis } = await supabase.from('Ubicacion').select('*');
        const { data: cats } = await supabase.from('Categoria').select('*');
        if (ubis) setUbicacionesRemotas(ubis);
        if (cats) setCategorias(cats);
      } catch (err) {
        console.error("Error cargando datos remotos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allResults = ubicacionesRemotas.map(u => {
    const cat = categorias.find(c => c.ID_Categoria === u.ID_Categoria);
    return {
      id: u.ID_Ubicacion,
      nombre: u.Nombre,
      categoria: cat ? cat.Nombre_Categoria : 'Desconocido',
      iconName: cat ? cat.Icono : 'MdPlace',
      isLocal: false
    };
  });

  const filtrados = allResults.filter(u => {
    const matchSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === 'Todos' || u.categoria === activeCategory;
    return matchSearch && matchCategory;
  });

  const categoryFilters = ['Todos', 'Académico', 'Alimentación', 'Servicios', 'Administrativo', 'Recreación'];

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/10 transition-opacity z-40" onClick={onClose} />
      <div className="fixed bottom-32 left-[5%] sm:left-[calc(50%-225px)] w-[90%] sm:w-[450px] bg-white flex flex-col items-center p-5 rounded-[30px] shadow-[0px_4px_24px_rgba(0,0,0,0.15)] max-h-[60vh] z-50 overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-800 text-lg ml-2">Buscar Lugares</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"><MdClose className="w-5 h-5" /></button>
        </div>

        <div className="w-full flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
          {loading && filtrados.length === 0 ? <Spinner text="Cargando..." /> : 
           filtrados.length > 0 ? filtrados.map(res => {
             const Icon = res.iconName && MdIcons[res.iconName] ? MdIcons[res.iconName] : MdIcons.MdPlace;
             return (
               <ResultCard 
                 key={res.id}
                 title={res.nombre}
                 subtitle={res.categoria}
                 icon={<Icon className="text-[24px] text-blue-600" />}
                 onClick={() => onLocationSelect && onLocationSelect(res.id)}
               />
             );
           }) : <div className="text-center text-gray-500 mt-10 text-sm">No se encontraron resultados</div>
          }
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="w-full flex gap-3 overflow-x-auto py-2 mb-2 scrollbar-hide">
              {categoryFilters.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap border ${activeCategory===cat ? 'bg-blue-600 text-white border-blue-600':'bg-gray-50 text-gray-600 border-gray-200'}`}>{cat}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <SearchBar value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onFilterClick={() => setShowFilters(!showFilters)} />
      </div>
    </>,
    document.body
  );
}
