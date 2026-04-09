import React, { useState, useEffect } from 'react';
import { MdClose, MdCampaign, MdEdit, MdAdd, MdPlace, MdDelete, MdCheckCircle, MdCancel, MdSchedule } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import SearchBar from '../common/SearchBar';
import Spinner from '../common/Spinner';
import ModalConfirmacion from '../common/ModalConfirmacion';
import EditorAviso from './EditorAviso';
import { formatRelativeDate } from '../../utils/formatters';

// Determina si una alerta está efectivamente activa considerando su fecha de expiración
function isAlertaVigente(alerta) {
  if (!alerta.Activa) return false;
  if (!alerta.Fecha_Expiracion) return true;
  return new Date(alerta.Fecha_Expiracion) > new Date();
}

export default function GestionarAvisos({ isOpen, onClose }) {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [alertaToEdit, setAlertaToEdit] = useState(null);
  const [deleteConf, setDeleteConf] = useState({ phase: 0, item: null });

  const fetchAlertas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Alerta_Global')
      .select('*, Ubicacion(ID_Ubicacion, Nombre, Categoria(Icono))')
      .order('Fecha_Creacion', { ascending: false });

    if (!error && data) {
      setAlertas(data);
    } else if (error) {
      console.error('Error al cargar alertas:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchAlertas();
  }, [isOpen]);

  const openEditor = (alerta = null) => {
    setAlertaToEdit(alerta);
    setIsEditorOpen(true);
  };

  const performDelete = async () => {
    const target = deleteConf.item;
    if (target) {
      const { error } = await supabase
        .from('Alerta_Global')
        .delete()
        .eq('ID_Alerta', target.ID_Alerta);

      if (!error) {
        setAlertas(prev => prev.filter(a => a.ID_Alerta !== target.ID_Alerta));
      } else {
        console.error('Error al eliminar aviso:', error);
      }
    }
    setDeleteConf({ phase: 0, item: null });
  };

  if (!isOpen && !isEditorOpen) return null;

  const filtrados = alertas.filter(alerta => {
    const searchLow = searchTerm.toLowerCase();
    return (
      (alerta.Titulo || '').toLowerCase().includes(searchLow) ||
      (alerta.Mensaje || '').toLowerCase().includes(searchLow) ||
      (alerta.Ubicacion?.Nombre || '').toLowerCase().includes(searchLow)
    );
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[70] transition-opacity"
            />

            {/* Panel Derecha */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] overflow-y-auto bg-[#f9f9f9] flex flex-col pt-[30px] rounded-none sm:rounded-l-[30px] z-[80] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-[30px] w-full mb-[20px] shrink-0">
                <div className="flex gap-[15px] items-center">
                  <div className="bg-amber-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                    <MdCampaign className="text-amber-600 text-[28px]" />
                  </div>
                  <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                    <span className="font-bold text-[#101828] text-[20px] leading-[26px]">Gestionar Avisos</span>
                    <span className="font-medium text-gray-500 text-[14px]">Alertas globales de la plataforma</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
                >
                  <MdClose className="text-gray-700 text-[24px]" />
                </button>
              </div>

              {/* Buscador */}
              <div className="px-[30px] pb-[15px] shrink-0">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  showFilter={false}
                  placeholder="Buscar por título, mensaje o lugar..."
                />
              </div>

              {/* Lista */}
              <div className="flex-1 overflow-y-auto px-[30px] flex flex-col gap-3 pb-[100px] font-['Plus_Jakarta_Sans']">
                {loading ? (
                  <Spinner text="Cargando avisos..." />
                ) : filtrados.length === 0 ? (
                  <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[10px] border border-gray-200">
                    No se encontraron avisos para mostrar.
                  </div>
                ) : (
                  filtrados.map((alerta) => {
                    const vigente = isAlertaVigente(alerta);
                    const nombreUbicacion = alerta.Ubicacion?.Nombre;

                    return (
                      <div
                        key={alerta.ID_Alerta}
                        className={`flex items-start gap-[15px] bg-white p-[15px] rounded-[15px] shadow-sm border transition-all group ${
                          vigente
                            ? 'border-gray-100 hover:shadow-md hover:border-gray-200'
                            : 'border-gray-100 opacity-60'
                        }`}
                      >
                        {/* Icono: categoría del lugar si existe, campana si no */}
                        {(() => {
                          const iconoKey = alerta.Ubicacion?.Categoria?.Icono;
                          const IconoComp = (iconoKey && MdIcons[iconoKey]) ? MdIcons[iconoKey] : MdCampaign;
                          return (
                            <div className={`flex items-center justify-center w-[45px] h-[45px] rounded-[12px] shrink-0 border ${
                              vigente
                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                : 'bg-gray-50 text-gray-400 border-gray-200'
                            }`}>
                              <IconoComp className="text-[22px]" />
                            </div>
                          );
                        })()}

                        {/* Info */}
                        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[15px] text-[#101828] leading-[20px]">
                              {alerta.Titulo}
                            </span>
                            {vigente ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 rounded-full px-2 py-0.5 shrink-0">
                                <MdCheckCircle className="text-[11px]" /> Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
                                <MdCancel className="text-[11px]" /> Inactivo
                              </span>
                            )}
                          </div>

                          <p className="text-[12px] text-gray-500 mt-1 line-clamp-2 leading-[16px] pr-2">
                            {alerta.Mensaje}
                          </p>

                          {nombreUbicacion && (
                            <div className="flex items-center gap-1.5 text-gray-500 text-[12px] mt-1.5">
                              <MdPlace className="shrink-0 text-[14px]" />
                              <span className="truncate">{nombreUbicacion}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-gray-400 text-[11px] mt-1">
                            <div className="flex items-center gap-1">
                              <MdSchedule className="shrink-0 text-[12px]" />
                              <span>Publicado: {formatRelativeDate(alerta.Fecha_Creacion)}</span>
                            </div>
                            {alerta.Fecha_Expiracion && (
                              <span className="text-orange-500">
                                · Expira: {formatRelativeDate(alerta.Fecha_Expiracion)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-center flex flex-col gap-2">
                          <button
                            onClick={() => openEditor(alerta)}
                            className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors"
                            title="Editar aviso"
                          >
                            <MdEdit className="text-[18px]" />
                          </button>
                          <button
                            onClick={() => setDeleteConf({ phase: 1, item: alerta })}
                            className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                            title="Eliminar aviso"
                          >
                            <MdDelete className="text-[18px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Botón Publicar */}
              <div className="absolute bottom-0 left-0 right-0 p-[30px] bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent pointer-events-none">
                <button
                  onClick={() => openEditor(null)}
                  className="w-full bg-[#101828] hover:bg-black transition-colors rounded-[16px] py-[14px] flex justify-center items-center gap-2 shadow-lg hover:shadow-xl pointer-events-auto"
                >
                  <MdAdd className="text-white text-[24px]" />
                  <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                    Publicar Aviso
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Panel: Crear / Editar Aviso */}
      <EditorAviso
        isOpen={isEditorOpen}
        alertaToEdit={alertaToEdit}
        onClose={() => setIsEditorOpen(false)}
        onSuccess={() => {
          setIsEditorOpen(false);
          fetchAlertas();
        }}
      />

      {/* Modal 1: Primera confirmación */}
      <ModalConfirmacion
        isOpen={deleteConf.phase === 1}
        onClose={() => setDeleteConf({ phase: 0, item: null })}
        onConfirm={() => setDeleteConf(prev => ({ ...prev, phase: 2 }))}
        titulo="Eliminar Aviso"
        mensaje={
          <span>
            ¿Estás seguro que deseas eliminar el aviso <strong>"{deleteConf.item?.Titulo}"</strong>?
          </span>
        }
        textoConfirmar="Continuar"
        textoCancelar="Cancelar"
        colorConfirmar="bg-red-600 hover:bg-red-700"
      />

      {/* Modal 2: Confirmación definitiva */}
      <ModalConfirmacion
        isOpen={deleteConf.phase === 2}
        onClose={() => setDeleteConf({ phase: 0, item: null })}
        onConfirm={performDelete}
        titulo="⚠️ Confirmar eliminación definitiva"
        mensaje="Esta acción eliminará permanentemente el aviso y dejará de ser visible para todos los usuarios. No se puede deshacer. ¿Deseas eliminarlo definitivamente?"
        textoConfirmar="Sí, eliminar definitivamente"
        textoCancelar="No, cancelar"
        colorConfirmar="bg-red-600 hover:bg-red-700"
      />
    </>
  );
}
