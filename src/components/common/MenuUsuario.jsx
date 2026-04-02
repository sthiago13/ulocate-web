import React, { useState } from 'react';
import { MdPerson, MdStar, MdHistory, MdNotificationsActive, MdAdminPanelSettings, MdClose } from 'react-icons/md';
import { AnimatePresence } from 'framer-motion';
import UsuarioMiPerfil from './UsuarioMiPerfil';
import LugaresFavoritos from './LugaresFavoritos';

export default function MenuUsuario({ onClose }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const menuItems = [
    { label: "Mi perfil", Icon: MdPerson, action: () => setShowProfile(true) },
    { label: "Lugares favoritos", Icon: MdStar, action: () => setShowFavorites(true) },
    { label: "Historial de rutas", Icon: MdHistory },
    { label: "Opciones de Notificación", Icon: MdNotificationsActive },
    { label: "Administración", Icon: MdAdminPanelSettings },
  ];

  return (
    <>
      {/* Overlay opaco (opcional pero ayuda a enfocar el menú) */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Contenedor principal del menú */}
      <div className="fixed bottom-32 left-[5%] sm:left-[calc(50%-250px)] w-[276px] bg-white flex flex-col items-center justify-between p-[30px] rounded-[30px] z-[45] shadow-[0px_4px_24px_rgba(0,0,0,0.1)]">

        <div className="w-full flex-col flex gap-[14px]">

          {/* Header del menú */}
          <div className="flex items-center justify-between w-full">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] leading-[18px] text-[#101828]">
              Menu Principal
            </h2>
            <button
              onClick={onClose}
              className="bg-[#e9e9e9] hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              <MdClose className="text-gray-700 text-[18px]" />
            </button>
          </div>

          {/* Opciones */}
          <div className="flex flex-col gap-[8px] mt-2">
            <div className="flex flex-col gap-[10px]">
              {menuItems.map((item, index) => {
                const Icon = item.Icon;
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="flex items-center gap-[16px] py-2 w-full hover:bg-gray-50 rounded-lg transition-colors text-left group"
                  >
                    <Icon className="text-gray-600 text-[24px] group-hover:text-[#155dfc] transition-colors" />
                    <span className="font-['Plus_Jakarta_Sans'] text-[14px] text-[#101828] font-normal leading-[20px]">
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Botón Salir */}
        <div className="w-full mt-[30px] flex justify-center">
          <button className="bg-[#cd1e1e] hover:bg-red-800 transition-colors w-full rounded-[25px] py-[10px] flex justify-center items-center">
            <span className="text-[#f9f9f9] font-['Plus_Jakarta_Sans'] font-normal text-[20px] leading-[20px]">
              Cerrar sesión
            </span>
          </button>
        </div>

      </div>

      <AnimatePresence>
        {showProfile && (
          <UsuarioMiPerfil key="usuario-perfil" onClose={() => setShowProfile(false)} />
        )}
        {showFavorites && (
          <LugaresFavoritos key="lugares-favoritos" onClose={() => setShowFavorites(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
