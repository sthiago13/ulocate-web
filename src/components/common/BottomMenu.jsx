import React, { useState } from 'react';
import { MdMenu, MdMap, MdSearch } from 'react-icons/md';
import MenuUsuario from './MenuUsuario';

export default function BottomMenu({ className = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-around w-[90%] sm:w-[500px] md:w-[600px] h-[80px] px-8 ${className}`}>
        
        {/* Menu Icon */}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-3 hover:bg-gray-100 rounded-full transition-colors text-black group"
        >
          <MdMenu className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>

        {/* Map Icon (Active) */}
      <button className="p-3 bg-blue-50/50 hover:bg-blue-100 rounded-full transition-colors text-[#155dfc] group">
        <MdMap className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>

      {/* Search Icon */}
      <button className="p-3 hover:bg-gray-100 rounded-full transition-colors text-black group">
         <MdSearch className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>
      
    </div>

    {isMenuOpen && (
      <MenuUsuario onClose={() => setIsMenuOpen(false)} />
    )}
    </>
  );
}
