import React from 'react';
import { MdClose } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function UsuarioMiPerfil({ onClose }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-[90%] sm:w-[456px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-l-[30px] z-[60] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
      >

        {/* Header */}
        <div className="flex items-center justify-between w-full mb-[30px]">
          <div className="flex gap-[20px] items-center">
            <div className="bg-[#0d3796] flex items-center justify-center rounded-full w-[60px] h-[60px] shrink-0">
              <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#f9f9f9] text-[24px]">
                J
              </span>
            </div>
            <div className="flex flex-col font-['Plus_Jakarta_Sans'] text-[20px]">
              <span className="font-medium text-[#101828] leading-[26px]">Mi perfil</span>
              <span className="font-normal text-[#0d3796] leading-[26px]">Editar datos</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <MdClose className="text-gray-700 text-[24px]" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-[39px] w-full">

          <div className="flex flex-col gap-[20px] w-full">
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
                Nombre Completo
              </label>
              <input
                type="text"
                defaultValue="José Javier"
                className="bg-white border border-[#090909] rounded-[8px] p-[12px] h-[62px] w-full font-['Plus_Jakarta_Sans'] text-[16px] text-[#a3a3a3] focus:text-[#040f0f] focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
                Correo
              </label>
              <input
                type="email"
                defaultValue="jose@unet.edu.ve"
                className="bg-white border border-[#090909] rounded-[8px] p-[12px] h-[62px] w-full font-['Plus_Jakarta_Sans'] text-[16px] text-[#a3a3a3] focus:text-[#040f0f] focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
              />
            </div>

            <div className="flex flex-row gap-[20px] w-full">
              <div className="flex flex-col gap-[8px] flex-1 w-full">
                <label className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
                  Carrera
                </label>
                <input
                  type="text"
                  defaultValue="Ing. Informatica"
                  className="bg-white border border-[#090909] rounded-[8px] p-[12px] h-[62px] w-full font-['Plus_Jakarta_Sans'] text-[16px] text-[#a3a3a3] focus:text-[#040f0f] focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                />
              </div>
              <div className="flex flex-col gap-[8px] flex-1 w-full">
                <label className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
                  Semestre
                </label>
                <input
                  type="text"
                  defaultValue="8vo semestre"
                  className="bg-white border border-[#090909] rounded-[8px] p-[12px] h-[62px] w-full font-['Plus_Jakarta_Sans'] text-[16px] text-[#a3a3a3] focus:text-[#040f0f] focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[16px] w-full mt-2">
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
                Contraseña actual
              </label>
              <input
                type="password"
                placeholder="Escribe tu contraseña actual..."
                className="bg-white border border-[#090909] rounded-[8px] p-[12px] h-[62px] w-full font-['Plus_Jakarta_Sans'] text-[16px] text-[#a3a3a3] focus:text-[#040f0f] focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
                Contraseña nueva
              </label>
              <input
                type="password"
                placeholder="Escribe tu nueva contraseña..."
                className="bg-white border border-[#090909] rounded-[8px] p-[12px] h-[62px] w-full font-['Plus_Jakarta_Sans'] text-[16px] text-[#a3a3a3] focus:text-[#040f0f] focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
                Repita su nueva contraseña
              </label>
              <input
                type="password"
                placeholder="Escribe de nuevo tu nueva contraseña..."
                className="bg-white border border-[#090909] rounded-[8px] p-[12px] h-[62px] w-full font-['Plus_Jakarta_Sans'] text-[16px] text-[#a3a3a3] focus:text-[#040f0f] focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="w-full mt-[40px] flex justify-center">
          <button className="bg-[#155dfc] hover:bg-blue-700 transition-colors w-full sm:w-[298px] rounded-[13px] py-[10px] flex justify-center items-center h-[50px]">
            <span className="text-[#f9f9f9] font-['Inter'] font-normal text-[24px]">
              Guardar
            </span>
          </button>
        </div>

      </motion.div>
    </>
  );
}
