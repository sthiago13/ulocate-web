import React, { useState } from 'react';
import HeaderApp from '../components/common/HeaderApp';
import BottomMenu from '../components/common/BottomMenu';
import CampusMap from '../components/CampusMap';

export default function Home() {
  const [isRouteAdminMode, setIsRouteAdminMode] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 relative font-sans">

      {/* En-app Header */}
      <HeaderApp className="relative z-1000 shrink-0" />

      {/* Map Container Area */}
      <div className="flex-1 relative w-full bg-[#E5E5E5]">
        <CampusMap
          isRouteAdminMode={isRouteAdminMode}
          onExitAdminMode={() => setIsRouteAdminMode(false)}
        />
      </div>

      {/* Navigation Options Menu (Portal inside) */}
      <BottomMenu
        onOpenAdminRoutes={() => setIsRouteAdminMode(true)}
      />

    </div>
  );
}
