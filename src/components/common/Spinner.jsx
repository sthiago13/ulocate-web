import React from 'react';

export default function Spinner({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-[14px] font-sans text-gray-500 font-medium">{text}</p>
    </div>
  );
}
