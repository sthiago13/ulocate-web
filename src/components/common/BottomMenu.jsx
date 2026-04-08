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
import GestionarEventos from '../GestionarEventos';
import GestionarCategorias from '../GestionarCategorias';
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
  const [isGestionarEventosOpen, setIsGestionarEventosOpen] = useState(false);
  const [isGestionarCategoriasOpen, setIsGestionarCategoriasOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUbicacionId, setSelectedUbicacionId] = useState(null);

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

  return (
    <>
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-around w-[80%] sm:w-[350px] md:w-[400px] h-[65px] px-6 z-40 ${className}`}>

        {/* Menu Icon */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-black group"
        >
          <MdMenu className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </button>

        {/* Map Icon (Active) */}
        <button className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors text-[#155dfc] group">
          <MdMap className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </button>

        {/* Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-black group"
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
            setIsGestionarEventosOpen(true);
          }}
          onOpenGestionarCategorias={() => {
            setIsAdminOpen(false);
            setIsGestionarCategoriasOpen(true);
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

      <GestionarEventos
        isOpen={isGestionarEventosOpen}
        onClose={() => setIsGestionarEventosOpen(false)}
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
        />
      )}
    </>
  );
}
