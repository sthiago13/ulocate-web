import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ModalConfirmacion({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo, 
  mensaje, 
  textoConfirmar = "Confirmar", 
  textoCancelar = "Cancelar",
  colorConfirmar = "bg-[#cd1e1e] hover:bg-red-800" // Rojo por defecto (acciones destructivas)
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
          />
          
          {/* Contenedor del Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] p-6 w-full max-w-[400px] shadow-xl pointer-events-auto flex flex-col gap-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby="modal-desc"
            >
               <h3 id="modal-title" className="font-['Plus_Jakarta_Sans'] font-bold text-[20px] text-gray-900">
                {titulo}
              </h3>
               <p id="modal-desc" className="font-['Plus_Jakarta_Sans'] text-[15px] text-gray-600">
                {mensaje}
              </p>
              
              {/* Botones */}
              <div className="flex justify-end gap-3 mt-4">
                {textoCancelar && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg font-['Plus_Jakarta_Sans'] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label={textoCancelar}
                  >
                    {textoCancelar}
                  </button>
                )}
                <button
                  onClick={onConfirm}
                  className={`px-4 py-2 rounded-lg font-['Plus_Jakarta_Sans'] font-medium text-white transition-colors flex items-center justify-center min-w-[100px] ${colorConfirmar}`}
                  aria-label={textoConfirmar}
                >
                  {textoConfirmar}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}