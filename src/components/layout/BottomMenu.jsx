import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { MdMenu, MdMap, MdSearch } from 'react-icons/md';
import TarjetaUbicacion from '../map/TarjetaUbicacion';
import MenuUsuario from './MenuUsuario';
import SearchPanel from '../map/SearchPanel';
import UsuarioMiPerfil from '../user/UsuarioMiPerfil';
import LugaresFavoritos from '../user/LugaresFavoritos';
import HistorialRutas from '../user/HistorialRutas';
import Notificaciones from '../user/Notificaciones';
import AdministracionPanel from '../admin/AdministracionPanel';
import GestionarLugares from '../admin/GestionarLugares';
import GestionarUsuarios from '../admin/GestionarUsuarios';
import GestionarAvisos from '../admin/GestionarAvisos';
import GestionarCategorias from '../admin/GestionarCategorias';
import GestionarZonas from '../admin/GestionarZonas';
import EditorLugar from '../admin/EditorLugar';
import { supabase } from '../../lib/supabaseClient';

/**
 * BottomMenu recibe `campusMapRef` que es un ref con el método `startRoute(ubicacion)`.
 * Este patrón evita el uso de localStorage/window events para comunicar
 * TarjetaUbicacion → CampusMap.
 */
const BottomMenu = forwardRef(function BottomMenu({ className = '', onOpenAdminRoutes, campusMapRef, isAdminMode = false, onExitAdminMode }, ref) {
  const [isMenuOpen,              setIsMenuOpen]              = useState(false);
  const [isSearchOpen,            setIsSearchOpen]            = useState(false);
  const [isProfileOpen,           setIsProfileOpen]           = useState(false);
  const [isFavoritesOpen,         setIsFavoritesOpen]         = useState(false);
  const [isHistoryOpen,           setIsHistoryOpen]           = useState(false);
  const [isNotificationsOpen,     setIsNotificationsOpen]     = useState(false);
  const [isAdminOpen,             setIsAdminOpen]             = useState(false);
  const [isGestionarLugaresOpen,  setIsGestionarLugaresOpen]  = useState(false);
  const [isGestionarUsuariosOpen, setIsGestionarUsuariosOpen] = useState(false);
  const [isGestionarAvisosOpen,   setIsGestionarAvisosOpen]   = useState(false);
  const [isGestionarCategoriasOpen, setIsGestionarCategoriasOpen] = useState(false);
  const [isGestionarZonasOpen,    setIsGestionarZonasOpen]    = useState(false);
  const [isAdmin,                 setIsAdmin]                 = useState(false);
  const [selectedUbicacionId,     setSelectedUbicacionId]     = useState(null);
  const [isGlobalEditorOpen,      setIsGlobalEditorOpen]      = useState(false);
  const [globalLugarToEdit,       setGlobalLugarToEdit]       = useState(null);
  const [gestionarLugaresSearch,  setGestionarLugaresSearch]  = useState('');

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

  const handleLocationSelect = useCallback((id) => {
    setIsSearchOpen(false);
    setIsFavoritesOpen(false);
    // Forzar re-renderización limpia si ya había otra tarjeta abierta
    setSelectedUbicacionId(null);

    // Centrar mapa en la ubicación
    if (campusMapRef?.current?.centerOnUbicacion) {
      campusMapRef.current.centerOnUbicacion(id);
    }

    setTimeout(() => {
      setSelectedUbicacionId(id);
    }, 10);
  }, [campusMapRef]);

  /**
   * Callback para que TarjetaUbicacion solicite trazar ruta.
   * Llama directamente a `startRoute` del CampusMap via ref.
   */
  const handleRouteRequest = useCallback((ubicacion) => {
    if (campusMapRef?.current?.startRoute) {
      campusMapRef.current.startRoute(ubicacion);
    }
  }, [campusMapRef]);

  // Exponer métodos al padre (Home):
  // - handleLocationSelect: para abrir TarjetaUbicacion desde pins del mapa
  // - openGestionarLugares: para abrir Gestionar Lugares pre-filtrado desde NodeEditorPanel
  const openGestionarLugares = useCallback((searchTerm = '') => {
    setGestionarLugaresSearch(searchTerm);
    setIsGestionarLugaresOpen(true);
  }, []);

  useImperativeHandle(ref, () => ({ handleLocationSelect, openGestionarLugares }), [handleLocationSelect, openGestionarLugares]);

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

    // Limpiar rutas o planificador activo en el mapa
    if (campusMapRef?.current?.cancelRoute) {
      campusMapRef.current.cancelRoute();
    }
  };

  const isMapActive = !isAdminMode && !(
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

        {/* Map Icon */}
        <button
          onClick={isAdminMode ? () => { closeAllPanels(); onExitAdminMode?.(); } : closeAllPanels}
          className={`p-2.5 rounded-full transition-colors group ${isMapActive ? 'bg-blue-50 text-[#155dfc]' : 'text-black hover:bg-gray-100'}`}
          title={isAdminMode ? 'Salir del modo edición' : 'Ir al mapa base'}
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
          onOpenFavorites={() => { setIsMenuOpen(false); setIsFavoritesOpen(true); }}
          onOpenProfile={() => { setIsMenuOpen(false); setIsProfileOpen(true); }}
          onOpenHistory={() => { setIsMenuOpen(false); setIsHistoryOpen(true); }}
          onOpenNotifications={() => { setIsMenuOpen(false); setIsNotificationsOpen(true); }}
          onOpenAdmin={() => { setIsMenuOpen(false); setIsAdminOpen(true); }}
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
          onOpenGestionarLugares={() => { setIsAdminOpen(false); setIsGestionarLugaresOpen(true); }}
          onOpenGestionarUsuarios={() => { setIsAdminOpen(false); setIsGestionarUsuariosOpen(true); }}
          onOpenGestionarAvisos={() => { setIsAdminOpen(false); setIsGestionarAvisosOpen(true); }}
          onOpenGestionarCategorias={() => { setIsAdminOpen(false); setIsGestionarCategoriasOpen(true); }}
          onOpenGestionarZonas={() => { setIsAdminOpen(false); setIsGestionarZonasOpen(true); }}
          onOpenGestionarTramos={() => {
            setIsAdminOpen(false);
            if (onOpenAdminRoutes) onOpenAdminRoutes();
          }}
        />
      )}

      {/* GestionarLugares controla su propio hijo EditorLugar internamente */}
      <GestionarLugares
        isOpen={isGestionarLugaresOpen}
        onClose={() => { setIsGestionarLugaresOpen(false); setGestionarLugaresSearch(''); }}
        onLocationSelect={handleLocationSelect}
        initialSearchTerm={gestionarLugaresSearch}
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

      {/* Tarjeta de Ubicación Centralizada */}
      {selectedUbicacionId && (
        <TarjetaUbicacion
          ubicacionId={selectedUbicacionId}
          onClose={() => setSelectedUbicacionId(null)}
          isAdmin={isAdmin}
          onEdit={(lugar) => {
            setGlobalLugarToEdit(lugar);
            setIsGlobalEditorOpen(true);
          }}
          onRouteRequest={handleRouteRequest}
        />
      )}

      {/* Editor Global para editar cualquier lugar desde la tarjeta centralizada */}
      <EditorLugar
        isOpen={isGlobalEditorOpen}
        onClose={() => setIsGlobalEditorOpen(false)}
        lugarToEdit={globalLugarToEdit}
        onSuccess={() => {
          setIsGlobalEditorOpen(false);
          const tId = globalLugarToEdit.ID_Ubicacion;
          setSelectedUbicacionId(null);
          setTimeout(() => setSelectedUbicacionId(tId), 10);
        }}
      />
    </>
  );
});

export default BottomMenu;
