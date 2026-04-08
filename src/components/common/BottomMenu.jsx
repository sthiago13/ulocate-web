import React, { useState, useEffect } from 'react';
import { MdMenu, MdMap, MdSearch } from 'react-icons/md';
import TarjetaUbicacion from './TarjetaUbicacion';
import MenuUsuario from './MenuUsuario';
import SearchPanel from './SearchPanel';
import UsuarioMiPerfil from './UsuarioMiPerfil';
import LugaresFavoritos from './LugaresFavoritos';
import HistorialRutas from './HistorialRutas';
import Notificaciones from './Notificaciones';
import AdministracionPanel from './AdministracionPanel';
import GestionarLugares from './GestionarLugares';
import GestionarUsuarios from './GestionarUsuarios';
import GestionarAvisos from '../GestionarAvisos';
import GestionarCategorias from '../GestionarCategorias';
import GestionarZonas from './GestionarZonas';
import EditorLugar from './EditorLugar';
import { supabase } from '../../lib/supabaseClient';

export default function BottomMenu({ className = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isGestionarLugaresOpen, setIsGestionarLugaresOpen] = useState(false);
  const [isGestionarUsuariosOpen, setIsGestionarUsuariosOpen] = useState(false);
  const [isGestionarAvisosOpen, setIsGestionarAvisosOpen] = useState(false);
  const [isGestionarCategoriasOpen, setIsGestionarCategoriasOpen] = useState(false);
  const [isGestionarZonasOpen, setIsGestionarZonasOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUbicacionId, setSelectedUbicacionId] = useState(null);
  const [isGlobalEditorOpen, setIsGlobalEditorOpen] = useState(false);
  const [globalLugarToEdit, setGlobalLugarToEdit] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbUser } = await supabase
          .from('Usuario')
          .select('ID_Rol')
          .eq('ID_Usuario', user.id)
          .single();

        if (dbUser && dbUser.ID_Rol === 2) {
          setIsAdmin(true);
        }
      }
    };
    fetchUserRole();
  }, []);

  const handleLocationSelect = (id) => {
    setIsSearchOpen(false);
    setIsFavoritesOpen(false);
    // Para forzar la re-renderizacion limpia de la tarjeta si ya estaba abierta con otro ID
    setSelectedUbicacionId(null);
    setTimeout(() => {
      setSelectedUbicacionId(id);
    }, 10);
  };

  const closeAllPanels = () => {
    setIsMenuOpen(false);
    setIsFavoritesOpen(false);
    setIsProfileOpen(false);
    setIsHistoryOpen(false);
    setIsNotificationsOpen(false);
    setIsAdminOpen(false);
    setIsSearchOpen(false);
    setIsGestionarLugaresOpen(false);
    setIsGestionarUsuariosOpen(false);
    setIsGestionarAvisosOpen(false);
    setIsGestionarCategoriasOpen(false);
    setIsGestionarZonasOpen(false);
    setSelectedUbicacionId(null);
    setIsGlobalEditorOpen(false);
  };

  const isMapActive = !(
    isMenuOpen || isFavoritesOpen || isProfileOpen || isHistoryOpen || 
    isNotificationsOpen || isAdminOpen || isSearchOpen || 
    isGestionarLugaresOpen || isGestionarUsuariosOpen || 
    isGestionarAvisosOpen || isGestionarCategoriasOpen || 
    isGestionarZonasOpen || selectedUbicacionId || isGlobalEditorOpen
  );

  return (
    <>
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-around w-[80%] sm:w-[350px] md:w-[400px] h-[65px] px-6 z-40 ${className}`}>

        {/* Menu Icon */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`p-2.5 rounded-full transition-colors group ${isMenuOpen ? 'bg-blue-50 text-[#155dfc]' : 'text-black hover:bg-gray-100'}`}
        >
          <MdMenu className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </button>

        {/* Map Icon (Active only when on pristine map view) */}
        <button 
          onClick={closeAllPanels}
          className={`p-2.5 rounded-full transition-colors group ${isMapActive ? 'bg-blue-50 text-[#155dfc]' : 'text-black hover:bg-gray-100'}`}
          title="Ir al mapa base"
        >
          <MdMap className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </button>

        {/* Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`p-2.5 rounded-full transition-colors group ${isSearchOpen ? 'bg-blue-50 text-[#155dfc]' : 'text-black hover:bg-gray-100'}`}
        >
          <MdSearch className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </button>

      </div>

      {isMenuOpen && (
        <MenuUsuario
          isAdmin={isAdmin}
          onClose={() => setIsMenuOpen(false)}
          onOpenFavorites={() => {
            setIsMenuOpen(false);
            setIsFavoritesOpen(true);
          }}
          onOpenProfile={() => {
            setIsMenuOpen(false);
            setIsProfileOpen(true);
          }}
          onOpenHistory={() => {
            setIsMenuOpen(false);
            setIsHistoryOpen(true);
          }}
          onOpenNotifications={() => {
            setIsMenuOpen(false);
            setIsNotificationsOpen(true);
          }}
          onOpenAdmin={() => {
            setIsMenuOpen(false);
            setIsAdminOpen(true);
          }}
        />
      )}

      {isFavoritesOpen && (
        <LugaresFavoritos
          onClose={() => setIsFavoritesOpen(false)}
          onLocationSelect={handleLocationSelect}
        />
      )}

      {isProfileOpen && (
        <UsuarioMiPerfil onClose={() => setIsProfileOpen(false)} />
      )}

      {isHistoryOpen && (
        <HistorialRutas onClose={() => setIsHistoryOpen(false)} />
      )}

      {isNotificationsOpen && (
        <Notificaciones onClose={() => setIsNotificationsOpen(false)} />
      )}

      {isAdminOpen && (
        <AdministracionPanel
          onClose={() => setIsAdminOpen(false)}
          onOpenGestionarLugares={() => {
            setIsAdminOpen(false);
            setIsGestionarLugaresOpen(true);
          }}
          onOpenGestionarUsuarios={() => {
            setIsAdminOpen(false);
            setIsGestionarUsuariosOpen(true);
          }}
          onOpenGestionarEventos={() => {
            setIsAdminOpen(false);
            setIsGestionarAvisosOpen(true);
          }}
          onOpenGestionarCategorias={() => {
            setIsAdminOpen(false);
            setIsGestionarCategoriasOpen(true);
          }}
          onOpenGestionarZonas={() => {
            setIsAdminOpen(false);
            setIsGestionarZonasOpen(true);
          }}
        />
      )}

      {/* GestionarLugares controla su propio hijo EditorLugar internamente */}
      <GestionarLugares
        isOpen={isGestionarLugaresOpen}
        onClose={() => setIsGestionarLugaresOpen(false)}
        onLocationSelect={handleLocationSelect}
      />

      <GestionarUsuarios
        isOpen={isGestionarUsuariosOpen}
        onClose={() => setIsGestionarUsuariosOpen(false)}
      />

      <GestionarAvisos
        isOpen={isGestionarAvisosOpen}
        onClose={() => setIsGestionarAvisosOpen(false)}
      />

      <GestionarZonas
        isOpen={isGestionarZonasOpen}
        onClose={() => setIsGestionarZonasOpen(false)}
      />

      <GestionarCategorias
        isOpen={isGestionarCategoriasOpen}
        onClose={() => setIsGestionarCategoriasOpen(false)}
      />

      {isSearchOpen && (
        <SearchPanel
          onClose={() => setIsSearchOpen(false)}
          onLocationSelect={handleLocationSelect}
        />
      )}

      {/* Tarjeta de Ubicacion Centralizada */}
      {selectedUbicacionId && (
        <TarjetaUbicacion
          ubicacionId={selectedUbicacionId}
          onClose={() => setSelectedUbicacionId(null)}
          isAdmin={isAdmin}
          onEdit={(lugar) => {
             setGlobalLugarToEdit(lugar);
             setIsGlobalEditorOpen(true);
          }}
        />
      )}

      {/* Editor Global para editar cualquier lugar desde la tarjeta centralizada */}
      <EditorLugar
        isOpen={isGlobalEditorOpen}
        onClose={() => setIsGlobalEditorOpen(false)}
        lugarToEdit={globalLugarToEdit}
        onSuccess={() => {
          setIsGlobalEditorOpen(false);
          // Forzar refresh de TarjetaUbicacion remontandola
          const tId = globalLugarToEdit.ID_Ubicacion;
          setSelectedUbicacionId(null);
          setTimeout(() => setSelectedUbicacionId(tId), 10);
        }}
      />
    </>
  );
}
