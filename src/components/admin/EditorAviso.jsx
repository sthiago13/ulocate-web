import React, { useState, useEffect, useRef } from 'react';
import { MdClose, MdCampaign, MdEdit, MdSave, MdSend, MdSearch, MdPlace } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import InputField from '../common/InputField';
import Button from '../common/Button';

/**
 * EditorAviso — componente unificado para crear y editar alertas globales.
 * Props:
 *   isOpen        {boolean}  – controla visibilidad del panel
 *   onClose       {fn}       – callback al cerrar sin guardar
 *   onSuccess     {fn}       – callback tras guardar con éxito
 *   alertaToEdit  {object|null} – null = crear, objeto = editar
 */
export default function EditorAviso({ isOpen, onClose, onSuccess, alertaToEdit = null }) {
  const isEditing = !!alertaToEdit;

  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [idUbicacion, setIdUbicacion] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [activa, setActiva] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado del combobox de ubicación
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const [ubicSearch, setUbicSearch] = useState('');
  const [ubicDropdownOpen, setUbicDropdownOpen] = useState(false);
  const ubicRef = useRef(null);

  // Cierre del dropdown al clickar fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ubicRef.current && !ubicRef.current.contains(e.target)) {
        setUbicDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar ubicaciones
  useEffect(() => {
    if (!isOpen) return;
    const fetchUbicaciones = async () => {
      setLoadingUbicaciones(true);
      const { data } = await supabase
        .from('Ubicacion')
        .select('ID_Ubicacion, Nombre, Categoria(Icono, Nombre_Categoria)')
        .order('Nombre', { ascending: true });
      if (data) setUbicaciones(data);
      setLoadingUbicaciones(false);
    };
    fetchUbicaciones();
  }, [isOpen]);

  // Precargar/limpiar campos
  useEffect(() => {
    if (!isOpen) return;
    if (isEditing) {
      setTitulo(alertaToEdit.Titulo || '');
      setMensaje(alertaToEdit.Mensaje || '');
      setIdUbicacion(alertaToEdit.ID_Ubicacion ?? '');
      setActiva(alertaToEdit.Activa ?? true);
      setError('');
      let localFecha = '';
      if (alertaToEdit.Fecha_Expiracion) {
        try {
          const d = new Date(alertaToEdit.Fecha_Expiracion);
          const tzoffset = new Date().getTimezoneOffset() * 60000;
          localFecha = new Date(d - tzoffset).toISOString().slice(0, 16);
        } catch (_) {}
      }
      setFechaExpiracion(localFecha);
    } else {
      setTitulo(''); setMensaje(''); setIdUbicacion('');
      setFechaExpiracion(''); setActiva(true); setError('');
    }
    setUbicSearch('');
  }, [isOpen, alertaToEdit, isEditing]);

  // Ubicación seleccionada y su ícono
  const ubicSeleccionada = ubicaciones.find(u => u.ID_Ubicacion === Number(idUbicacion));
  const UbicIcono = ubicSeleccionada?.Categoria?.Icono
    ? (MdIcons[ubicSeleccionada.Categoria.Icono] || MdPlace)
    : MdPlace;

  // Filtrado del combobox
  const ubicFiltradas = ubicaciones.filter(u =>
    u.Nombre.toLowerCase().includes(ubicSearch.toLowerCase()) ||
    (u.Categoria?.Nombre_Categoria || '').toLowerCase().includes(ubicSearch.toLowerCase())
  );

  const handleUbicSelect = (u) => {
    setIdUbicacion(u ? u.ID_Ubicacion : '');
    setUbicSearch('');
    setUbicDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!titulo.trim() || !mensaje.trim()) {
      setError('El título y el mensaje son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');

    const payload = {
      Titulo: titulo.trim(),
      Mensaje: mensaje.trim(),
      ID_Ubicacion: idUbicacion !== '' ? Number(idUbicacion) : null,
      Fecha_Expiracion: fechaExpiracion ? new Date(fechaExpiracion).toISOString() : null,
      Activa: activa,
    };

    let supaError;
    if (isEditing) {
      const { error } = await supabase
        .from('Alerta_Global')
        .update(payload)
        .eq('ID_Alerta', alertaToEdit.ID_Alerta);
      supaError = error;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('Alerta_Global')
        .insert({ ...payload, ID_Admin_Creador: user?.id ?? null });
      supaError = error;
    }

    setLoading(false);
    if (supaError) {
      setError('Ocurrió un error al guardar. Intenta nuevamente.');
      console.error(supaError);
      return;
    }
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[90] transition-opacity"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-none sm:rounded-l-[30px] z-[100] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-[30px]">
              <div className="flex gap-[15px] items-center">
                <div className="bg-amber-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                  {isEditing
                    ? <MdEdit className="text-amber-600 text-[28px]" />
                    : <MdCampaign className="text-amber-600 text-[28px]" />
                  }
                </div>
                <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                  <span className="font-bold text-[#101828] text-[20px] leading-[26px] truncate max-w-[200px]">
                    {isEditing ? (alertaToEdit?.Titulo || 'Aviso') : 'Nuevo Aviso'}
                  </span>
                  <span className="font-semibold text-amber-600 text-[14px]">
                    {isEditing ? 'Editando aviso' : 'Publicando a todos los usuarios'}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0">
                <MdClose className="text-gray-700 text-[24px]" />
              </button>
            </div>

            {/* Formulario */}
            <div className="flex-1 flex flex-col gap-5 font-['Plus_Jakarta_Sans']">

              <InputField
                label="Título del Aviso"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Mantenimiento del sistema"
                maxLength={100}
              />

              {/* Mensaje */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[14px] font-medium text-gray-700">Mensaje</label>
                  <span className="text-[12px] text-gray-400">{mensaje.length}/500</span>
                </div>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full bg-[#f9f9f9] border border-gray-200 rounded-[12px] px-4 py-3 text-[#101828] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                  placeholder="Describe el aviso para los usuarios..."
                />
              </div>

              {/* Selector de Ubicación con búsqueda */}
              <div className="flex flex-col gap-2" ref={ubicRef}>
                <label className="text-[14px] font-medium text-gray-700">
                  Lugar relacionado <span className="text-gray-400 font-normal">(opcional)</span>
                </label>

                {/* Chip de seleccionado o botón de abrir */}
                {!ubicDropdownOpen ? (
                  <button
                    type="button"
                    onClick={() => setUbicDropdownOpen(true)}
                    className="w-full flex items-center gap-3 bg-[#f9f9f9] border border-gray-200 rounded-[12px] px-4 h-[50px] text-left hover:border-amber-400 transition-colors"
                  >
                    {ubicSeleccionada ? (
                      <>
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <UbicIcono className="text-amber-600 text-[15px]" />
                        </div>
                        <span className="flex-1 text-[14px] text-[#101828] font-medium truncate">
                          {ubicSeleccionada.Nombre}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleUbicSelect(null); }}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0 text-[18px]"
                          title="Quitar ubicación"
                        >
                          <MdClose />
                        </button>
                      </>
                    ) : (
                      <>
                        <MdPlace className="text-gray-400 text-[18px] shrink-0" />
                        <span className="flex-1 text-[14px] text-gray-400">Sin ubicación específica</span>
                        <MdSearch className="text-gray-400 text-[18px] shrink-0" />
                      </>
                    )}
                  </button>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="w-full bg-white border border-amber-300 rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.10)] overflow-hidden"
                    >
                      {/* Input búsqueda */}
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                        <MdSearch className="text-gray-400 text-[18px] shrink-0" />
                        <input
                          autoFocus
                          type="text"
                          value={ubicSearch}
                          onChange={(e) => setUbicSearch(e.target.value)}
                          placeholder="Buscar por nombre o categoría..."
                          className="flex-1 bg-transparent outline-none text-[14px] text-[#101828] placeholder-gray-400"
                        />
                        {ubicSearch && (
                          <button type="button" onClick={() => setUbicSearch('')} className="text-gray-400 hover:text-gray-600">
                            <MdClose className="text-[16px]" />
                          </button>
                        )}
                      </div>

                      {/* Opción sin ubicación */}
                      <div
                        onClick={() => handleUbicSelect(null)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-[13px] ${
                          !idUbicacion ? 'bg-amber-50 text-amber-700 font-bold' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <MdPlace className="text-[16px] shrink-0" />
                        Sin ubicación específica
                      </div>

                      {/* Lista filtrada */}
                      <div className="max-h-[200px] overflow-y-auto">
                        {loadingUbicaciones ? (
                          <div className="px-4 py-3 text-[13px] text-gray-400">Cargando...</div>
                        ) : ubicFiltradas.length === 0 ? (
                          <div className="px-4 py-3 text-[13px] text-gray-400">Sin resultados.</div>
                        ) : (
                          ubicFiltradas.map((u) => {
                            const IconComp = u.Categoria?.Icono && MdIcons[u.Categoria.Icono]
                              ? MdIcons[u.Categoria.Icono]
                              : MdPlace;
                            const isSelected = Number(idUbicacion) === u.ID_Ubicacion;
                            return (
                              <div
                                key={u.ID_Ubicacion}
                                onClick={() => handleUbicSelect(u)}
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-amber-50 text-amber-700 font-bold'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-amber-200' : 'bg-gray-100'}`}>
                                  <IconComp className="text-[13px]" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[13px] truncate">{u.Nombre}</span>
                                  {u.Categoria?.Nombre_Categoria && (
                                    <span className="text-[11px] text-gray-400 truncate">{u.Categoria.Nombre_Categoria}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Fecha de expiración */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-gray-700">
                  Fecha de Expiración <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <p className="text-[12px] text-gray-400 -mt-1">
                  Al llegar esta fecha el aviso pasará automáticamente a inactivo.
                </p>
                <input
                  type="datetime-local"
                  value={fechaExpiracion}
                  onChange={(e) => setFechaExpiracion(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-gray-200 rounded-[12px] px-4 py-3 text-[#101828] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>

              {/* Toggle Estado (solo al editar) */}
              {isEditing && (
                <div className="flex items-center justify-between bg-[#f9f9f9] border border-gray-200 rounded-[12px] px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-gray-700">Estado del aviso</span>
                    <span className="text-[12px] text-gray-400">
                      {activa ? 'Visible para los usuarios' : 'Oculto para los usuarios'}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiva(prev => !prev)}
                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${activa ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${activa ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              )}

              {error && (
                <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-[10px] px-4 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Bottom Action */}
            <div className="mt-auto pt-[30px]">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="!text-[16px] !font-semibold !h-[55px] font-['Plus_Jakarta_Sans'] bg-[#101828] hover:bg-black border-none text-white shadow-lg flex justify-center items-center gap-2 disabled:opacity-60"
              >
                {isEditing ? <MdSave className="text-white text-[24px]" /> : <MdSend className="text-white text-[20px]" />}
                {loading
                  ? (isEditing ? 'Guardando...' : 'Publicando...')
                  : (isEditing ? 'Guardar Cambios' : 'Publicar Aviso')
                }
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
