import React, { useState } from 'react';
import { MdMenu, MdMap, MdSearch } from 'react-icons/md';
import MenuUsuario from './MenuUsuario';
import SearchPanel from './SearchPanel';

export default function BottomMenu({ className = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-around w-[80%] sm:w-[350px] md:w-[400px] h-[65px] px-6 ${className}`}>
        
        {/* Menu Icon */}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-black group"
        >
          <MdMenu className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </button>

        {/* Map Icon (Active) */}
      <button className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors text-[#155dfc] group">
        <MdMap className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>

      {/* Search Icon */}
      <button 
        onClick={() => setIsSearchOpen(true)}
        className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-black group"
      >
         <MdSearch className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>
      
    </div>

    {isMenuOpen && (
      <MenuUsuario onClose={() => setIsMenuOpen(false)} />
    )}

    {isSearchOpen && (
      <SearchPanel onClose={() => setIsSearchOpen(false)} />
    )}
    </>
  );
}
