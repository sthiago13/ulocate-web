import React from 'react';
import { MdClose, MdAddCircle, MdTimeline, MdSave } from 'react-icons/md';

export default function AdminRoutesPanel({ onClose }) {
  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-lg z-60 w-64 border border-blue-500">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <MdTimeline className="text-blue-600" /> Editor de Rutas
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
          <MdClose size={20} />
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-4 font-inter">
        Modo de edición activado. Haz clic en el mapa para añadir nodos. Haz clic en dos nodos seguidos para conectarlos.
      </div>

      <div className="flex flex-col gap-2">
        <button className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-100 transition">
          <MdAddCircle /> Añadir Nodos
        </button>
        <button className="flex items-center justify-center gap-2 bg-green-50 text-green-600 font-bold py-2 rounded-lg hover:bg-green-100 transition">
          <MdSave /> Guardar Trazado
        </button>
      </div>
    </div>
  );
}
