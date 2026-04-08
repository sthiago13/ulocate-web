import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { supabase } from '../../lib/supabaseClient';
import InputField from './InputField';
import SelectField from './SelectField';
import Button from './Button';
import ModalConfirmacion from './ModalConfirmacion';

function ToggleButton({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

export default function EditorLugar({ isOpen, onClose, onSuccess, lugarToEdit }) {
  const isEditing = !!lugarToEdit;
  const initialForm = {
    nombre: '',
    descripcion: '',
    detallesAdicionales: '',
    accesoPublico: 'true',
    idCategoria: '',
    idZona: '',
    idNodo: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [categorias, setCategorias] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [modalFeedback, setModalFeedback] = useState({ isOpen: false, titulo: '', mensaje: '', color: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSelectOptions();
    } else {
      // Clear form when closed
      setFormData(initialForm);
    }
  }, [isOpen]);

  useEffect(() => {
    if (lugarToEdit && isOpen) {
      setFormData({
        nombre: lugarToEdit.Nombre || '',
        descripcion: lugarToEdit.Descripcion || '',
        detallesAdicionales: lugarToEdit.Detalles_Extras || '',
        accesoPublico: lugarToEdit.Acceso_Publico === false ? 'false' : 'true',
        idCategoria: lugarToEdit.ID_Categoria?.toString() || '',
        idZona: lugarToEdit.ID_Zona?.toString() || '',
        idNodo: lugarToEdit.ID_Nodo?.toString() || ''
      });
    } else if (!lugarToEdit && isOpen && categorias.length > 0) {
      // It's a new place, reset but keep first category
      setFormData(prev => ({ 
        ...initialForm, 
        idCategoria: categorias[0].ID_Categoria.toString() 
      }));
    }
  }, [lugarToEdit, isOpen, categorias]);

  const fetchSelectOptions = async () => {
    try {
      const [{ data: cats }, { data: zons }] = await Promise.all([
        supabase.from('Categoria').select('ID_Categoria, Nombre_Categoria'),
        supabase.from('Zona').select('ID_Zona, Nombre_Zona')
      ]);
      
      if (cats) setCategorias(cats);
      if (zons) setZonas(zons);

      // Si es un lugar nuevo y aún no hay categoría elegida, pre-seleccionamos la primera
      if (cats?.length > 0 && !lugarToEdit && !formData.idCategoria) {
        setFormData(prev => ({ ...prev, idCategoria: cats[0].ID_Categoria.toString() }));
      }
    } catch (err) {
      console.error("Error fetching options:", err);
    }
  };

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
        mensaje: 'El nombre de la ubicación es obligatorio.', 
        color: 'bg-red-600 hover:bg-red-700' 
      });
      return;
    }

    if (!formData.idCategoria || !formData.idNodo) {
      setModalFeedback({ 
        isOpen: true, 
        titulo: 'Faltan Datos', 
        mensaje: 'Debes seleccionar una Categoría y asignar el ID del Nodo.', 
        color: 'bg-red-600 hover:bg-red-700' 
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        Nombre: formData.nombre,
        Descripcion: formData.descripcion || null,
        Detalles_Extras: formData.detallesAdicionales || null,
        Acceso_Publico: formData.accesoPublico === 'true',
        ID_Categoria: parseInt(formData.idCategoria),
        ID_Zona: formData.idZona ? parseInt(formData.idZona) : null,
        ID_Nodo: parseInt(formData.idNodo)
      };

      let error;
      if (isEditing) {
        const res = await supabase.from('Ubicacion').update(payload).eq('ID_Ubicacion', lugarToEdit.ID_Ubicacion);
        error = res.error;
      } else {
        const res = await supabase.from('Ubicacion').insert(payload);
        error = res.error;
      }

      if (error) throw error;

      setModalFeedback({ 
        isOpen: true, 
        titulo: isEditing ? 'Ubicación Actualizada' : 'Ubicación Creada', 
        mensaje: isEditing ? 'Los cambios se han guardado con éxito.' : 'La nueva ubicación se ha registrado en la base de datos.', 
        color: 'bg-blue-600 hover:bg-blue-700' 
      });
      
    } catch (err) {
      console.error(err);
      setModalFeedback({ 
        isOpen: true, 
        titulo: 'Error de Guardado', 
        mensaje: 'Hubo un error al intentar guardar la ubicación. Detalle: ' + err.message, 
        color: 'bg-red-600 hover:bg-red-700' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseFeedback = () => {
    const theTitle = modalFeedback.titulo;
    setModalFeedback(prev => ({ ...prev, isOpen: false }));
    if (theTitle === 'Ubicación Creada' || theTitle === 'Ubicación Actualizada') {
      if (onSuccess) onSuccess();
      else onClose(); // Fallback si no hay onSuccess
    }
  };

  // Convert for SelectField
  const catOptions = [
    { value: '', label: 'Seleccionar Categoría...' },
    ...categorias.map(c => ({ value: c.ID_Categoria.toString(), label: c.Nombre_Categoria }))
  ];
  
  const zonOptions = [
    { value: '', label: 'Ninguna Zona' },
    ...zonas.map(z => ({ value: z.ID_Zona.toString(), label: z.Nombre_Zona }))
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[70] transition-opacity"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 right-0 w-full sm:w-[500px] overflow-hidden bg-white flex flex-col rounded-none sm:rounded-l-[30px] z-[80] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
          >
            {/* Header Estático */}
            <div className="flex items-center justify-between w-full px-[30px] py-[25px] border-b border-gray-100 shrink-0">
              <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                <span className="font-bold text-[24px] text-[#101828] leading-[30px]">
                  {isEditing ? 'Editar Lugar' : 'Añadir Lugar'}
                </span>
                <span className="text-[#667085] text-[14px]">
                  {isEditing ? 'Actualiza los datos en la base de datos' : 'Registra una ubicación en la base de datos'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 w-[40px] h-[40px] rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <MdClose className="text-gray-700 text-[24px]" />
              </button>
            </div>

            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto px-[30px] py-[20px]">
              <form id="editor-lugar-form" onSubmit={handleSubmit} className="flex flex-col gap-[20px] font-['Plus_Jakarta_Sans']">
                
                <h3 className="font-bold text-[18px] text-[#101828]">Infomación General</h3>
                
                <InputField 
                  label="Nombre de Ubicación *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Biblioteca Central o D1-21"
                />

                <SelectField 
                  label="Categoría Principal *"
                  name="idCategoria"
                  value={formData.idCategoria}
                  onChange={handleChange}
                  options={catOptions}
                />

                <SelectField 
                  label="Zona del Campus (Opcional)"
                  name="idZona"
                  value={formData.idZona}
                  onChange={handleChange}
                  options={zonOptions}
                />

                <InputField 
                  label="Descripción de la Ubicación"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Una breve reseña..."
                  multiline={true}
                />

                <h3 className="font-bold text-[18px] text-[#101828] mt-2">Detalles Técnicos y Extras</h3>

                <div className="flex bg-white items-center justify-between p-4 rounded-[12px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-col">
                    <span className="font-bold text-[15px] text-gray-800">Acceso Público</span>
                    <span className="text-[13px] text-gray-500 mt-1">¿El público general puede ingresar a esta ubicación?</span>
                  </div>
                  <ToggleButton 
                    checked={formData.accesoPublico === 'true'}
                    onChange={() => setFormData(prev => ({ ...prev, accesoPublico: prev.accesoPublico === 'true' ? 'false' : 'true' }))}
                  />
                </div>

                <InputField 
                  label="Detalles Adicionales"
                  name="detallesAdicionales"
                  value={formData.detallesAdicionales}
                  onChange={handleChange}
                  placeholder="Información extra relevante..."
                  multiline={true}
                />
                
                <InputField 
                  label="ID de Nodo Asignado en el Mapa *"
                  name="idNodo"
                  type="number"
                  value={formData.idNodo}
                  onChange={handleChange}
                  placeholder="Ej: 1"
                />

              </form>
            </div>

            {/* Footer Estático con Botones Guardar y Cancelar */}
            <div className="w-full px-[30px] py-[25px] border-t border-gray-100 bg-white shrink-0 flex gap-4">
              <Button 
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                form="editor-lugar-form"
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>

          </motion.div>

          {/* Modal de Feedback */}
          <ModalConfirmacion
            isOpen={modalFeedback.isOpen}
            onClose={handleCloseFeedback}
            onConfirm={handleCloseFeedback}
            titulo={modalFeedback.titulo}
            mensaje={modalFeedback.mensaje}
            textoConfirmar="Entendido"
            textoCancelar={null}
            colorConfirmar={modalFeedback.color}
          />
        </>
      )}
    </AnimatePresence>
  );
}
