import React from 'react';
import { MdClose, MdPlace, MdTimeline, MdPeople, MdCategory, MdEvent } from 'react-icons/md';

export default function AdministracionPanel({ onClose }) {
  const adminAreas = [
    { label: "Gestionar Lugares", icon: MdPlace, action: () => console.log('Lugares') },
    { label: "Gestionar Tramos", icon: MdTimeline, action: () => console.log('Tramos') },
    { label: "Gestionar Usuarios", icon: MdPeople, action: () => console.log('Usuarios') },
    { label: "Agregar Categorías", icon: MdCategory, action: () => console.log('Categorias') },
    { label: "Agregar Eventos", icon: MdEvent, action: () => console.log('Eventos') },
  ];

  return (
    <>
      {/* Overlay similar to MenuUsuario */}
      <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={onClose} />

      {/* Floating Panel Panel similar but a bit wider to hold the grid */}
      <div className="fixed bottom-32 left-[5%] sm:left-[calc(50%-200px)] w-[90%] sm:w-[400px] bg-white flex flex-col p-[30px] rounded-[30px] z-[45] shadow-[0px_4px_24px_rgba(0,0,0,0.1)]">

        {/* Header */}
        <div className="flex items-center justify-between w-full mb-[20px]">
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[18px] leading-[22px] text-[#101828]">
            Administración
          </h2>
          <button
            onClick={onClose}
            className="bg-[#e9e9e9] hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <MdClose className="text-gray-700 text-[18px]" />
          </button>
        </div>

        {/* Grid of Action Cards */}
        <div className="grid grid-cols-2 gap-4">
          {adminAreas.map((area, index) => {
            const Icon = area.icon;
            // The last item can span 2 columns if there's an odd number of items, to make it look neat.
            const isLastOdd = adminAreas.length % 2 !== 0 && index === adminAreas.length - 1;

            return (
              <button
                key={index}
                onClick={area.action}
                className={`flex flex-col items-center justify-center gap-2 bg-[#f9f9f9] hover:bg-[#e9e9e9] border border-gray-100 p-4 rounded-[20px] transition-colors group ${isLastOdd ? 'col-span-2' : ''}`}
              >
                <div className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Icon className="text-[#155dfc] text-[24px]" />
                </div>
                <span className="font-['Plus_Jakarta_Sans'] font-medium text-[13px] text-center text-[#101828] leading-[18px]">
                  {area.label}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </>
  );
}
