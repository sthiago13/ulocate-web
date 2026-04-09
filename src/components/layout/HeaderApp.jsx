import React from 'react';
import logoULocate from '../../assets/logo_ulocate_final.png';

export default function HeaderApp({ className = '' }) {
  return (
    <div className={`bg-white flex items-center px-6 py-4 sm:px-12 sm:py-5 shadow-sm w-full ${className}`}>
      <div className="flex items-center gap-4">
        <img alt="Logo U-Locate" className="w-12 h-12 object-contain" src={logoULocate} />
        <h1 className="font-jakarta font-bold text-[28px] sm:text-[40px] md:text-[48px] text-[#101828]">
          <span className="text-[#155dfc]">U</span>-Locate GPS
        </h1>
      </div>
    </div>
  );
}
