import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModalFormulario({
  isOpen,
  onClose,
  onSubmit,
  titulo,
  subtitulo,
  textoConfirmar = "Guardar",
  textoCancelar = "Cancelar",
  children
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-jakarta">
          
          {/* Fondo oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Contenedor del Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-full max-w-[400px] pointer-events-auto overflow-hidden flex flex-col"
            >
              
              <div className="px-6 pt-6 pb-2">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-1">{titulo}</h3>
                {subtitulo && (
                  <p className="text-sm font-sans text-gray-500 text-center leading-relaxed">
                    {subtitulo}
                  </p>
                )}
              </div>

              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  if(onSubmit) onSubmit(); 
                }} 
                className="flex flex-col w-full"
              >
                <div className="px-6 py-4 flex flex-col gap-4">
                  {children}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                  {textoCancelar && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      {textoCancelar}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    {textoConfirmar}
                  </button>
                </div>
              </form>

            </motion.div>
          </div>

        </div>
      )}
    </AnimatePresence>
  );
}
