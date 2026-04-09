import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdSave, MdCloudUpload, MdImage, MdDelete, MdCrop } from 'react-icons/md';
import { supabase } from '../../lib/supabaseClient';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import Button from '../common/Button';
import ModalConfirmacion from '../common/ModalConfirmacion';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

function ToggleButton({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center shrink-0 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

export default function EditorLugar({ isOpen, onClose, onSuccess, lugarToEdit }) {
  // isEditing solo es true si hay una ubicación existente con ID real de Supabase
  const isEditing = !!lugarToEdit?.ID_Ubicacion;
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
  const [loadingText, setLoadingText] = useState("Guardando...");

  // Gestor de Imágenes
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [nuevasImagenes, setNuevasImagenes] = useState([]); // [{ blob, previewUrl }]
  const [imageSrc, setImageSrc] = useState(null); // Imagen temporal para el cropper
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [deleteImageConf, setDeleteImageConf] = useState({ isOpen: false, idReferencia: null, isPendingPreview: false, pendingIndex: -1 });

  useEffect(() => {
    if (isOpen) {
      fetchSelectOptions();
    } else {
      // Clear forms
      setFormData(initialForm);
      setImagenesExistentes([]);
      setNuevasImagenes([]);
      resetImageState();
      setDeleteImageConf({ isOpen: false, idReferencia: null, isPendingPreview: false, pendingIndex: -1 });
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
      // Solo cargar imágenes si es una edición real (tiene ID_Ubicacion)
      if (lugarToEdit.ID_Ubicacion) {
        fetchImagenesExtra();
      }
    } else if (!lugarToEdit && isOpen && categorias.length > 0) {
      setFormData(prev => ({ 
        ...initialForm, 
        idCategoria: categorias[0].ID_Categoria.toString() 
      }));
    }
  }, [lugarToEdit, isOpen, categorias]);

  const fetchImagenesExtra = async () => {
    const { data } = await supabase
      .from('Referencias_Visuales')
      .select('*')
      .eq('ID_Ubicacion', lugarToEdit.ID_Ubicacion);
    if (data) {
      setImagenesExistentes(data);
    }
  };

  const resetImageState = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const fetchSelectOptions = async () => {
    try {
      const [{ data: cats }, { data: zons }] = await Promise.all([
        supabase.from('Categoria').select('ID_Categoria, Nombre_Categoria'),
        supabase.from('Zona').select('ID_Zona, Nombre_Zona')
      ]);
      
      if (cats) setCategorias(cats);
      if (zons) setZonas(zons);

      if (cats?.length > 0 && !lugarToEdit && !formData.idCategoria) {
        setFormData(prev => ({ ...prev, idCategoria: cats[0].ID_Categoria.toString() }));
      }
    } catch (err) {
      console.error("Error options:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ----- Logica de Imagen / Cropper -----
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCreateCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      // Creamos un Local URL para preview
      const previewUrl = URL.createObjectURL(croppedBlob);
      setNuevasImagenes(prev => [...prev, { blob: croppedBlob, previewUrl }]);
      setImageSrc(null); // Cierra el modal de corte
      // Limpiar input file para permitir seleccionar la misma imagen
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";
    } catch (e) {
      console.error(e);
      alert("Error al recortar la imagen");
    }
  };

  const handlePromptDeleteExisting = (idReferencia) => {
    setDeleteImageConf({ isOpen: true, idReferencia, isPendingPreview: false, pendingIndex: -1 });
  };

  const handlePromptDeletePending = (index) => {
    setDeleteImageConf({ isOpen: true, idReferencia: null, isPendingPreview: true, pendingIndex: index });
  };

  const executeDeleteImage = async () => {
    if (deleteImageConf.isPendingPreview) {
       // Just remove from array
       setNuevasImagenes(prev => prev.filter((_, i) => i !== deleteImageConf.pendingIndex));
       setDeleteImageConf({ isOpen: false, idReferencia: null, isPendingPreview: false, pendingIndex: -1 });
    } else {
       // DB delete
       const { error } = await supabase.from('Referencias_Visuales').delete().eq('ID_Referencia', deleteImageConf.idReferencia);
       if (!error) {
          setImagenesExistentes(prev => prev.filter(i => i.ID_Referencia !== deleteImageConf.idReferencia));
       }
       setDeleteImageConf({ isOpen: false, idReferencia: null, isPendingPreview: false, pendingIndex: -1 });
    }
  };

  // ----- Logica de Submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setModalFeedback({ 
        isOpen: true,  titulo: 'Error', mensaje: 'El nombre de la ubicación es obligatorio.', color: 'bg-red-600 hover:bg-red-700' 
      });
      return;
    }

    if (!formData.idCategoria || !formData.idNodo) {
      setModalFeedback({ 
        isOpen: true, titulo: 'Faltan Datos', mensaje: 'Debes seleccionar una Categoría y asignar el ID del Nodo.', color: 'bg-red-600 hover:bg-red-700' 
      });
      return;
    }

    setIsSaving(true);
    setLoadingText("Guardando ubicación...");

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

      let currentUbicacionId = null;

      // 1. Manejo Ubicacion
      if (isEditing) {
        currentUbicacionId = lugarToEdit.ID_Ubicacion;
        const res = await supabase.from('Ubicacion').update(payload).eq('ID_Ubicacion', currentUbicacionId);
        if (res.error) throw res.error;
      } else {
        const res = await supabase.from('Ubicacion').insert(payload).select().single();
        if (res.error) throw res.error;
        currentUbicacionId = res.data.ID_Ubicacion;
      }

      // 2. Manejo Subida de Nuevas Imágenes (Si Existen)
      if (nuevasImagenes.length > 0) {
        setLoadingText("Subiendo imágenes...");
        
        for (let i = 0; i < nuevasImagenes.length; i++) {
          const nuevaImg = nuevasImagenes[i];
          const fileName = `${Date.now()}_${i}.jpg`;
          
          // Subir a Storage
          const uploadRes = await supabase.storage
            .from('ubicaciones_imagenes')
            .upload(fileName, nuevaImg.blob, { contentType: 'image/jpeg' });
            
          if (uploadRes.error) {
             throw new Error("Error subiendo fotografía al Storage: " + uploadRes.error.message);
          }

          // Obtener URL
          const { data: publicData } = supabase.storage
            .from('ubicaciones_imagenes')
            .getPublicUrl(fileName);

          // Insertar a Referencias_Visuales
          const refRes = await supabase.from('Referencias_Visuales').insert({
            ID_Ubicacion: currentUbicacionId,
            URL_Imagen: publicData.publicUrl
          });

          if (refRes.error) {
             throw new Error("Error en base de datos al asegurar referencia gráfica.");
          }
        }
      }

      setModalFeedback({ 
        isOpen: true, 
        titulo: isEditing ? 'Ubicación Actualizada' : 'Ubicación Creada', 
        mensaje: isEditing ? 'Los cambios se han guardado con éxito.' : 'La nueva ubicación y sus fotos se registraron.', 
        color: 'bg-blue-600 hover:bg-blue-700' 
      });
      
    } catch (err) {
      console.error(err);
      setModalFeedback({ 
        isOpen: true, 
        titulo: 'Error de Guardado', 
        mensaje: err.message || 'Error desconocido.', 
        color: 'bg-red-600 hover:bg-red-700' 
      });
    } finally {
      setIsSaving(false);
      setLoadingText("Guardando...");
    }
  };

  const handleCloseFeedback = () => {
    const theTitle = modalFeedback.titulo;
    setModalFeedback(prev => ({ ...prev, isOpen: false }));
    if (theTitle === 'Ubicación Creada' || theTitle === 'Ubicación Actualizada') {
      if (onSuccess) onSuccess();
      else onClose();
    }
  };

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
            className="fixed top-0 bottom-0 right-0 w-full sm:w-[500px] overflow-hidden bg-[#f9fafb] flex flex-col rounded-none sm:rounded-l-[30px] z-[80] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full px-[30px] py-[25px] border-b border-gray-100 bg-white shrink-0">
              <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                <span className="font-bold text-[24px] text-[#101828] leading-[30px]">
                  {isEditing ? 'Editar Lugar' : 'Añadir Lugar'}
                </span>
                <span className="text-[#667085] text-[14px]">
                  {isEditing ? 'Actualiza los datos de la base de datos' : 'Registra una ubicación en el sistema'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="bg-[#f0f0f0] hover:bg-gray-300 w-[40px] h-[40px] rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <MdClose className="text-gray-700 text-[24px]" />
              </button>
            </div>

            {/* Contenido Formulario */}
            <div className="flex-1 overflow-y-auto px-[30px] py-[20px] custom-scrollbar">
              <form id="editor-lugar-form" onSubmit={handleSubmit} className="flex flex-col gap-[20px] font-['Plus_Jakarta_Sans']">
                
                <h3 className="font-bold text-[18px] text-[#101828]">Imágenes y Referencias (16:9)</h3>
                
                {/* Zona de Galería de Imágenes */}
                <div className="flex flex-col gap-3">
                  {(imagenesExistentes.length > 0 || nuevasImagenes.length > 0) && (
                    <div className="flex flex-col gap-2">
                       <span className="text-[13px] text-gray-500 font-semibold mb-[-4px]">Fotografías de lugar:</span>
                       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
                         {/* Imágenes existentes en BD */}
                         {imagenesExistentes.map(img => (
                           <div key={img.ID_Referencia} className="relative w-[120px] h-[67px] shrink-0 rounded-[8px] overflow-hidden group shadow-sm border border-gray-200">
                              <img src={img.URL_Imagen} alt="Location" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handlePromptDeleteExisting(img.ID_Referencia)}
                                className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Borrar foto de Supabase"
                              >
                                <MdDelete className="text-[14px]" />
                              </button>
                           </div>
                         ))}
                         
                         {/* Nuevas imágenes pendientes */}
                         {nuevasImagenes.map((img, idx) => (
                           <div key={`new-${idx}`} className="relative w-[120px] h-[67px] shrink-0 rounded-[8px] overflow-hidden group shadow-md border-2 border-emerald-400">
                              <img src={img.previewUrl} alt="Pending Upload" className="w-full h-full object-cover" />
                              <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/90 text-white text-[10px] font-bold text-center py-0.5">
                                NUEVA
                              </div>
                              <button
                                type="button"
                                onClick={() => handlePromptDeletePending(idx)}
                                className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Descartar esta foto"
                              >
                                <MdDelete className="text-[14px]" />
                              </button>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}

                  {/* Dropzone para nuevas fotos */}
                  <div className="relative w-full h-[120px] bg-white border-2 border-dashed border-gray-300 rounded-[16px] hover:border-[#155dfc] transition-colors flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group">
                    <MdCloudUpload className="text-[30px] text-gray-400 group-hover:text-[#155dfc] mb-1" />
                    <span className="text-[13px] font-semibold text-gray-700">Añadir una fotografía</span>
                    <span className="text-[11px] text-gray-400">Selecciona o arrastra una imagen</span>
                    <input 
                       id="file-upload"
                       type="file" 
                       accept="image/*" 
                       onChange={onFileChange} 
                       className="absolute inset-0 opacity-0 cursor-pointer"
                       disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gray-200 my-2"></div>

                <h3 className="font-bold text-[18px] text-[#101828]">Información General</h3>
                
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
                  placeholder="Una breve descripción..."
                  multiline={true}
                />

                <h3 className="font-bold text-[18px] text-[#101828] mt-2">Detalles Técnicos y Extras</h3>

                <div className="flex bg-white items-center justify-between p-4 rounded-[12px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-col pr-4">
                    <span className="font-bold text-[15px] text-gray-800">Acceso Público</span>
                    <span className="text-[13px] text-gray-500 mt-1">¿El público general puede ingresar a esta ubicación de forma ilimitada?</span>
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
                  placeholder="Información extra relevante (ej. Horarios, servicios, etc.)..."
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

            {/* Footer Fijo */}
            <div className="w-full px-[30px] flex justify-between gap-4 pb-8 pt-[25px] border-t border-gray-100 bg-white shrink-0">
              <button 
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="bg-[#e9e9e9] hover:bg-gray-300 text-gray-700 transition-colors w-full rounded-[13px] py-[10px] flex justify-center items-center h-[50px] font-medium"
              >
                <span className="font-['Inter'] text-[20px]">
                  Cancelar
                </span>
              </button>
              <button 
                type="submit"
                form="editor-lugar-form"
                disabled={isSaving}
                className="bg-[#155dfc] hover:bg-blue-700 disabled:opacity-50 transition-colors w-full rounded-[13px] py-[10px] flex justify-center items-center h-[50px] gap-2"
              >
                <MdSave className="text-white text-[24px]" />
                <span className="text-[#f9f9f9] font-['Inter'] font-normal text-[20px]">
                  {isSaving ? loadingText : "Guardar"}
                </span>
              </button>
            </div>
          </motion.div>

          {/* Modal de Crop (Se sobrepone al Drawer) */}
          <AnimatePresence>
            {imageSrc && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-[100] flex flex-col"
              >
                <div className="flex justify-between items-center p-4 bg-black/50 text-white z-10 shrink-0">
                  <h3 className="font-bold text-lg font-['Plus_Jakarta_Sans']">Ajustar Recorte (16:9)</h3>
                  <button onClick={() => setImageSrc(null)} className="p-2 hover:bg-white/20 rounded-full transition"><MdClose className="text-[24px]" /></button>
                </div>
                <div className="relative flex-1 w-full bg-[#111]">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 9}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="p-6 bg-black flex justify-center shrink-0">
                   <button 
                     type="button"
                     onClick={handleCreateCrop}
                     className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transform transition hover:scale-105"
                   >
                     <MdCrop className="text-[20px]" /> Aplicar Recorte
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Delete Foto Confirmation */}
          <ModalConfirmacion
            isOpen={deleteImageConf.isOpen}
            onClose={() => setDeleteImageConf({ isOpen: false, idReferencia: null, isPendingPreview: false, pendingIndex: -1 })}
            onConfirm={executeDeleteImage}
            titulo={deleteImageConf.isPendingPreview ? "Descartar Fotografía" : "Eliminar Fotografìa del Servidor"}
            mensaje={deleteImageConf.isPendingPreview 
              ? "¿Quieres deshacerte de este recorte antes de subirlo al servidor de U-Locate?"
              : "Esta acción borrará de forma permanente esta imagen de la Base de Datos ¿Estás seguro de ejecutarla?"}
            textoConfirmar={deleteImageConf.isPendingPreview ? "Descartar" : "Eliminar"}
            textoCancelar="Mantener"
            colorConfirmar="bg-red-600 hover:bg-red-700"
          />

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
