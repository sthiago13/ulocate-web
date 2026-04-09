import React, { useEffect } from 'react';
import { MdCheckCircle, MdClose } from 'react-icons/md';

export default function ArrivalToast({ destination, onDismiss }) {
  useEffect(() => {
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 w-[320px] max-w-[92vw] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(34,197,94,0.25)] border border-green-200 p-5 font-['Plus_Jakarta_Sans'] animate-bounce"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-[16px] flex items-center justify-center shrink-0">
          <MdCheckCircle className="text-green-600 text-[28px]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[17px] text-gray-900">¡Has llegado!</p>
          <p className="text-green-700 text-[13px] font-medium mt-0.5 truncate">
            {destination?.Nombre || destination?.nombre}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 transition-colors"
          aria-label="Cerrar"
        >
          <MdClose className="text-[16px]" />
        </button>
      </div>
    </div>
  );
}
