import React, { useState, useRef } from 'react';
import HeaderApp from '../components/layout/HeaderApp';
import BottomMenu from '../components/layout/BottomMenu';
import CampusMap from '../components/map/CampusMap';

export default function Home() {
  const [isRouteAdminMode, setIsRouteAdminMode] = useState(false);

  // Ref para comunicar BottomMenu → CampusMap (startRoute)
  const campusMapRef = useRef(null);

  // Ref para comunicar CampusMap → BottomMenu (abrir TarjetaUbicacion al clic en pin)
  const selectLocationRef = useRef(null);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 relative font-sans overflow-hidden">

      {/* En-app Header */}
      <HeaderApp className="relative z-10 shrink-0" />

      {/* Map Container Area */}
      <div className="flex-1 relative w-full bg-[#E5E5E5]">
        <CampusMap
          ref={campusMapRef}
          isRouteAdminMode={isRouteAdminMode}
          onExitAdminMode={() => setIsRouteAdminMode(false)}
          onUbicacionSelect={(id) => {
            // Delegar al BottomMenu para abrir TarjetaUbicacion
            if (selectLocationRef.current?.handleLocationSelect) {
              selectLocationRef.current.handleLocationSelect(id);
            }
          }}
        />
      </div>

      {/* Navigation Options Menu (Portal inside) */}
      <BottomMenu
        ref={selectLocationRef}
        onOpenAdminRoutes={() => setIsRouteAdminMode(true)}
        campusMapRef={campusMapRef}
      />

    </div>
  );
}
