import React from 'react';
import { MdSearch, MdTune } from 'react-icons/md';

export default function SearchBar({ 
  value, 
  onChange, 
  onFilterClick, 
  placeholder = "Escribe para buscar un lugar...",
  className = "" 
}) {
  return (
    <div className={`w-full h-[55px] bg-[#f0f0f0] rounded-full flex items-center px-2 py-1 shadow-inner shrink-0 mt-2 ${className}`}>
      <button 
        onClick={onFilterClick}
        className="p-2 text-gray-500 border-r border-gray-300 mr-2 cursor-pointer hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center"
        title="Opciones de filtrado"
      >
        <MdTune className="w-5 h-5" />
      </button>
      
      <input 
        type="text" 
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none font-sans text-[15px] sm:text-[16px] text-[#101828] placeholder-gray-500 w-full min-w-0"
        value={value}
        onChange={onChange}
      />
      
      <button 
        className="p-3 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-sm transition-colors ml-2"
        title="Buscar"
      >
        <MdSearch className="w-5 h-5" />
      </button>
    </div>
  );
}
