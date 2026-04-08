import React, { useState, useEffect } from 'react';
import HeaderApp from '../components/common/HeaderApp';
import BottomMenu from '../components/common/BottomMenu';
import CampusMap from '../components/CampusMap';
import TarjetaUbicacion from '../components/common/TarjetaUbicacion';

export default function Home() {
  const [isRouteAdminMode, setIsRouteAdminMode] = useState(false);
  const [selectedUbiId, setSelectedUbiId] = useState(null);

  // Escucha evento global para abrir la tarjeta desde cualquier lugar (Buscador, Historial, etc.)
  useEffect(() => {
    const handleSelect = (e) => {
      if (e.detail?.id) setSelectedUbiId(e.detail.id);
    };
    window.addEventListener('select_location', handleSelect);
    return () => window.removeEventListener('select_location', handleSelect);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 relative font-sans overflow-hidden">

      {/* En-app Header */}
      <HeaderApp className="relative z-10 shrink-0" />

      {/* Map Container Area */}
      <div className="flex-1 relative w-full bg-[#E5E5E5]">
        <CampusMap
          isRouteAdminMode={isRouteAdminMode}
          onExitAdminMode={() => setIsRouteAdminMode(false)}
          onUbicacionSelect={(id) => setSelectedUbiId(id)}
        />
      </div>

      {/* Componente de detalle (Portalized inside) */}
      {selectedUbiId && (
        <TarjetaUbicacion
          ubicacionId={selectedUbiId}
          onClose={() => setSelectedUbiId(null)}
        />
      )}

      {/* Navigation Options Menu (Portal inside) */}
      <BottomMenu
        onOpenAdminRoutes={() => setIsRouteAdminMode(true)}
      />

    </div>
  );
}

