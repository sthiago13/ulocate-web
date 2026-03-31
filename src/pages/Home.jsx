import React from 'react';
import HeaderApp from '../components/common/HeaderApp';
import BottomMenu from '../components/common/BottomMenu';

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden relative font-sans">
      
      {/* En-app Header */}
      <HeaderApp className="z-20 shrink-0" />
      
      {/* Map Container Area */}
      <div className="flex-1 relative w-full h-full bg-[#E5E5E5] custom-map-pattern">
        
        {/* Decorative Grid Background to mimic a map grid temporarily */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #9ca3af 1px, transparent 1px),
              linear-gradient(to bottom, #9ca3af 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
          <div className="bg-white/80 px-6 py-3 rounded-xl shadow-sm text-center">
            <h2 className="font-jakarta font-bold text-gray-700 text-xl">Integración del Mapa</h2>
            <p className="font-inter text-gray-500 text-sm mt-1">El mapa de Leaflet/Google/Mapbox irá aquí</p>
          </div>
        </div>

      </div>
      
      {/* Navigation Options Menu */}
      <BottomMenu className="z-20" />

    </div>
  );
}
