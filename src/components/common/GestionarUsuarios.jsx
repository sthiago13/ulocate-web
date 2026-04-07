import React, { useState, useEffect } from 'react';
import { MdClose, MdPersonAdd, MdAdminPanelSettings, MdPerson, MdEmail } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

export default function GestionarUsuarios({ isOpen, onClose }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchUsuarios = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('Usuario')
          .select('*')
          .order('Nombre', { ascending: true });

        if (data && data.length > 0) {
          setUsuarios(data);
        } else {
          // Datos de prueba por si la tabla está vacía o hay error
          setUsuarios([
            { ID_Usuario: '1', Nombre: 'Administrador Principal', Correo: 'admin@unet.edu.ve', ID_Rol: 1 },
            { ID_Usuario: '2', Nombre: 'Carlos Mendoza', Correo: 'carlos.m@unet.edu.ve', ID_Rol: 2 },
            { ID_Usuario: '3', Nombre: 'María Pérez', Correo: 'm.perez@unet.edu.ve', ID_Rol: 2 },
          ]);
        }
        setLoading(false);
      };

      fetchUsuarios();
    }
  }, [isOpen]);

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
            className="fixed inset-0 bg-black/40 z-[70] transition-opacity"
            onClick={onClose}
          />

          {/* Panel Derecha */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] overflow-y-auto bg-[#f9f9f9] flex flex-col p-[30px] rounded-none sm:rounded-l-[30px] z-[80] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-[30px]">
              <div className="flex gap-[15px] items-center">
                <div className="bg-blue-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                  <MdPerson className="text-[#155dfc] text-[28px]" />
                </div>
                <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                  <span className="font-bold text-[#101828] text-[20px] leading-[26px]">Gestionar Usuarios</span>
                  <span className="font-medium text-gray-500 text-[14px]">Directorio de miembros</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <MdClose className="text-gray-700 text-[24px]" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 pb-[100px] font-['Plus_Jakarta_Sans']">
              {loading ? (
                <div className="text-center font-sans text-gray-500 py-10">Cargando directorio de usuarios...</div>
              ) : usuarios.length === 0 ? (
                <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[10px] border border-gray-200">
                  Aún no hay usuarios registrados.
                </div>
              ) : (
                usuarios.map((usr) => {
                  const isAdmin = usr.ID_Rol === 1; // Asumimos que 1 es admin
                  const initialLetter = usr.Nombre ? usr.Nombre.charAt(0).toUpperCase() : 'U';

                  return (
                    <div
                      key={usr.ID_Usuario}
                      className="flex items-center gap-[15px] bg-white p-[15px] rounded-[15px] shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
                    >
                      {/* Avatar */}
                      <div className={`flex items-center justify-center w-[45px] h-[45px] rounded-full shrink-0 ${isAdmin ? 'bg-[#ffeedd] text-[#e8701a]' : 'bg-gray-100 text-gray-600'}`}>
                        <span className="font-bold text-[18px]">{initialLetter}</span>
                      </div>

                      {/* Info Usuario */}
                      <div className="flex flex-col flex-1 truncate">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-[15px] text-[#101828] truncate pr-2">
                            {usr.Nombre || 'Sin Nombre'}
                          </span>
                          {isAdmin && (
                            <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#e8701a] bg-[#ffeedd] px-2 py-0.5 rounded-full uppercase tracking-wider">
                              <MdAdminPanelSettings className="text-[14px]" /> Admin
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-[13px] mt-0.5">
                          <MdEmail className="shrink-0" />
                          <span className="truncate">{usr.Correo || 'Sin Correo'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sticky Bottom Area: Invitar Usuario */}
            <div className="absolute bottom-0 left-0 right-0 p-[30px] bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent">
              <button
                onClick={() => console.log('Abrir modal de invitar')}
                className="w-full bg-[#155dfc] hover:bg-blue-700 transition-colors rounded-[16px] py-[14px] flex justify-center items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <MdPersonAdd className="text-white text-[24px]" />
                <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                  Invitar a usuario
                </span>
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
