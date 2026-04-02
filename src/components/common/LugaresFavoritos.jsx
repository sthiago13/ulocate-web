import React from 'react';
import { MdClose, MdStar, MdBook, MdLocationOn, MdAccountBalance, MdRestaurant, MdTheaterComedy } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function LugaresFavoritos({ onClose }) {
  return (
    <>
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Sidebar Modal */}
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
            <div className="bg-[#fffabe] flex items-center justify-center rounded-[100px] w-[60px] h-[60px] shrink-0">
              <MdStar className="text-[#eab308] text-[32px]" />
            </div>
            <div className="flex flex-col font-['Plus_Jakarta_Sans']">
              <span className="font-medium text-[#101828] text-[20px] leading-[26px]">Lugares favoritos</span>
              <span className="font-normal text-[#fff036] text-[16px] leading-[26px]">2 Guardados</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <MdClose className="text-gray-700 text-[24px]" />
          </button>
        </div>

        {/* Saved Places */}
        <div className="flex flex-col gap-[22px] w-full mb-[30px]">
          {/* Item 1 */}
          <div className="bg-[#f9f9f9] border border-[#101828] flex items-center justify-between px-[20px] py-[15px] rounded-[10px] w-full hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex gap-[15px] items-center">
              <div className="bg-[#fffabe] flex items-center justify-center rounded-[10px] w-[40px] h-[40px] shrink-0">
                <MdBook className="text-[#101828] text-[24px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#101828] text-[16px] leading-[18px]">Biblioteca</span>
                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[#101828] text-[14px] leading-[20px]">Servicio</span>
              </div>
            </div>
            <div className="flex gap-[6px] items-center">
              <MdLocationOn className="text-red-500 text-[20px]" />
              <MdStar className="text-[#eab308] text-[20px]" />
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-[#f9f9f9] border border-[#101828] flex items-center justify-between px-[20px] py-[15px] rounded-[10px] w-full hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex gap-[15px] items-center">
              <div className="bg-[#fffabe] flex items-center justify-center rounded-[10px] w-[40px] h-[40px] shrink-0">
                <MdAccountBalance className="text-[#101828] text-[22px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#101828] text-[16px] leading-[18px]">Edificio A</span>
                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[#101828] text-[14px] leading-[20px]">Academico</span>
              </div>
            </div>
            <div className="flex gap-[6px] items-center">
              <MdLocationOn className="text-red-500 text-[20px]" />
              <MdStar className="text-[#eab308] text-[20px]" />
            </div>
          </div>
        </div>

        {/* Add more places */}
        <div className="flex flex-col gap-[16px] w-full">
          <span className="font-['Plus_Jakarta_Sans'] font-normal text-[#4a4a4a] text-[14px] w-full">
            Agregar mas lugares
          </span>

          <div className="bg-[#f9f9f9] flex items-center justify-between px-[15px] py-[10px] rounded-[10px] w-full hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex gap-[15px] items-center">
              <div className="flex items-center justify-center w-[30px] h-[30px]">
                <MdRestaurant className="text-gray-500 text-[24px]" />
              </div>
              <span className="font-['Plus_Jakarta_Sans'] font-normal text-[#101828] text-[14px]">
                Comedor Universitario
              </span>
            </div>
            <MdStar className="text-[#eab308] text-[24px]" />
          </div>

          <div className="bg-[#f9f9f9] flex items-center justify-between px-[15px] py-[10px] rounded-[10px] w-full hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex gap-[15px] items-center">
              <div className="flex items-center justify-center w-[30px] h-[30px]">
                <MdTheaterComedy className="text-gray-500 text-[24px]" />
              </div>
              <span className="font-['Plus_Jakarta_Sans'] font-normal text-[#101828] text-[14px]">
                Teatro de la Universidad
              </span>
            </div>
            <MdStar className="text-[#eab308] text-[24px]" />
          </div>
        </div>

      </motion.div>
    </>
  );
}
