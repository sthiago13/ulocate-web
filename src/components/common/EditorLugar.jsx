import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import ModalConfirmacion from './ModalConfirmacion';

export default function EditorLugar({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    icono: '',
    nombre: '',
    categoria: '',
    fotografiaUrl: '',
    horario: '',
    descripcion: '',
    detallesAdicionales: '',
    id_nodo: ''
  });

  const [modalFeedback, setModalFeedback] = useState({ isOpen: false, titulo: '', mensaje: '', color: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setModalFeedback({ 
        isOpen: true, 
        titulo: 'Error', 
        mensaje: 'El nombre del lugar es obligatorio.', 
        color: 'bg-[#cd1e1e] hover:bg-red-800' 
      });
      return;
    }
    
    // Simular guardado real en localStorage
    try {
       const saved = JSON.parse(localStorage.getItem('unet_ubicaciones') || '[]');
       saved.push({
          ID_Ubicacion: Date.now(),
          Nombre: formData.nombre,
          Descripcion: formData.descripcion,
          Detalles_Extras: formData.detallesAdicionales,
          URL_Imagen: formData.fotografiaUrl || 'https://via.placeholder.com/1200x800',
          ID_Categoria: 1, // mock
          ID_Zona: 1, // mock
          ID_Nodo: formData.id_nodo,
       });
       localStorage.setItem('unet_ubicaciones', JSON.stringify(saved));
    } catch (e) {
      console.log(e);
    }

    setModalFeedback({ 
      isOpen: true, 
      titulo: 'Éxito', 
      mensaje: 'Los detalles del lugar se han guardado correctamente y ya aparecerá en el Mapa.', 
      color: 'bg-[#155dfc] hover:bg-blue-700' 
    });
  };

  const handleCloseFeedback = () => {
    setModalFeedback(prev => ({ ...prev, isOpen: false }));
    if (modalFeedback.titulo === 'Éxito') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay: No tiene onClick={onClose} como pediste, solo se cierra con la X */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-70 transition-opacity"
          />

          {/* Drawer (Panel derecho) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[456px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-none sm:rounded-l-[30px] z-80 shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
          >
            {/* Header del Drawer */}
            <div className="flex items-center justify-between w-full mb-[30px] shrink-0">
              <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                <span className="font-bold text-[24px] text-[#101828] leading-[30px]">Editor del Lugar</span>
                <span className="text-[#667085] text-[14px]">Modifica los detalles del sitio</span>
              </div>
              <button
                onClick={onClose}
                className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <MdClose className="text-gray-700 text-[24px]" />
              </button>
            </div>

            {/* Contenido (scrollable automáticamente por el contenedor) */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-[20px] font-['Plus_Jakarta_Sans'] pb-[20px]">
              
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium text-[#344054]">Icono (Emoji)</label>
                <input
                  type="text"
                  name="icono"
                  value={formData.icono}
                  onChange={handleChange}
                  placeholder="Ej: 📚, ☕, 🏛️"
                  className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                />
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium text-[#344054]">Nombre del lugar <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Biblioteca Central"
                  className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                />
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium text-[#344054]">Categoría General</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                >
                  <option value="">Selecciona una categoría...</option>
                  <option value="estudios">Áreas de Estudios</option>
                  <option value="comida">Áreas de Comida</option>
                  <option value="recreacion">Recreación</option>
                  <option value="tramites">Trámites</option>
                </select>
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium text-[#344054]">Fotografía (URL)</label>
                <input
                  type="url"
                  name="fotografiaUrl"
                  value={formData.fotografiaUrl}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                />
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium text-[#344054]">Horario de atención</label>
                <input
                  type="text"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  placeholder="Ej: Lun - Vie: 08:00 a 17:00"
                  className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                />
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium text-[#344054]">Descripción Breve</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Descripción corta del lugar..."
                  className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc] resize-none"
                />
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium text-[#344054]">Detalles Adicionales</label>
                <textarea
                  name="detallesAdicionales"
                  value={formData.detallesAdicionales}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Información extra relevante..."
                  className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc] resize-none"
                />
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium text-[#344054]">Vincular a un Nodo Físico</label>
                <select
                  name="id_nodo"
                  value={formData.id_nodo}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                >
                  <option value="">(No conectar a la calle todavía)</option>
                  {(() => {
                    try {
                      const savedNodes = JSON.parse(localStorage.getItem('unet_graph_nodes') || '[]');
                      return savedNodes.map((n, i) => (
                         <option key={n.id} value={n.id}>Nodo #{n.id.slice(-4)} (Lat: {n.lat.toFixed(4)})</option>
                      ));
                    } catch (e) { return null; }
                  })()}
                </select>
                <span className="text-[12px] text-gray-500 mt-1">Este nodo será el punto de llegada exacto cuando quelquien trace una ruta a este lugar.</span>
              </div>

              {/* Botón de Guardar en la parte inferior */}
              <button 
                type="submit"
                className="mt-4 bg-[#155dfc] hover:bg-blue-700 transition-colors w-full rounded-[12px] py-[14px] flex justify-center items-center"
              >
                <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                  Guardar Cambios
                </span>
              </button>

            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
