import React, { useEffect, useState } from 'react';
import { MdClose, MdStar, MdLocationOn, MdEdit, MdRestaurant, MdTheaterComedy } from 'react-icons/md';
import * as MdIcons from 'react-icons/md';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import ResultCard from './ResultCard';
import ModalConfirmacion from './ModalConfirmacion';
import ModalFormulario from './ModalFormulario';
import TarjetaUbicacion from './TarjetaUbicacion';
import Spinner from './Spinner';

const FavItem = ({ fav, onEdit, onDelete, onViewLocation }) => {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const ubi = fav.Ubicacion || {};
  const cat = ubi.Categoria || {};
  const IconComponent = cat.Icono && MdIcons[cat.Icono] ? MdIcons[cat.Icono] : MdIcons.MdPlace;

  const tagsContent = (fav.Dia_Semana || fav.Hora || fav.Datos_Adicionales) ? (
    <div className="flex flex-wrap gap-2">
      {(fav.Dia_Semana || fav.Hora) && (
        <div className="flex gap-2 text-xs text-blue-600 font-sans bg-blue-50 py-1 px-3 rounded-full border border-blue-100">
          <span className="font-bold">{fav.Dia_Semana || 'Cualquier día'}</span>
          {fav.Hora && <span>• {fav.Hora.substring(0,5)}</span>}
        </div>
      )}
      {fav.Datos_Adicionales && (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsNotesExpanded(!isNotesExpanded); }}
          className={`flex gap-1 items-center text-xs font-sans py-1 px-3 rounded-full border transition-colors ${
            isNotesExpanded ? 'bg-yellow-100 border-yellow-200 text-yellow-800' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>{isNotesExpanded ? 'Ocultar notas' : 'Ver notas'}</span>
        </button>
      )}
    </div>
  ) : null;

  const expandedContent = fav.Datos_Adicionales && isNotesExpanded ? (
    <motion.p 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.2 }}
      className="text-[13px] text-gray-600 font-sans bg-white border border-gray-200 p-2.5 rounded-lg leading-snug break-words mt-1 origin-top"
    >
      {fav.Datos_Adicionales}
    </motion.p>
  ) : null;

  const actionsContent = (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); onViewLocation(fav.ID_Ubicacion); }}
        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-sm font-bold flex items-center gap-1 hover:bg-green-600 hover:text-white transition-colors"
        title="Ver Ubicación en Mapa"
      >
        <MdIcons.MdVisibility className="text-[16px]" />
        <span className="hidden sm:inline">Ver lugar</span>
      </button>
      <button 
        onClick={() => onEdit(fav)}
        className="flex items-center justify-center w-[34px] h-[34px] bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
        title="Editar Notas/Alarmas"
      >
        <MdEdit className="text-[18px]" />
      </button>
      <button 
        onClick={() => onDelete(fav)}
        className="flex items-center justify-center w-[34px] h-[34px] bg-[#fffabe] hover:bg-red-100 rounded-lg transition-colors"
        title="Eliminar Favorito"
      >
        <MdStar className="text-[#eab308] hover:text-red-600 text-[20px]" />
      </button>
    </>
  );

  return (
    <ResultCard 
      icon={<IconComponent className="text-[#101828] text-[24px]" />}
      title={fav.Titulo_Guardado || ubi.Nombre}
      subtitle={cat.Nombre_Categoria || 'Desconocido'}
      tags={tagsContent}
      expandedContent={expandedContent}
      actions={actionsContent}
    />
  );
};

export default function LugaresFavoritos({ onClose, onLocationSelect }) {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // States for Modals
  const [modalType, setModalType] = useState(null); // 'confirm_delete' | 'edit_notes'
  const [showModal, setShowModal] = useState(false);
  const [selectedFav, setSelectedFav] = useState(null); // Whole Object
  const [formData, setFormData] = useState({ titulo: '', dia: '', hora: '', notas: '' });
  const [selectedUbicacionId, setSelectedUbicacionId] = useState(null);

  const fetchFavoritos = async (currentUser) => {
    const { data, error } = await supabase
      .from('Ubicacion_Guardada')
      .select(`
        *,
        Ubicacion (*, Categoria (*))
      `)
      .eq('ID_Usuario', currentUser.id)
      .order('ID_Guardado', { ascending: false });
    
    if (data) setFavoritos(data);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        await fetchFavoritos(currentUser);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleEditClick = (fav) => {
    setSelectedFav(fav);
    setFormData({
      titulo: fav.Titulo_Guardado || fav.Ubicacion?.Nombre || '',
      dia: fav.Dia_Semana || '',
      hora: fav.Hora || '',
      notas: fav.Datos_Adicionales || ''
    });
    setModalType('edit_notes');
    setShowModal(true);
  };

  const handleDeleteClick = (fav) => {
    setSelectedFav(fav);
    setModalType('confirm_delete');
    setShowModal(true);
  };

  const handleViewLocation = (idUbicacion) => {
    if (onLocationSelect) {
      onLocationSelect(idUbicacion);
    }
  };

  const closeModals = () => {
    setShowModal(false);
    setTimeout(() => { setModalType(null); setSelectedFav(null); }, 200);
  };

  const onConfirmDelete = async () => {
    if (selectedFav) {
      await supabase.from('Ubicacion_Guardada').delete().eq('ID_Guardado', selectedFav.ID_Guardado);
      setFavoritos(favoritos.filter(f => f.ID_Guardado !== selectedFav.ID_Guardado));
    }
    closeModals();
  };

  const onSaveNotes = async () => {
    if (selectedFav) {
      const dbTitulo = formData.titulo.trim() !== '' ? formData.titulo : null;
      const dbDia = formData.dia.trim() !== '' ? formData.dia : null;
      const dbHora = formData.hora.trim() !== '' ? formData.hora : null;
      const dbNotas = formData.notas.trim() !== '' ? formData.notas : null;

      const { data, error } = await supabase.from('Ubicacion_Guardada').update({
        Titulo_Guardado: dbTitulo,
        Dia_Semana: dbDia,
        Hora: dbHora,
        Datos_Adicionales: dbNotas
      }).eq('ID_Guardado', selectedFav.ID_Guardado).select(`*, Ubicacion (*, Categoria (*))`).single();
      
      if (data) {
        // Actualizar localmente sin refrescar todo
        setFavoritos(favoritos.map(f => f.ID_Guardado === data.ID_Guardado ? data : f));
      }
    }
    closeModals();
  };

  return (
    <>
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
      />

      {/* Sidebar Modal */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[456px] overflow-y-auto bg-white flex flex-col p-[30px] rounded-none sm:rounded-l-[30px] z-[60] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
      >

        {/* Header */}
        <div className="flex items-center justify-between w-full mb-[30px]">
          <div className="flex gap-[20px] items-center">
            <div className="bg-[#fffabe] flex items-center justify-center rounded-[100px] w-[60px] h-[60px] shrink-0">
              <MdStar className="text-[#eab308] text-[32px]" />
            </div>
            <div className="flex flex-col font-['Plus_Jakarta_Sans']">
              <span className="font-medium text-[#101828] text-[20px] leading-[26px]">Lugares favoritos</span>
              <span className="font-normal text-[#fff036] text-[16px] leading-[26px]">{favoritos.length} Guardados</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <MdClose className="text-gray-700 text-[24px]" />
          </button>
        </div>

        {/* Saved Places */}
        <div className="flex flex-col gap-[22px] w-full mb-[30px]">
          {loading ? (
             <Spinner text="Cargando favoritos..." />
          ) : favoritos.length === 0 ? (
             <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[10px]">Aún no tienes lugares favoritos.</div>
          ) : (
            favoritos.map((fav) => {
              const ubi = fav.Ubicacion || {};
              const cat = ubi.Categoria || {};
              const IconComponent = cat.Icono && MdIcons[cat.Icono] ? MdIcons[cat.Icono] : MdIcons.MdPlace;
              
              return (
                <FavItem 
                  key={fav.ID_Guardado} 
                  fav={fav} 
                  onEdit={handleEditClick} 
                  onDelete={handleDeleteClick} 
                  onViewLocation={handleViewLocation} 
                />
              );
            })
          )}
        </div>

        {/* Populares Placeholder */}
        <div className="flex flex-col gap-[16px] w-full mt-auto mb-10 pt-6 border-t border-gray-200">
          <span className="font-bold text-gray-800 text-[16px] w-full flex items-center justify-between">
            Lugares Populares
            <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">Próximamente</span>
          </span>

          <div className="bg-[#f9f9f9] flex items-center justify-between px-[15px] py-[10px] rounded-[10px] w-full opacity-60 pointer-events-none border border-gray-200">
            <div className="flex gap-[15px] items-center">
              <div className="flex items-center justify-center w-[30px] h-[30px]">
                <MdRestaurant className="text-gray-500 text-[20px]" />
              </div>
              <span className="font-sans font-medium text-[#101828] text-[14px]">
                Comedor Universitario
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-yellow-600">Top #1</span>
              <MdStar className="text-[#eab308] text-[20px]" />
            </div>
          </div>

          <div className="bg-[#f9f9f9] flex items-center justify-between px-[15px] py-[10px] rounded-[10px] w-full opacity-60 pointer-events-none border border-gray-200">
            <div className="flex gap-[15px] items-center">
              <div className="flex items-center justify-center w-[30px] h-[30px]">
                <MdTheaterComedy className="text-gray-500 text-[20px]" />
              </div>
              <span className="font-sans font-medium text-[#101828] text-[14px]">
                Teatro de la Universidad
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-yellow-600">Top #2</span>
              <MdStar className="text-[#eab308] text-[20px]" />
            </div>
          </div>
        </div>

      </motion.div>

      {/* MODALES */}
      {modalType === 'confirm_delete' && selectedFav ? (
        <ModalConfirmacion 
          isOpen={showModal}
          onClose={closeModals}
          onConfirm={onConfirmDelete}
          titulo="Eliminar Favorito"
          mensaje={`¿Estás seguro de que deseas eliminar ${selectedFav.Titulo_Guardado} de tus favoritos?`}
          textoConfirmar="Eliminar"
          textoCancelar="Cancelar"
          colorConfirmar="bg-red-600 hover:bg-red-700"
        />
      ) : modalType === 'edit_notes' && selectedFav ? (
        <ModalFormulario
          isOpen={showModal}
          onClose={closeModals}
          onSubmit={onSaveNotes}
          titulo="Editar Detalles"
          subtitulo={`Ajusta las notificaciones o apuntes para ${selectedFav.Titulo_Guardado}`}
          textoConfirmar="Guardar Cambios"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Título Personalizado</label>
            <input 
              type="text" 
              placeholder="Ej: Sala de reuniones principal"
              value={formData.titulo}
              onChange={e => setFormData({...formData, titulo: e.target.value})}
              className="w-full font-sans px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Día Frecuente</label>
            <select 
              value={formData.dia}
              onChange={e => setFormData({...formData, dia: e.target.value})}
              className="w-full font-sans px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecciona (Opcional)</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Hora</label>
            <input 
              type="time" 
              value={formData.hora}
              onChange={e => setFormData({...formData, hora: e.target.value})}
              className="w-full font-sans px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Notas adicionales</label>
            <textarea 
              rows="3"
              maxLength={100}
              placeholder="Ej: Traer la lapto, pedir cita previa..."
              value={formData.notas}
              onChange={e => setFormData({...formData, notas: e.target.value})}
              className="w-full font-sans px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <span className="text-xs text-gray-400 text-right">{formData.notas.length}/100</span>
          </div>
        </ModalFormulario>
      ) : null}

    </>
  );
}
