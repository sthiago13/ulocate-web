import React, { useState } from 'react';
import { MdClose, MdPersonAdd, MdSend } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

export default function InvitarUsuario({ isOpen, onClose, onInvite }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('2'); // 1=admin, 2=user

  const handleInvite = () => {
    // Validar y enviar
    const newUser = {
      Nombre: nombre,
      Correo: correo,
      ID_Rol: parseInt(rol, 10),
    };
    if (onInvite) onInvite(newUser);

    // Limpiar para la próxima vez
    setNombre('');
    setCorreo('');
    setRol('2');
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
                  <MdPersonAdd className="text-[#155dfc] text-[28px]" />
                </div>
                <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                  <span className="font-bold text-[#101828] text-[20px] leading-[26px]">Nuevo Miembro</span>
                  <span className="font-semibold text-[#155dfc] text-[14px]">Invitando usuario</span>
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
              {/* Rol */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-gray-700">Rol en el sistema</label>
                <div className="relative">
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    className="w-full appearance-none bg-[#f9f9f9] border border-gray-200 rounded-[12px] px-4 py-3 text-[#101828] focus:outline-none focus:border-[#155dfc] focus:ring-1 focus:ring-[#155dfc] transition-colors"
                  >
                    <option value="1">Administrador</option>
                    <option value="2">Usuario Normal</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

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
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-[30px]">
              <button
                onClick={handleInvite}
                className="w-full bg-[#101828] hover:bg-black transition-colors rounded-[16px] py-[14px] flex justify-center items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <MdSend className="text-white text-[20px]" />
                <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                  Enviar Invitación
                </span>
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
