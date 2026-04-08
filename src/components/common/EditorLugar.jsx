import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdSave, MdAdd, MdImage, MdPlace, MdWarning } from 'react-icons/md';
import { supabase } from '../../lib/supabaseClient';
import InputField from './InputField';
import Spinner from './Spinner';

/**
 * EditorLugar — Modo crear (lugar = {}) o editar (lugar = { ID_Ubicacion, ... })
 *
 * Props:
 *   isOpen  – boolean
 *   lugar   – {} para crear, o el objeto completo de Supabase para editar
 *   onClose – callback al cerrar sin guardar
 *   onSaved – callback al guardar exitosamente (dispara refresh en GestionarLugares)
 */
export default function EditorLugar({ isOpen, lugar, onClose, onSaved }) {
  const esEdicion = lugar && !!lugar.ID_Ubicacion;

  // ── Formulario ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    detallesExtras: '',
    accesoPublico: true,
    idCategoria: '',
    idZona: '',
    idNodo: '',
    imagenUrl: '',
  });

  // ── Selects desde Supabase ────────────────────────────────────────────────
  const [categorias, setCategorias] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [nodos, setNodos] = useState([]);

  // ── Estado UI ─────────────────────────────────────────────────────────────
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ── Cargar datos auxiliares + poblar form si es edición ──────────────────
  useEffect(() => {
    if (!isOpen) return;

    const loadAll = async () => {
      setLoadingData(true);
      setError(null);
      setSuccessMsg(null);

      const [catRes, zonaRes, nodoRes] = await Promise.all([
        supabase.from('Categoria').select('ID_Categoria, Nombre_Categoria').order('Nombre_Categoria'),
        supabase.from('Zona').select('ID_Zona, Nombre_Zona').order('Nombre_Zona'),
        supabase.from('Nodo').select('ID_Nodo, Latitud, Longitud').order('ID_Nodo'),
      ]);

      if (catRes.data)  setCategorias(catRes.data);
      if (zonaRes.data) setZonas(zonaRes.data);
      if (nodoRes.data) setNodos(nodoRes.data);

      // Poblar el formulario si estamos editando
      if (esEdicion && lugar) {
        // Buscar la imagen principal (si existe)
        let imagenUrl = '';
        const { data: imgData } = await supabase
          .from('Referencias_Visuales')
          .select('ID_Referencia, URL_Imagen')
          .eq('ID_Ubicacion', lugar.ID_Ubicacion)
          .limit(1)
          .maybeSingle();

        if (imgData) imagenUrl = imgData.URL_Imagen || '';

        setForm({
          nombre:        lugar.Nombre        || '',
          descripcion:   lugar.Descripcion   || '',
          detallesExtras: lugar.Detalles_Extras || '',
          accesoPublico: lugar.Acceso_Publico ?? true,
          idCategoria:   lugar.ID_Categoria  ?? '',
          idZona:        lugar.ID_Zona       ?? '',
          idNodo:        lugar.ID_Nodo       ?? '',
          imagenUrl,
        });
      } else {
        // Resetear para crear nuevo
        setForm({
          nombre: '',
          descripcion: '',
          detallesExtras: '',
          accesoPublico: true,
          idCategoria: '',
          idZona: '',
          idNodo: '',
          imagenUrl: '',
        });
      }

      setLoadingData(false);
    };

    loadAll();
  }, [isOpen, lugar?.ID_Ubicacion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── Guardar (INSERT o UPDATE) ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!form.nombre.trim()) {
      setError('El nombre del lugar es obligatorio.');
      return;
    }
    if (!form.idCategoria) {
      setError('Debes seleccionar una categoría.');
      return;
    }
    if (!form.idNodo) {
      setError('Debes vincular un Nodo físico al lugar.');
      return;
    }

    setSaving(true);

    const payload = {
      Nombre:          form.nombre.trim(),
      Descripcion:     form.descripcion.trim() || null,
      Detalles_Extras: form.detallesExtras.trim() || null,
      Acceso_Publico:  form.accesoPublico,
      ID_Categoria:    parseInt(form.idCategoria),
      ID_Zona:         form.idZona ? parseInt(form.idZona) : null,
      ID_Nodo:         parseInt(form.idNodo),
    };

    let savedId = esEdicion ? lugar.ID_Ubicacion : null;

    if (esEdicion) {
      // ── UPDATE ────────────────────────────────────────────────────────────
      const { error: updateErr } = await supabase
        .from('Ubicacion')
        .update(payload)
        .eq('ID_Ubicacion', lugar.ID_Ubicacion);

      if (updateErr) {
        setError(`Error al actualizar: ${updateErr.message}`);
        setSaving(false);
        return;
      }
    } else {
      // ── INSERT ────────────────────────────────────────────────────────────
      const { data: inserted, error: insertErr } = await supabase
        .from('Ubicacion')
        .insert(payload)
        .select('ID_Ubicacion')
        .single();

      if (insertErr) {
        setError(`Error al crear: ${insertErr.message}`);
        setSaving(false);
        return;
      }
      savedId = inserted.ID_Ubicacion;
    }

    // ── Manejar imagen en Referencias_Visuales ────────────────────────────
    if (savedId) {
      const urlLimpia = form.imagenUrl.trim();

      if (esEdicion) {
        // Buscar si ya existe una referencia para esta ubicación
        const { data: existente } = await supabase
          .from('Referencias_Visuales')
          .select('ID_Referencia')
          .eq('ID_Ubicacion', savedId)
          .limit(1)
          .maybeSingle();

        if (urlLimpia) {
          if (existente) {
            // UPDATE URL existente
            await supabase
              .from('Referencias_Visuales')
              .update({ URL_Imagen: urlLimpia })
              .eq('ID_Referencia', existente.ID_Referencia);
          } else {
            // INSERT nueva referencia
            await supabase
              .from('Referencias_Visuales')
              .insert({ ID_Ubicacion: savedId, URL_Imagen: urlLimpia });
          }
        } else if (existente) {
          // La URL fue borrada → eliminar la referencia
          await supabase
            .from('Referencias_Visuales')
            .delete()
            .eq('ID_Referencia', existente.ID_Referencia);
        }
      } else if (urlLimpia) {
        // Crear
        await supabase
          .from('Referencias_Visuales')
          .insert({ ID_Ubicacion: savedId, URL_Imagen: urlLimpia });
      }
    }

    setSaving(false);
    setSuccessMsg(esEdicion ? '¡Lugar actualizado correctamente!' : '¡Lugar creado correctamente!');

    // Esperar un momento para que el usuario vea el mensaje y luego cerrar
    setTimeout(() => {
      if (onSaved) onSaved();
    }, 1200);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay: no cierra para evitar pérdida de datos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[70] transition-opacity"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[456px] overflow-y-auto bg-white flex flex-col z-[80] shadow-[-4px_0_24px_rgba(0,0,0,0.2)] rounded-none sm:rounded-l-[30px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full p-[30px] pb-[20px] shrink-0 border-b border-gray-100">
              <div className="flex items-center gap-[14px]">
                <div className="w-[46px] h-[46px] rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <MdPlace className="text-[#155dfc] text-[26px]" />
                </div>
                <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                  <span className="font-bold text-[20px] text-[#101828] leading-[26px]">
                    {esEdicion ? 'Editar Lugar' : 'Nuevo Lugar'}
                  </span>
                  <span className="text-[#667085] text-[13px]">
                    {esEdicion ? lugar?.Nombre : 'Completa los datos del sitio'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={saving}
                className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 disabled:opacity-50"
              >
                <MdClose className="text-gray-700 text-[22px]" />
              </button>
            </div>

            {/* Contenido */}
            {loadingData ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner text="Cargando datos del formulario..." />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-[20px] p-[30px] pb-[40px]">

                {/* Nombre */}
                <InputField
                  label="Nombre del lugar *"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Biblioteca Central"
                />

                {/* Categoría */}
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[14px] font-medium text-[#344054] font-['Plus_Jakarta_Sans']">
                    Categoría *
                  </label>
                  <select
                    name="idCategoria"
                    value={form.idCategoria}
                    onChange={handleChange}
                    className="w-full bg-[#f9f9f9] border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc] focus:border-transparent transition"
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categorias.map(c => (
                      <option key={c.ID_Categoria} value={c.ID_Categoria}>
                        {c.Nombre_Categoria}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zona */}
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[14px] font-medium text-[#344054] font-['Plus_Jakarta_Sans']">
                    Zona / Edificio <span className="text-gray-400 font-normal">(Opcional)</span>
                  </label>
                  <select
                    name="idZona"
                    value={form.idZona}
                    onChange={handleChange}
                    className="w-full bg-[#f9f9f9] border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc] focus:border-transparent transition"
                  >
                    <option value="">Sin zona asignada</option>
                    {zonas.map(z => (
                      <option key={z.ID_Zona} value={z.ID_Zona}>
                        {z.Nombre_Zona}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nodo */}
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[14px] font-medium text-[#344054] font-['Plus_Jakarta_Sans']">
                    Nodo de llegada en el mapa *
                  </label>
                  <select
                    name="idNodo"
                    value={form.idNodo}
                    onChange={handleChange}
                    className="w-full bg-[#f9f9f9] border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc] focus:border-transparent transition"
                  >
                    <option value="">Selecciona un nodo del mapa...</option>
                    {nodos.map(n => (
                      <option key={n.ID_Nodo} value={n.ID_Nodo}>
                        Nodo #{n.ID_Nodo} — Lat: {parseFloat(n.Latitud).toFixed(5)}, Lng: {parseFloat(n.Longitud).toFixed(5)}
                      </option>
                    ))}
                  </select>
                  <p className="text-[12px] text-gray-500 ml-1">
                    Este nodo será el destino exacto cuando alguien trace una ruta hacia aquí.
                  </p>
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[14px] font-medium text-[#344054] font-['Plus_Jakarta_Sans']">
                    Descripción breve
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Descripción corta del lugar..."
                    className="w-full bg-[#f9f9f9] border border-[#d0d5dd] rounded-[10px] p-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc] focus:border-transparent transition resize-none"
                  />
                </div>

                {/* Detalles Extras */}
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[14px] font-medium text-[#344054] font-['Plus_Jakarta_Sans']">
                    Detalles adicionales
                  </label>
                  <textarea
                    name="detallesExtras"
                    value={form.detallesExtras}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Horarios, requisitos, info extra..."
                    className="w-full bg-[#f9f9f9] border border-[#d0d5dd] rounded-[10px] p-[12px] text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc] focus:border-transparent transition resize-none"
                  />
                </div>

                {/* URL Imagen */}
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[14px] font-medium text-[#344054] font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                    <MdImage className="text-gray-500 text-[18px]" />
                    URL de fotografía <span className="text-gray-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="url"
                    name="imagenUrl"
                    value={form.imagenUrl}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full bg-[#f9f9f9] border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc] focus:border-transparent transition"
                  />
                  {form.imagenUrl && (
                    <img
                      src={form.imagenUrl}
                      alt="Vista previa"
                      className="w-full aspect-video object-cover rounded-[12px] border border-gray-200 mt-1"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>

                {/* Acceso Público */}
                <div
                  className="flex items-center justify-between bg-gray-50 rounded-[12px] p-[14px] border border-gray-100 cursor-pointer"
                  onClick={() => setForm(prev => ({ ...prev, accesoPublico: !prev.accesoPublico }))}
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-[#101828] font-['Plus_Jakarta_Sans']">
                      Acceso público
                    </span>
                    <span className="text-[12px] text-gray-500">
                      {form.accesoPublico ? 'Visible para todos los usuarios' : 'Solo administradores'}
                    </span>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${form.accesoPublico ? 'bg-[#155dfc]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${form.accesoPublico ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </div>

                {/* Mensajes */}
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-[12px] p-3">
                    <MdWarning className="text-red-500 text-[20px] shrink-0 mt-0.5" />
                    <p className="text-red-700 text-[13px] font-['Plus_Jakarta_Sans']">{error}</p>
                  </div>
                )}

                {successMsg && (
                  <div className="bg-green-50 border border-green-200 rounded-[12px] p-3 text-center">
                    <p className="text-green-700 text-[14px] font-semibold font-['Plus_Jakarta_Sans']">✓ {successMsg}</p>
                  </div>
                )}

                {/* Botón Guardar */}
                <button
                  type="submit"
                  disabled={saving || !!successMsg}
                  className="mt-2 bg-[#101828] hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full rounded-[16px] py-[16px] flex justify-center items-center gap-2 shadow-lg"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MdSave className="text-white text-[22px]" />
                  )}
                  <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                    {saving ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Lugar'}
                  </span>
                </button>

              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
