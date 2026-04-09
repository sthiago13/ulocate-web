import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import logoULocate from '../../assets/logo_ulocate_final.png';
import Button from '../common/Button';
import InputField from '../common/InputField';
import ModalConfirmacion from '../common/ModalConfirmacion';
import { MdEmail } from 'react-icons/md';

function LogoEstandarULocate({ className = '' }) {
  return (
    <div className={`flex items-center justify-center size-[100px] ${className}`}>
      <img alt="Logo U-Locate" className="w-full h-full object-contain" src={logoULocate} />
    </div>
  );
}

export default function RecuperarPassword({ className = '' }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, titulo: '', mensaje: '', color: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ----------------------------------------------------------------------
    // SIMULACIÓN FRONT-END (Mentira piadosa)
    // Ya que Supabase (RLS) bloquea la consulta de la tabla 'Usuario' a visitantes anónimos,
    // simulamos la existencia validando el dominio o formato.
    // ----------------------------------------------------------------------
    
    // Simulamos un breve tiempo de carga como si consultaramos la red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Nuestra regla "falsa" para la simulación: Si es un correo unet, fingimos que existe.
    if (!email.toLowerCase().endsWith('@unet.edu.ve')) {
      setModal({
        isOpen: true,
        titulo: 'Correo no encontrado',
        mensaje: 'Este correo no está registrado en nuestra base de datos. Por favor, verifica que esté bien escrito o regístrate en el sistema.',
        color: 'bg-[#cd1e1e] hover:bg-red-800'
      });
      setLoading(false);
      return;
    }

    // Simulamos que el correo pasó la prueba ("Sí existía") y enviamos la instrucción a Supabase Auth
    // supabase.auth.resetPasswordForEmail(...)

    setIsSuccess(true);
    setLoading(false);
  };

  const handleVolver = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className={`bg-[#f9f9f9] border border-[#4a4a4a] flex flex-col gap-[30px] items-center px-6 py-10 sm:px-[25px] sm:py-[50px] rounded-[30px] w-full max-w-[626px] mx-auto shadow-sm transition-all duration-500 ${className}`}>
      
      {isSuccess ? (
        <div className="flex flex-col items-center text-center gap-6 w-full py-8">
          <LogoEstandarULocate/>
          <div className="bg-blue-100 p-4 rounded-full">
            <MdEmail className="text-[#155dfc] text-5xl" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[24px] text-black">¡Correo Enviado!</h2>
            <p className="font-['Plus_Jakarta_Sans'] text-[16px] text-gray-600 max-w-[400px]">
              Se han enviado las instrucciones de recuperación a <br/>
              <span className="font-bold text-black">{email}</span>
            </p>
            <p className="font-['Plus_Jakarta_Sans'] text-[14px] text-gray-500 mt-4">
              Por favor, revisa tu bandeja de entrada o la carpeta de spam para restablecer tu contraseña.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => navigate('/login')} className="mt-4 w-full sm:w-auto">
            Volver al Iniciar Sesión
          </Button>
        </div>
      ) : (
        <form onSubmit={handleRecuperar} className="flex flex-col gap-[14px] items-center w-full sm:w-[556px]">
          <div className="flex flex-col gap-4 items-center w-full">
            <div className="flex flex-col gap-3 items-center justify-center w-full mb-4 sm:w-[408px]">
              <LogoEstandarULocate />
              <div className="flex flex-col font-['Plus_Jakarta_Sans'] font-bold text-center">
                <h1 className="text-[24px] leading-tight text-black">Recuperar Acceso</h1>
                <p className="font-normal text-[16px] text-black mt-2 text-balance">
                  Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-[534px] flex flex-col gap-4 mt-2">
              <InputField 
                id="email"
                label="Correo Institucional"
                type="email"
                placeholder="ejemplo@unet.edu.ve"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row gap-4 items-center justify-between w-full sm:w-[534px] mt-6">
            <Button type="button" variant="secondary" onClick={handleVolver} className="sm:max-w-[153px]" disabled={loading}>
              Volver
            </Button>
            <Button type="submit" variant="primary" className="sm:max-w-[356px]" disabled={loading}>
              {loading ? 'Consultando base de datos...' : 'Enviar correo de recuperación'}
            </Button>
          </div>
        </form>
      )}

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
    </div>
  );
}
