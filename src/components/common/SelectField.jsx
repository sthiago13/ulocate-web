import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdKeyboardArrowDown } from 'react-icons/md';

export default function SelectField({
  label,
  className = '',
  id,
  options = [],
  name,
  value,
  onChange,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (val) => {
    // Simulamos un evento nativo para que el padre lo capture igual
    onChange({
      target: { name, value: val }
    });
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col gap-2 items-start w-full relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
          {label}
        </label>
      )}
      
      {/* Botón principal del selector */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-[#090909] flex items-center justify-between px-3 rounded-[8px] w-full h-[46px] cursor-pointer"
        {...props}
      >
        <span className={`font-['Plus_Jakarta_Sans'] font-normal text-[14px] truncate ${!selectedOption?.label ? 'text-[#a3a3a3]' : 'text-black'}`}>
          {selectedOption ? selectedOption.label : 'Seleccionar...'}
        </span>
        <MdKeyboardArrowDown className={`text-[20px] text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menú Desplegable con Animación */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[100%] left-0 w-full mt-2 bg-white border border-gray-200 rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50 py-2 max-h-[200px] overflow-y-auto custom-scrollbar"
          >
            {options.map((opt, i) => (
              <div
                key={i}
                onClick={() => handleSelect(opt.value)}
                className={`px-4 py-2 cursor-pointer font-['Plus_Jakarta_Sans'] text-[14px] transition-colors ${
                  value === opt.value
                    ? 'bg-blue-50 text-[#155dfc] font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
