import React, { useState } from 'react';
import { MdMenu, MdMap, MdSearch } from 'react-icons/md';
import MenuUsuario from './MenuUsuario';
import SearchPanel from './SearchPanel';
import UsuarioMiPerfil from './UsuarioMiPerfil';
import LugaresFavoritos from './LugaresFavoritos';
import HistorialRutas from './HistorialRutas';
import Notificaciones from './Notificaciones';
import AdministracionPanel from './AdministracionPanel';

export default function BottomMenu({ className = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <>
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-around w-[80%] sm:w-[350px] md:w-[400px] h-[65px] px-6 ${className}`}>

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
        <LugaresFavoritos onClose={() => setIsFavoritesOpen(false)} />
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
        <AdministracionPanel onClose={() => setIsAdminOpen(false)} />
      )}

      {isSearchOpen && (
        <SearchPanel onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
}
