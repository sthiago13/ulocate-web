import React, { useState, useEffect } from 'react';
import { MdClose, MdCategory, MdEdit, MdSave, MdSend } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import InputField from './common/InputField';
import IconPicker from './common/IconPicker';
import Button from './common/Button';

export default function EditorCategoria({ isOpen, onClose, categoriaToEdit, onSave }) {
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('');

  const isEditing = !!categoriaToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setNombre(categoriaToEdit.Nombre_Categoria || '');
        setIcono(categoriaToEdit.Icono || '');
      } else {
        setNombre('');
        setIcono('');
      }
    }
  }, [isOpen, categoriaToEdit, isEditing]);

  const handleSubmit = () => {
    if (!nombre.trim()) return;

    const catData = {
      Nombre_Categoria: nombre,
      Icono: icono || 'MdCategory',
    };

    if (isEditing) {
      catData.ID_Categoria = categoriaToEdit.ID_Categoria;
    }

    if (onSave) onSave(catData);
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
                  {isEditing ? (
                    <MdEdit className="text-amber-600 text-[28px]" />
                  ) : (
                    <MdCategory className="text-amber-600 text-[28px]" />
                  )}
                </div>
                <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                  <span className="font-bold text-[#101828] text-[20px] leading-[26px] truncate max-w-[200px]">
                    {isEditing ? (categoriaToEdit?.Nombre_Categoria || 'Categoría') : 'Nueva Categoría'}
                  </span>
                  <span className="font-semibold text-amber-600 text-[14px]">
                    {isEditing ? 'Editando categoría' : 'Agregando categoría'}
                  </span>
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

              <IconPicker
                label="Ícono de Categoría"
                iconoActual={icono}
                onChange={setIcono}
              />
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-[30px]">
              <Button onClick={handleSubmit} className="!text-[16px] !font-semibold !h-[55px] font-['Plus_Jakarta_Sans'] bg-[#101828] hover:bg-black border-none text-white shadow-lg flex justify-center items-center gap-2">
                {isEditing ? <MdSave className="text-white text-[24px]" /> : <MdSend className="text-white text-[20px]" />}
                {isEditing ? 'Guardar Cambios' : 'Agregar Categoría'}
              </Button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
