import React, { useState, useEffect } from 'react';
import { MdClose, MdEdit, MdSave } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import SelectField from './SelectField';

export default function EditarUsuario({ isOpen, onClose, usuario, onSave }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('1'); // 1=user, 2=admin
  const [inactiva, setInactiva] = useState(false);

  useEffect(() => {
    if (usuario && isOpen) {
      setNombre(usuario.Nombre || '');
      setCorreo(usuario.Correo || '');
      setRol(usuario.ID_Rol?.toString() || '1');
      setInactiva(usuario.Activo === false);
    }
  }, [usuario, isOpen]);

  const handleSave = () => {
    // Aquí se conectaría con Supabase para actualizar.
    const updatedUser = {
      ...usuario,
      Nombre: nombre,
      Correo: correo,
      ID_Rol: parseInt(rol, 10),
      Activo: !inactiva
    };
    if (onSave) onSave(updatedUser);
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
                <div className="bg-blue-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                  <MdEdit className="text-[#155dfc] text-[28px]" />
                </div>
                <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                  <span className="font-bold text-[#101828] text-[20px] leading-[26px] truncate max-w-[200px]">
                    Editar Usuario
                  </span>
                  <span className="font-semibold text-[#155dfc] text-[14px]">Actualizando datos</span>
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
            <div className="flex-1 flex flex-col gap-5 font-['Plus_Jakarta_Sans']">
              {/* Nombre Completo */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-gray-200 rounded-[12px] px-4 py-3 text-[#101828] focus:outline-none focus:border-[#155dfc] focus:ring-1 focus:ring-[#155dfc] transition-colors"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              {/* Correo */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-gray-700">Correo</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-gray-200 rounded-[12px] px-4 py-3 text-[#101828] focus:outline-none focus:border-[#155dfc] focus:ring-1 focus:ring-[#155dfc] transition-colors"
                  placeholder="Ej. correo@ejemplo.com"
                />
              </div>

              {/* Rol */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-gray-700">Rol en el sistema</label>
                <SelectField
                  label=""
                  name="rol"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  options={[
                    { value: '1', label: 'Estudiante (Normal)' },
                    { value: '2', label: 'Administrador' }
                  ]}
                />
              </div>

              {/* Cuenta Inactiva */}
              <div className="flex items-center justify-between mt-2 pt-5 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-[#101828]">Cuenta inactiva</span>
                  <span className="text-[13px] text-gray-500">El usuario no podrá acceder al sistema</span>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={inactiva}
                      onChange={(e) => setInactiva(e.target.checked)}
                    />
                    <div className={`block w-12 h-7 rounded-full transition-colors ${inactiva ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${inactiva ? 'transform translate-x-5' : ''}`}></div>
                  </div>
                </label>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-[30px]">
              <button
                onClick={handleSave}
                className="w-full bg-[#155dfc] hover:bg-blue-700 transition-colors rounded-[16px] py-[14px] flex justify-center items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <MdSave className="text-white text-[24px]" />
                <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                  Guardar Cambios
                </span>
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
