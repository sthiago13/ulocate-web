import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import ModalConfirmacion from './ModalConfirmacion';
import { supabase } from '../../lib/supabaseClient';

export default function EditorLugar({ isOpen, onClose, lugar, onSaved }) {
  const [formData, setFormData] = useState({
    icono: '',
    nombre: '',
    categoria: '',
    zona: '',
    nodo: '',
    fotografiaUrl: '',
    horario: '',
    descripcion: '',
    detallesAdicionales: ''
  });

  const [metadata, setMetadata] = useState({ categorias: [], zonas: [], nodos: [] });

  React.useEffect(() => {
    if (isOpen) {
      // Fetch dynamic data for selects
      Promise.all([
        supabase.from('Categoria').select('*'),
        supabase.from('Zona').select('*'),
        supabase.from('Nodo').select('ID_Nodo')
      ]).then(([catRes, zonRes, nodRes]) => {
        setMetadata({
          categorias: catRes.data || [],
          zonas: zonRes.data || [],
          nodos: nodRes.data || []
        });
      });

      if (lugar && lugar.ID_Ubicacion) {
        setFormData({
          icono: '', // Currently unused in Supabase?
          nombre: lugar.Nombre || '',
          categoria: lugar.ID_Categoria?.toString() || '',
          zona: lugar.ID_Zona?.toString() || '',
          nodo: lugar.ID_Nodo?.toString() || '',
          fotografiaUrl: lugar.Referencias_Visuales?.[0]?.URL_Imagen || '',
          horario: '',
          descripcion: lugar.Descripcion || '',
          detallesAdicionales: lugar.Detalles_Extras || ''
        });
        
        // Fetch specific image if available
        supabase.from('Referencias_Visuales').select('URL_Imagen').eq('ID_Ubicacion', lugar.ID_Ubicacion)
          .then(res => { if(res.data && res.data.length > 0) setFormData(p => ({ ...p, fotografiaUrl: res.data[0].URL_Imagen })); });
      } else {
        setFormData({
          icono: '', nombre: '', categoria: '', zona: '', nodo: '', fotografiaUrl: '', horario: '', descripcion: '', detallesAdicionales: ''
        });
      }
    }
  }, [isOpen, lugar]);

  const [modalFeedback, setModalFeedback] = useState({ isOpen: false, titulo: '', mensaje: '', color: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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

    const unetExtras = formData.horario ? `Horario: ${formData.horario}\n${formData.detallesAdicionales}` : formData.detallesAdicionales;
    
    const payload = {
      Nombre: formData.nombre,
      Descripcion: formData.descripcion,
      Detalles_Extras: unetExtras,
      ID_Categoria: formData.categoria ? parseInt(formData.categoria) : null,
      ID_Zona: formData.zona ? parseInt(formData.zona) : null,
      ID_Nodo: formData.nodo ? formData.nodo : null // UUID
    };

    let ubiId = null;
    let err = null;

    if (lugar && lugar.ID_Ubicacion) {
      const { data, error } = await supabase.from('Ubicacion').update(payload).eq('ID_Ubicacion', lugar.ID_Ubicacion).select().single();
      err = error;
      if (data) ubiId = data.ID_Ubicacion;
    } else {
      const { data, error } = await supabase.from('Ubicacion').insert(payload).select().single();
      err = error;
      if (data) ubiId = data.ID_Ubicacion;
    }

    if (err) {
      setModalFeedback({ isOpen: true, titulo: 'Error', mensaje: err.message, color: 'bg-red-600' });
      return;
    }

    if (formData.fotografiaUrl && ubiId) {
      await supabase.from('Referencias_Visuales').delete().eq('ID_Ubicacion', ubiId);
      await supabase.from('Referencias_Visuales').insert({ ID_Ubicacion: ubiId, URL_Imagen: formData.fotografiaUrl });
    }
    
    setModalFeedback({ 
      isOpen: true, 
      titulo: 'Éxito', 
      mensaje: 'Los detalles del lugar se han guardado correctamente.', 
      color: 'bg-[#155dfc] hover:bg-blue-700' 
    });
    
    if (onSaved) onSaved();
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
            className="fixed inset-0 bg-black/40 z-[70] transition-opacity"
          />

          {/* Drawer (Panel derecho) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[456px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-none sm:rounded-l-[30px] z-[80] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
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
                  {metadata.categorias.map(c => (
                    <option key={c.ID_Categoria} value={c.ID_Categoria}>{c.Nombre_Categoria}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium text-[#344054]">Zona (Facultad, Área)</label>
                <select
                  name="zona"
                  value={formData.zona}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                >
                  <option value="">Selecciona zona...</option>
                  {metadata.zonas.map(z => (
                    <option key={z.ID_Zona} value={z.ID_Zona}>{z.Nombre_Zona}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium text-[#344054]">Punto en el Mapa (Nodo) <span className="text-red-500">*</span></label>
                <select
                  name="nodo"
                  value={formData.nodo}
                  onChange={handleChange}
                  required
                  title="Es requerido ligar un edificio a un nodo para la navegación de las rutas GPS."
                  className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                >
                  <option value="">Selecciona ID de nodo del mapa...</option>
                  {metadata.nodos.map(n => (
                    <option key={n.ID_Nodo} value={n.ID_Nodo}>Nodo_ID: {n.ID_Nodo.toString().slice(0, 8)}</option>
                  ))}
                </select>
                <p className="text-[12px] text-gray-500 mt-[-5px]">Si no ves un nodo para el lugar, debes trazar un nodo nuevo en Trazar Rutas primero.</p>
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
