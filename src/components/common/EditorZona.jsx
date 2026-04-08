import React, { useState, useEffect } from 'react';
import { MdClose, MdEdit, MdSave, MdSend, MdMap } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import InputField from './InputField';
import Button from './Button';

export default function EditorZona({ isOpen, onClose, zonaToEdit, onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!zonaToEdit;

  useEffect(() => {
    if (isOpen) {
      setNombre(isEditing ? (zonaToEdit.Nombre_Zona || '') : '');
      setError('');
    }
  }, [isOpen, zonaToEdit, isEditing]);

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre de la zona es obligatorio.');
      return;
    }

    setLoading(true);
    setError('');

    if (isEditing) {
      const { error: supaError } = await supabase
        .from('Zona')
        .update({ Nombre_Zona: nombre.trim() })
        .eq('ID_Zona', zonaToEdit.ID_Zona);

      setLoading(false);
      if (supaError) {
        setError('Error al actualizar la zona. Intenta nuevamente.');
        console.error(supaError);
        return;
      }
    } else {
      const { error: supaError } = await supabase
        .from('Zona')
        .insert({ Nombre_Zona: nombre.trim() });

      setLoading(false);
      if (supaError) {
        setError('Error al crear la zona. Intenta nuevamente.');
        console.error(supaError);
        return;
      }
    }

    if (onSuccess) onSuccess();
    if (onClose) onClose();
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

          {/* Panel */}
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
                <div className="bg-teal-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                  {isEditing
                    ? <MdEdit className="text-teal-600 text-[28px]" />
                    : <MdMap className="text-teal-600 text-[28px]" />
                  }
                </div>
                <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                  <span className="font-bold text-[#101828] text-[20px] leading-[26px] truncate max-w-[200px]">
                    {isEditing ? (zonaToEdit?.Nombre_Zona || 'Zona') : 'Nueva Zona'}
                  </span>
                  <span className="font-semibold text-teal-600 text-[14px]">
                    {isEditing ? 'Editando zona' : 'Agregando zona'}
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
                label="Nombre de la Zona"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Edificio Principal, Zona Deportiva..."
                maxLength={100}
              />

              {error && (
                <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-[10px] px-4 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Bottom Action */}
            <div className="mt-auto pt-[30px]">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="!text-[16px] !font-semibold !h-[55px] font-['Plus_Jakarta_Sans'] bg-[#101828] hover:bg-black border-none text-white shadow-lg flex justify-center items-center gap-2 disabled:opacity-60"
              >
                {isEditing ? <MdSave className="text-white text-[24px]" /> : <MdSend className="text-white text-[20px]" />}
                {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Agregar Zona'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
