import React from 'react';

export default function Spinner({ size = 'w-8 h-8', border = 'border-4', color = 'border-blue-500', text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className={`${size} ${border} ${color} border-t-transparent rounded-full animate-spin`}></div>
      {text && <span className="font-sans text-gray-500 font-medium">{text}</span>}
    </div>
  );
}
