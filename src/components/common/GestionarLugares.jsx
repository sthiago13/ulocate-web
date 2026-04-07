import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdSearch, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import ModalConfirmacion from './ModalConfirmacion';
import {
  getUbicaciones, deleteUbicacion, getNodes,
  addUbicacion, updateUbicacion, saveNodes
} from '../../utils/localDB';

const CATEGORY_ICONS = {
  'Académico':      '🎓',
  'Alimentación':   '🍽️',
  'Servicios':      '🛠️',
  'Administrativo': '🏛️',
  'Recreación':     '⚽',
};

export default function GestionarLugares({ isOpen, onClose }) {
  const [searchTerm,          setSearchTerm]          = useState('');
  const [isEditorOpen,        setIsEditorOpen]         = useState(false);
  const [editingUbi,          setEditingUbi]           = useState(null);
  const [deleteConfirmation,  setDeleteConfirmation]   = useState({ isOpen: false, item: null });
  const [lugares,             setLugares]              = useState([]);

  // Cargar desde localDB cada vez que se abre
  useEffect(() => {
    if (isOpen) reload();
  }, [isOpen]);

  const reload = () => setLugares(getUbicaciones());

  const filtrados = lugares.filter(l =>
    l.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (lugar) => {
    setEditingUbi(lugar);
    setIsEditorOpen(true);
  };

  const handleAdd = () => {
    setEditingUbi(null);
    setIsEditorOpen(true);
  };

  const handleEliminar = () => {
    deleteUbicacion(deleteConfirmation.item.id);
    setDeleteConfirmation({ isOpen: false, item: null });
    reload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[456px] overflow-hidden bg-[#f9fafb] flex flex-col z-60 shadow-[-4px_0_24px_rgba(0,0,0,0.15)] rounded-none sm:rounded-l-[30px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full p-[30px] pb-[20px] bg-white shrink-0 shadow-sm z-10">
              <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                <span className="font-bold text-[24px] text-[#101828] leading-[30px]">Gestionar Lugares</span>
                <span className="text-[#667085] text-[14px]">{lugares.length} lugar{lugares.length !== 1 ? 'es' : ''} registrado{lugares.length !== 1 ? 's' : ''}</span>
              </div>
              <button onClick={onClose} className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0">
                <MdClose className="text-gray-700 text-[24px]" />
              </button>
            </div>

            {/* Buscador */}
            <div className="px-[30px] py-[20px] shrink-0 bg-[#f9fafb]">
              <div className="relative">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[24px]" />
                <input
                  type="text"
                  placeholder="Buscar ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-[#d0d5dd] rounded-[15px] pl-[45px] pr-[15px] h-[55px] text-[16px] text-gray-900 font-['Plus_Jakarta_Sans'] focus:outline-none focus:ring-2 focus:ring-[#155dfc] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto px-[30px] flex flex-col gap-3 pb-[100px]">
              {filtrados.length === 0 ? (
                <div className="text-center text-gray-400 mt-16 font-['Plus_Jakarta_Sans'] px-4">
                  <p className="text-4xl mb-3">🗺️</p>
                  {lugares.length === 0 ? (
                    <>
                      <p className="font-semibold text-gray-700">No hay lugares registrados</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Usa el Modo Editor del mapa para crear nodos y asignarles lugares.
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold text-gray-600">No se encontraron coincidencias.</p>
                  )}
                </div>
              ) : (
                filtrados.map((lugar) => (
                  <div
                    key={lugar.id}
                    className="bg-white border border-gray-100 p-4 rounded-[16px] shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{lugar.icono || CATEGORY_ICONS[lugar.categoria] || '📍'}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#101828] text-[15px] truncate">
                          {lugar.nombre}
                        </span>
                        <span className="font-['Plus_Jakarta_Sans'] text-gray-500 text-[12px]">
                          {lugar.categoria}
                          {lugar.nodeId
                            ? <span className="ml-2 text-green-600">✓ Conectado</span>
                            : <span className="ml-2 text-amber-500">⚠ Sin nodo</span>
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEdit(lugar)}
                        className="w-9 h-9 rounded-full bg-blue-50 text-[#155dfc] flex items-center justify-center hover:bg-[#155dfc] hover:text-white transition-colors"
                      >
                        <MdEdit className="text-[18px]" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation({ isOpen: true, item: lugar })}
                        className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <MdDelete className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Botón */}
            <div className="absolute bottom-0 w-full left-0 p-[30px] bg-linear-to-t from-[#f9fafb] via-[#f9fafb] to-transparent shrink-0">
              <button
                onClick={handleAdd}
                className="bg-[#155dfc] hover:bg-blue-700 transition-colors w-full rounded-[16px] py-[16px] flex justify-center items-center shadow-[0_8px_20px_rgba(21,93,252,0.3)] gap-2"
              >
                <MdAdd className="text-white text-[24px]" />
                <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                  Agregar Nuevo
                </span>
              </button>
            </div>
          </motion.div>

          {/* Editor inline */}
          {isEditorOpen && (
            <EditorLugarLocal
              ubicacion={editingUbi}
              onClose={() => { setIsEditorOpen(false); reload(); }}
            />
          )}

          {/* Confirm delete */}
          <ModalConfirmacion
            isOpen={deleteConfirmation.isOpen}
            onClose={() => setDeleteConfirmation({ isOpen: false, item: null })}
            onConfirm={handleEliminar}
            titulo="Eliminar Lugar"
            mensaje={`¿Eliminar permanentemente "${deleteConfirmation.item?.nombre}"?`}
            textoConfirmar="Eliminar"
            textoCancelar="Cancelar"
            colorConfirmar="bg-red-600 hover:bg-red-700"
          />
        </>
      )}
    </AnimatePresence>
  );
}

// ── Editor de lugar (usa localDB directamente) ────────────────────────────────
function EditorLugarLocal({ ubicacion, onClose }) {
  const nodes = getNodes();

  const [form, setForm] = useState({
    nombre:      ubicacion?.nombre      || '',
    descripcion: ubicacion?.descripcion || '',
    categoria:   ubicacion?.categoria   || 'Académico',
    icono:       ubicacion?.icono       || '📍',
    nodeId:      ubicacion?.nodeId      || '',
  });
  const [error, setError] = useState('');

  const CATEGORIAS = ['Académico', 'Alimentación', 'Servicios', 'Administrativo', 'Recreación'];

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    if (!form.nodeId) { setError('Debes seleccionar un nodo del mapa para vincular este lugar.'); return; }

    if (ubicacion) {
      // Actualizar existente
      updateUbicacion(ubicacion.id, form);
    } else {
      // Crear nuevo
      addUbicacion(form);
    }
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-70"
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[456px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-none sm:rounded-l-[30px] z-80 shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-[30px] shrink-0">
          <div className="flex flex-col font-['Plus_Jakarta_Sans']">
            <span className="font-bold text-[24px] text-[#101828] leading-[30px]">
              {ubicacion ? 'Editar Lugar' : 'Nuevo Lugar'}
            </span>
            <span className="text-[#667085] text-[14px]">
              {ubicacion ? 'Modifica los datos del lugar.' : 'Completa los datos y vincula un nodo del mapa.'}
            </span>
          </div>
          <button onClick={onClose} className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0">
            <MdClose className="text-gray-700 text-[24px]" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-[18px] font-['Plus_Jakarta_Sans'] pb-[20px]">
          {/* Icono + Nombre */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] font-medium text-[#344054]">Nombre <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                name="icono" value={form.icono} onChange={change}
                className="w-[52px] text-center border border-[#d0d5dd] rounded-[10px] p-[12px] text-xl"
              />
              <input
                name="nombre" value={form.nombre} onChange={change}
                placeholder="Ej: Biblioteca Central"
                className="flex-1 border border-[#d0d5dd] rounded-[10px] px-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] font-medium text-[#344054]">Categoría</label>
            <select name="categoria" value={form.categoria} onChange={change}
              className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
            >
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Descripcion */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] font-medium text-[#344054]">Descripción</label>
            <textarea
              name="descripcion" value={form.descripcion} onChange={change}
              rows={3} placeholder="Descripción breve del lugar..."
              className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc] resize-none"
            />
          </div>

          {/* Vincular Nodo */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] font-medium text-[#344054]">
              Vincular a Nodo del Mapa <span className="text-red-500">*</span>
            </label>
            {nodes.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-3 text-[13px] text-amber-700">
                ⚠️ No hay nodos creados en el mapa aún. Usa primero el <b>Modo Editor</b> (Administración → Gestionar Tramos) para definir los puntos del campus.
              </div>
            ) : (
              <select name="nodeId" value={form.nodeId} onChange={change}
                className="w-full bg-white border border-[#d0d5dd] rounded-[10px] p-[12px] h-[50px] text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
              >
                <option value="">— Selecciona el nodo de llegada —</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label ? `${n.label} (${n.id.slice(-6)})` : `Nodo ${n.id.slice(-6)} · Lat ${n.lat.toFixed(4)}`}
                  </option>
                ))}
              </select>
            )}
            <span className="text-[12px] text-gray-500">
              El nodo es el punto exacto al que se dirigirá el algoritmo de rutas cuando alguien busque este lugar.
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <button type="submit"
            className="mt-2 bg-[#155dfc] hover:bg-blue-700 transition-colors w-full rounded-[12px] py-[14px] flex justify-center items-center shadow-[0_4px_12px_rgba(21,93,252,0.3)]"
          >
            <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
              {ubicacion ? 'Guardar Cambios' : 'Crear Lugar'}
            </span>
          </button>
        </form>
      </motion.div>
    </>
  );
}
