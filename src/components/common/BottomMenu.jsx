import React, { useState } from 'react';
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
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Map Icon (Active) */}
      <button className="p-3 bg-blue-50/50 hover:bg-blue-100 rounded-full transition-colors text-[#155dfc] group">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2m0 18l6-3m-6 3V2m6 15l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 18V4" />
        </svg>
      </button>

      {/* Search Icon */}
      <button className="p-3 hover:bg-gray-100 rounded-full transition-colors text-black group">
         <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
         </svg>
      </button>
      
    </div>

    {isMenuOpen && (
      <MenuUsuario onClose={() => setIsMenuOpen(false)} />
    )}
    </>
  );
}
