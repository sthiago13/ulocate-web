import React from 'react';
import { MdClose, MdDirectionsWalk, MdNavigation } from 'react-icons/md';

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatTime(meters) {
  // Velocidad caminando ~4.5 km/h = 75 m/min
  const mins = Math.ceil(meters / 75);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}

export default function NavigationPanel({ destination, distanceRemaining, totalDistance, onCancel }) {
  const progress = totalDistance > 0
    ? Math.max(0, Math.min(100, ((totalDistance - distanceRemaining) / totalDistance) * 100))
    : 0;

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[340px] max-w-[92vw] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-green-100 font-['Plus_Jakarta_Sans']"
    >
      {/* Barra de progreso superior */}
      <div className="h-1.5 bg-gray-100 w-full">
        <div
          className="h-full bg-green-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        {/* Destino */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-green-100 rounded-[14px] flex items-center justify-center text-green-600 shrink-0">
              <MdNavigation className="text-[22px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">Navegando a</p>
              <p className="font-bold text-[15px] text-gray-900 truncate">{destination?.Nombre || destination?.nombre || 'Destino'}</p>
              {destination?.Categoria?.Nombre_Categoria && (
                <p className="text-[12px] text-gray-500">{destination.Categoria.Nombre_Categoria}</p>
              )}
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors shrink-0 mt-1"
            aria-label="Cancelar navegación"
          >
            <MdClose className="text-[18px]" />
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-[16px] p-3 text-center">
            <p className="text-[22px] font-black text-green-700 leading-none">{formatDistance(distanceRemaining)}</p>
            <p className="text-[11px] text-green-600 mt-1 flex items-center justify-center gap-1">
              <MdDirectionsWalk className="text-[13px]" /> Distancia restante
            </p>
          </div>
          <div className="bg-blue-50 rounded-[16px] p-3 text-center">
            <p className="text-[22px] font-black text-blue-700 leading-none">{formatTime(distanceRemaining)}</p>
            <p className="text-[11px] text-blue-600 mt-1">Tiempo estimado</p>
          </div>
        </div>

        {/* Progreso textual */}
        <p className="text-[12px] text-gray-500 text-center">
          {Math.round(progress)}% completado · {formatDistance(totalDistance - distanceRemaining)} recorrido
        </p>
      </div>
    </div>
  );
}
