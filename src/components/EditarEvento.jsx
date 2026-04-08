import React, { useState, useEffect } from 'react';
import { MdClose, MdEdit, MdSave } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import InputField from './common/InputField';
import Button from './common/Button';

export default function EditarEvento({ isOpen, onClose, evento, onSave }) {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (evento && isOpen) {
      setNombre(evento.Nombre || '');
      // Format datetime string for input type="datetime-local" if possible
      let localFecha = '';
      if (evento.Fecha) {
        try {
          const d = new Date(evento.Fecha);
          // Format: YYYY-MM-DDThh:mm
          const tzoffset = (new Date()).getTimezoneOffset() * 60000; // local offset
          localFecha = (new Date(d - tzoffset)).toISOString().slice(0, 16);
        } catch(e) {}
      }
      setFecha(localFecha);
      setUbicacion(evento.Ubicacion || '');
      setDescripcion(evento.Descripcion || '');
    }
  }, [evento, isOpen]);

  const handleSave = () => {
    // Validar y enviar
    const updatedEvent = {
      ...evento,
      Nombre: nombre,
      Fecha: fecha ? new Date(fecha).toISOString() : null, // Simplistic conversion back
      Ubicacion: ubicacion,
      Descripcion: descripcion,
    };
    if (onSave) onSave(updatedEvent);
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
                <div className="bg-purple-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                  <MdEdit className="text-purple-600 text-[28px]" />
                </div>
                <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                  <span className="font-bold text-[#101828] text-[20px] leading-[26px] truncate max-w-[200px]">
                    {evento?.Nombre || 'Evento'}
                  </span>
                  <span className="font-semibold text-purple-600 text-[14px]">Editando evento</span>
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
              {/* Nombre Evento */}
              <InputField
                label="Nombre del Evento"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Feria de Innovación"
              />

              {/* Fecha y Hora */}
              <InputField
                label="Fecha y Hora"
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />

              {/* Lugar / Ubicación */}
              <InputField
                label="Lugar o Ubicación"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej. Auditorio Principal"
              />

              {/* Descripción */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[14px] font-medium text-gray-700">Breve Descripción</label>
                  <span className="text-[12px] text-gray-400">{descripcion.length}/150</span>
                </div>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  maxLength={150}
                  className="w-full bg-[#f9f9f9] border border-gray-200 rounded-[12px] px-4 py-3 text-[#101828] focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors resize-none h-[80px]"
                  placeholder="Detalles sobre de qué trata el evento..."
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-[30px]">
              <Button onClick={handleSave} className="!text-[16px] !font-semibold !h-[55px] font-['Plus_Jakarta_Sans'] bg-[#101828] hover:bg-black border-none text-white shadow-lg flex justify-center items-center gap-2">
                <MdSave className="text-white text-[24px]" />
                Guardar Cambios
              </Button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
