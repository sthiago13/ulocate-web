import React, { useState } from 'react';
import { MdStar, MdStarBorder, MdEdit, MdDelete } from 'react-icons/md';

export default function ResultCard({ 
  icon = "🎓", 
  title = "Edificio A", 
  subtitle = "Academico", 
  variant = "user", // "user" | "admin"
  className = "" 
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className={`bg-white w-full flex items-center justify-between py-3 px-2 hover:bg-gray-50 transition-colors rounded-xl cursor-pointer shadow-sm border border-gray-100 ${className}`}>
      
      <div className="flex items-center gap-4">
        {/* Icon Container */}
        <div className="flex items-center justify-center w-[50px] h-[50px] bg-gray-100 rounded-xl text-3xl">
          {icon}
        </div>
        
        {/* Text Info */}
        <div className="flex flex-col">
          <h3 className="font-jakarta font-bold text-[#1e1e1e] text-[18px] sm:text-[20px] leading-tight">
            {title}
          </h3>
          <p className="font-jakarta font-light text-gray-500 text-[13px] sm:text-[14px] tracking-wide mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 px-2">
        {variant === "user" ? (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
            className="p-2 rounded-full hover:bg-blue-50 transition-colors text-blue-600"
          >
            {isFavorite ? <MdStar className="w-7 h-7" /> : <MdStarBorder className="w-7 h-7 text-gray-400 hover:text-blue-500 transition-colors" />}
          </button>
        ) : (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); console.log("Edit requested"); }}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
              title="Editar"
            >
              <MdEdit className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); console.log("Delete requested"); }}
              className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-600"
              title="Eliminar"
            >
              <MdDelete className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

    </div>
  );
}
