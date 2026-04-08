import React, { useState, useEffect } from 'react';
import { MdClose, MdEdit, MdSave } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import InputField from './common/InputField';
import Button from './common/Button';

export default function EditarCategoria({ isOpen, onClose, categoria, onSave }) {
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('');

  useEffect(() => {
    if (categoria && isOpen) {
      setNombre(categoria.Nombre_Categoria || '');
      setIcono(categoria.Icono || '');
    }
  }, [categoria, isOpen]);

  const handleSave = () => {
    if (!nombre.trim()) return;

    const updatedCat = {
      ...categoria,
      Nombre_Categoria: nombre,
      Icono: icono || 'MdCategory',
    };
    if (onSave) onSave(updatedCat);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[90] transition-opacity"
            onClick={onClose}
          />

          {/* Panel Derecha */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-none sm:rounded-l-[30px] z-[100] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-[30px]">
              <div className="flex gap-[15px] items-center">
                <div className="bg-amber-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                  <MdEdit className="text-amber-600 text-[28px]" />
                </div>
                <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                  <span className="font-bold text-[#101828] text-[20px] leading-[26px] truncate max-w-[200px]">
                    {categoria?.Nombre_Categoria || 'Categoría'}
                  </span>
                  <span className="font-semibold text-amber-600 text-[14px]">Editando categoría</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <MdClose className="text-gray-700 text-[24px]" />
              </button>
            </div>

            {/* Formulario */}
            <div className="flex-1 flex flex-col gap-5 font-['Plus_Jakarta_Sans'] mt-4">
              <InputField
                label="Nombre de Categoría"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Académico, Recreación..."
              />

              <InputField
                label="Nombre del Ícono (Opcional)"
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                placeholder="Ej. MdSchool, MdRestaurant..."
              />
              <p className="text-[12px] text-gray-500 -mt-2 ml-1">
                Utiliza nombres de Material Design Icons (react-icons/md).
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-[30px]">
              <Button onClick={handleSave} className="!text-[16px] !font-semibold !h-[55px] font-['Plus_Jakarta_Sans'] bg-[#101828] hover:bg-black border-none text-white shadow-lg flex justify-center items-center gap-2">
                <MdSave className="text-white text-[24px]" />
                Guardar Cambios
              </Button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
