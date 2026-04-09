import React, { useState, useEffect } from 'react';
import { MdClose, MdEdit, MdSave } from 'react-icons/md';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import ModalConfirmacion from '../common/ModalConfirmacion';
import Spinner from '../common/Spinner';
import InputField from '../common/InputField';

export default function UsuarioMiPerfil({ onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [userData, setUserData] = useState({ id: '', nombre: '', correo: '' });
  const [formData, setFormData] = useState({ nombre: '', passActual: '', passNueva: '', passRepetir: '' });
  
  // Estado para el modal de notificaciones
  const [modal, setModal] = useState({ isOpen: false, titulo: '', mensaje: '', color: '' });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setLoading(false);
        return;
      }
      
      const { data: dbUser, error: dbError } = await supabase
        .from('Usuario')
        .select('*')
        .eq('ID_Usuario', user.id)
        .single();
        
      if (dbUser) {
        setUserData({ id: dbUser.ID_Usuario, nombre: dbUser.Nombre, correo: dbUser.Correo });
        setFormData(prev => ({ ...prev, nombre: dbUser.Nombre }));
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    if (!formData.nombre.trim()) {
      setModal({ isOpen: true, titulo: 'Error', mensaje: 'El nombre no puede estar vacío.', color: 'bg-[#cd1e1e] hover:bg-red-800' });
      return;
    }

    const cambiandoPass = formData.passActual || formData.passNueva || formData.passRepetir;

    if (cambiandoPass) {
      if (!formData.passActual) {
        setModal({ isOpen: true, titulo: 'Error', mensaje: 'Debe ingresar su contraseña actual para cambiarla.', color: 'bg-[#cd1e1e] hover:bg-red-800' });
        return;
      }
      if (formData.passNueva !== formData.passRepetir) {
        setModal({ isOpen: true, titulo: 'Error', mensaje: 'Las nuevas contraseñas no coinciden.', color: 'bg-[#cd1e1e] hover:bg-red-800' });
        return;
      }
      if (formData.passNueva.length < 6) {
        setModal({ isOpen: true, titulo: 'Error', mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.', color: 'bg-[#cd1e1e] hover:bg-red-800' });
        return;
      }

      setLoading(true);
      // Validamos password actual haciendo un intento de inicio de sesión
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.correo,
        password: formData.passActual,
      });

      if (signInError) {
        setLoading(false);
        setModal({ isOpen: true, titulo: 'Error', mensaje: 'La contraseña actual es incorrecta.', color: 'bg-[#cd1e1e] hover:bg-red-800' });
        return;
      }
    } else {
      setLoading(true);
    }

    try {
      // 1. Actualizar Nombre en BD
      if (formData.nombre !== userData.nombre) {
        const { error: dbError } = await supabase
          .from('Usuario')
          .update({ Nombre: formData.nombre })
          .eq('ID_Usuario', userData.id);
          
        if (dbError) throw dbError;
        
        // Lo actualizamos también en la metadata de auth para consistencia
        await supabase.auth.updateUser({ data: { nombre_completo: formData.nombre } });
      }

      // 2. Actualizar clave en Auth
      if (cambiandoPass && formData.passNueva) {
        const { error: updateError } = await supabase.auth.updateUser({ password: formData.passNueva });
        if (updateError) throw updateError;
      }

      // Actualizamos estado en la vista
      setUserData(prev => ({ ...prev, nombre: formData.nombre }));
      setFormData(prev => ({ ...prev, passActual: '', passNueva: '', passRepetir: '' }));
      setIsEditing(false);
      setModal({ isOpen: true, titulo: 'Éxito', mensaje: 'Los datos se han actualizado correctamente.', color: 'bg-[#155dfc] hover:bg-blue-700' });
    } catch (err) {
      console.error(err);
      setModal({ isOpen: true, titulo: 'Error', mensaje: 'Hubo un error al guardar los cambios.', color: 'bg-[#cd1e1e] hover:bg-red-800' });
    } finally {
      setLoading(false);
    }
  };

  const initialLetter = userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
      />

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
            <div className="bg-[#0d3796] flex items-center justify-center rounded-full w-[60px] h-[60px] shrink-0">
              <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#f9f9f9] text-[24px]">
                {initialLetter}
              </span>
            </div>
            <div className="flex flex-col font-['Plus_Jakarta_Sans'] text-[20px] justify-center">
              <span className="font-medium text-[#101828] leading-[26px]">Mi perfil</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-[#e9e9e9] hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <MdClose className="text-gray-700 text-[24px]" />
          </button>
        </div>

        {/* Body */}
        {loading && !userData.id ? (
          <Spinner text="Cargando perfil..." />
        ) : (
          <div className="flex flex-col gap-[39px] w-full">
            
            {/* View Mode */}
            {!isEditing && (
              <>
                <div className="flex flex-col gap-[24px] w-full mt-4">
                  <div className="flex flex-col gap-[8px]">
                    <span className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-gray-500 uppercase tracking-wider">Nombre Completo</span>
                    <span className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#040f0f] font-semibold">{userData.nombre}</span>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <span className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-gray-500 uppercase tracking-wider">Correo Institucional</span>
                    <span className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#040f0f] font-semibold">{userData.correo}</span>
                  </div>
                </div>

                <div className="w-full mt-[20px] flex justify-center pb-8 border-t border-gray-100 pt-6">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-[#155dfc] hover:bg-blue-700 transition-colors w-full rounded-[13px] py-[10px] flex justify-center items-center h-[50px] gap-2"
                  >
                    <MdEdit className="text-white text-[24px]" />
                    <span className="text-[#f9f9f9] font-['Inter'] font-normal text-[20px]">
                      Editar Datos
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* Edit Mode */}
            {isEditing && (
              <>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-[#101828] mb-[-10px]">Edición de Datos Básicos</h3>
                <div className="flex flex-col gap-[20px] w-full">
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                      className="bg-white border border-[#090909] rounded-[8px] p-[12px] h-[62px] w-full font-['Plus_Jakarta_Sans'] text-[16px] text-[#040f0f] focus:outline-none focus:ring-2 focus:ring-[#155dfc]"
                    />
                  </div>

                  <div className="flex flex-col gap-[8px]">
                    <label className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
                      Correo (Institucional)
                    </label>
                    <input
                      type="email"
                      value={userData.correo}
                      disabled
                      className="bg-gray-100 border border-gray-300 rounded-[8px] p-[12px] h-[62px] w-full font-['Plus_Jakarta_Sans'] text-[16px] text-gray-500 cursor-not-allowed"
                    />
                    <span className="text-xs text-gray-400 font-['Plus_Jakarta_Sans']">Para cambiar tu correo institucional contacta al administrador.</span>
                  </div>
                </div>

                <div className="flex flex-col gap-[16px] w-full">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-[#101828] mb-2">Seguridad</h3>
                  <div className="flex flex-col gap-[8px]">
                    <InputField
                      id="passActual"
                      label="Contraseña actual"
                      type="password"
                      name="passActual"
                      value={formData.passActual}
                      onChange={handleChange}
                      placeholder="Requerido si cambias tu clave..."
                    />
                  </div>

                  <div className="flex flex-col gap-[8px]">
                    <InputField
                      id="passNueva"
                      label="Contraseña nueva"
                      type="password"
                      name="passNueva"
                      value={formData.passNueva}
                      onChange={handleChange}
                      placeholder="Escribe tu nueva contraseña..."
                    />
                    {formData.passNueva.length > 0 && formData.passNueva.length < 6 && (
                      <span className="text-xs text-red-500 mt-[-4px] ml-1">La contraseña debe tener al menos 6 caracteres</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-[8px]">
                    <InputField
                      id="passRepetir"
                      label="Repite tu nueva contraseña"
                      type="password"
                      name="passRepetir"
                      value={formData.passRepetir}
                      onChange={handleChange}
                      placeholder="Escribe de nuevo tu nueva contraseña..."
                    />
                    {formData.passRepetir.length > 0 && formData.passRepetir !== formData.passNueva && (
                      <span className="text-xs text-red-500 mt-[-4px] ml-1">Las contraseñas no coinciden</span>
                    )}
                  </div>
                </div>

                {/* Footer Edit */}
                <div className="w-full mt-[10px] flex justify-between gap-4 pb-8">
                  <button 
                    onClick={() => {
                        setIsEditing(false);
                        setFormData(prev => ({ ...prev, passActual: '', passNueva: '', passRepetir: '', nombre: userData.nombre })); 
                    }}
                    className="bg-[#e9e9e9] hover:bg-gray-300 text-gray-700 transition-colors w-full rounded-[13px] py-[10px] flex justify-center items-center h-[50px] font-medium"
                  >
                    <span className="font-['Inter'] text-[20px]">
                      Cancelar
                    </span>
                  </button>
                  <button 
                    onClick={guardarCambios}
                    disabled={loading}
                    className="bg-[#155dfc] hover:bg-blue-700 disabled:opacity-50 transition-colors w-full rounded-[13px] py-[10px] flex justify-center items-center h-[50px] gap-2"
                  >
                    <MdSave className="text-white text-[24px]" />
                    <span className="text-[#f9f9f9] font-['Inter'] font-normal text-[20px]">
                      {loading ? "Guardando..." : "Guardar"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Modal de Feedback */}
      <ModalConfirmacion 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        titulo={modal.titulo}
        mensaje={modal.mensaje}
        textoConfirmar="Entendido"
        textoCancelar={null}
        colorConfirmar={modal.color}
      />
    </>
  );
}
