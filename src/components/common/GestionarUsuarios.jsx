import React, { useState, useEffect } from 'react';
import { MdClose, MdPersonAdd, MdAdminPanelSettings, MdPerson, MdEmail, MdEdit, MdSchool, MdHourglassEmpty } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import SearchBar from './SearchBar';
import Spinner from './Spinner';
import EditarUsuario from './EditarUsuario';
import InvitarUsuario from './InvitarUsuario';

export default function GestionarUsuarios({ isOpen, onClose }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsuarios = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('Usuario')
          .select('*')
          .order('Nombre', { ascending: true });

        if (data && data.length > 0) {
          setUsuarios(data);
        } else {
          // Datos de prueba por si la tabla está vacía o hay error
          setUsuarios([
            { ID_Usuario: '1', Nombre: 'Carlos Mendoza (Admin)', Correo: 'carlos.m@unet.edu.ve', ID_Rol: 2 },
            { ID_Usuario: '2', Nombre: 'María Pérez (Estudiante)', Correo: 'm.perez@unet.edu.ve', ID_Rol: 1 },
            { ID_Usuario: '3', Nombre: '', Correo: 'invitado@unet.edu.ve', ID_Rol: 3 },
          ]);
        }
        setLoading(false);
      };

      fetchUsuarios();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtrados = usuarios.filter(usr => {
    const searchLow = searchTerm.toLowerCase();
    const matchesNombre = usr.Nombre && usr.Nombre.toLowerCase().includes(searchLow);
    const matchesCorreo = usr.Correo && usr.Correo.toLowerCase().includes(searchLow);
    return matchesNombre || matchesCorreo;
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
              onClick={onClose}
            />

            {/* Panel Derecha */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] overflow-y-auto bg-[#f9f9f9] flex flex-col pt-[30px] rounded-none sm:rounded-l-[30px] z-[80] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-[30px] w-full mb-[20px] shrink-0">
                <div className="flex gap-[15px] items-center">
                  <div className="bg-blue-100 flex items-center justify-center rounded-full w-[50px] h-[50px] shrink-0">
                    <MdPerson className="text-[#155dfc] text-[28px]" />
                  </div>
                  <div className="flex flex-col font-['Plus_Jakarta_Sans']">
                    <span className="font-bold text-[#101828] text-[20px] leading-[26px]">Gestionar Usuarios</span>
                    <span className="font-medium text-gray-500 text-[14px]">Directorio de miembros</span>
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
                  onChange={e => setSearchTerm(e.target.value)}
                  showFilter={false}
                  placeholder="Buscar por nombre o correo..."
                />
              </div>

              {/* Content List */}
              <div className="flex-1 overflow-y-auto px-[30px] flex flex-col gap-3 pb-[100px] font-['Plus_Jakarta_Sans']">
                {loading ? (
                  <Spinner text="Cargando directorio de usuarios..." />
                ) : filtrados.length === 0 ? (
                  <div className="text-center font-sans text-gray-500 py-10 bg-gray-50 rounded-[10px] border border-gray-200">
                    No se encontraron usuarios.
                  </div>
                ) : (
                  filtrados.map((usr) => {
                    const isAdmin = usr.ID_Rol === 2;
                    const isInvitado = usr.ID_Rol === 3 || usr.ID_Rol === 0 || !usr.Nombre;
                    const isEstudiante = usr.ID_Rol === 1 && !isInvitado;

                    const nombreMuestra = isInvitado ? 'Usuario Invitado' : (usr.Nombre || 'Sin Nombre');
                    const initialLetter = isInvitado ? 'I' : (usr.Nombre ? usr.Nombre.charAt(0).toUpperCase() : 'U');

                    let avatarClass = 'bg-gray-100 text-gray-600';
                    if (isAdmin) avatarClass = 'bg-[#ffeedd] text-[#e8701a]';
                    if (isEstudiante) avatarClass = 'bg-blue-100 text-[#155dfc]';

                    return (
                      <div
                        key={usr.ID_Usuario}
                        className="flex items-center gap-[15px] bg-white p-[15px] rounded-[15px] shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
                      >
                        {/* Avatar */}
                        <div className={`flex items-center justify-center w-[45px] h-[45px] rounded-full shrink-0 ${avatarClass}`}>
                          <span className="font-bold text-[18px]">{initialLetter}</span>
                        </div>

                        {/* Info Usuario */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className={`font-semibold text-[15px] text-[#101828] truncate ${isInvitado ? 'italic text-gray-500' : ''}`}>
                              {nombreMuestra}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-[13px] mt-0.5">
                            <MdEmail className="shrink-0" />
                            <span className="truncate">{usr.Correo || 'Sin Correo'}</span>
                          </div>

                          {/* Chips de Rol */}
                          <div className="flex mt-1">
                            {isAdmin && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-[#e8701a] bg-[#ffeedd] px-1.5 py-0.5 rounded-md uppercase tracking-wider w-fit">
                                <MdAdminPanelSettings className="text-[12px]" /> Admin
                              </span>
                            )}
                            {isEstudiante && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-[#155dfc] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider w-fit">
                                <MdSchool className="text-[12px]" /> Estudiante
                              </span>
                            )}
                            {isInvitado && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider w-fit">
                                <MdHourglassEmpty className="text-[12px]" /> Pendiente
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingUser(usr)}
                            className="w-10 h-10 rounded-full bg-blue-50 text-[#155dfc] flex items-center justify-center hover:bg-[#155dfc] hover:text-white transition-colors"
                            title="Editar usuario"
                          >
                            <MdEdit className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sticky Bottom Area: Invitar Usuario */}
              <div className="absolute bottom-0 left-0 right-0 p-[30px] bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent pointer-events-none">
                <button
                  onClick={() => setIsInviting(true)}
                  className="w-full bg-[#155dfc] hover:bg-blue-700 transition-colors rounded-[16px] py-[14px] flex justify-center items-center gap-2 shadow-lg hover:shadow-xl pointer-events-auto"
                >
                  <MdPersonAdd className="text-white text-[24px]" />
                  <span className="text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px]">
                    Invitar a usuario
                  </span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <EditarUsuario
        isOpen={!!editingUser}
        usuario={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={(updated) => {
          // Here we could add supabase update logic
          // For now, we simply update the state locally 
          setUsuarios(prev => prev.map(u => u.ID_Usuario === updated.ID_Usuario ? updated : u));
          setEditingUser(null);
        }}
      />

      <InvitarUsuario
        isOpen={isInviting}
        onClose={() => setIsInviting(false)}
        onInvite={(newUser) => {
          // En una implementación real, esto haría un insert en Supabase
          // y se le asignaría un ID. Por ahora, mockeamos el nuevo usuario:
          const mockedUser = {
            ...newUser,
            ID_Usuario: Date.now().toString(),
          };
          setUsuarios(prev => [...prev, mockedUser]);
          setIsInviting(false);
        }}
      />
    </>
  );
}
