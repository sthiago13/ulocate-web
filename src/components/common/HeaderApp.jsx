import React from 'react';
import logoUnet from '../../assets/logo-unet.png';

export default function HeaderApp({ className = '' }) {
  return (
    <div className={`bg-white flex items-center px-6 py-4 sm:px-12 sm:py-5 shadow-sm w-full ${className}`}>
      <div className="flex items-center gap-4">
        <img alt="UNET Logo" className="w-12 h-12 object-contain" src={logoUnet} />
        <h1 className="font-jakarta font-bold text-[28px] sm:text-[40px] md:text-[48px] text-[#101828]">
          U-Locate <span className="text-[#155dfc]">GPS</span>
        </h1>
      </div>
    </div>
  );
}
