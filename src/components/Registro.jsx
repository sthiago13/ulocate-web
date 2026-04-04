import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import logoULocate from '../assets/logo_ulocate_final.png';
import Button from './common/Button';
import InputField from './common/InputField';
import { MdEmail } from 'react-icons/md';

function YaTienesUnaCuenta({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-[6px] font-inter text-[16px] whitespace-nowrap ${className}`}>
      <p className="text-black">
        ¿Ya tienes una cuenta?
      </p>
      <Link to="/login" className="text-[#155dfc] cursor-pointer hover:underline border-b border-transparent hover:border-[#155dfc] transition-colors">
        Inicia sesión aquí
      </Link>
    </div>
  );
}

function LogoEstandarULocate({ className = '' }) {
  return (
    <div className={`flex items-center justify-center size-[100px] ${className}`}>
      <img alt="Logo U-Locate" className="w-full h-full object-contain" src={logoULocate} />
    </div>
  );
}

function MensajeCreacionDeCuenta({ className = '' }) {
  return (
    <div className={`flex flex-col gap-3 items-center justify-center w-full ${className}`}>
      <LogoEstandarULocate />
      <div className="flex flex-col font-jakarta font-bold text-center">
        <h1 className="text-[24px] leading-tight text-black">Crea tu cuenta</h1>
        <p className="font-normal text-[16px] text-black mt-2">Únete a U-Locate y no te pierdas en el campus.</p>
      </div>
    </div>
  );
}


export default function Registro({ className = '' }) {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Nuevo estado para controlar la pantalla de éxito
  const [isSuccess, setIsSuccess] = useState(false); 

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    // Mandamos el nombre como metadato para que el Trigger de SQL lo procese
    const { error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          nombre_completo: nombre, 
        }
      }
    });

    if (authError) {
      console.error("Error de Auth:", authError.message);
      setErrorMsg(authError.message); 
      setLoading(false);
      return;
    }

    // ¡Registro exitoso! Ocultamos el formulario y mostramos el mensaje.
    setIsSuccess(true);
    setLoading(false);
  };

  const handleVolver = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className={`bg-[#f9f9f9] border border-[#4a4a4a] flex flex-col gap-[30px] items-center px-6 py-10 sm:px-[25px] sm:py-[50px] rounded-[30px] w-full max-w-[626px] mx-auto shadow-sm transition-all duration-500 ${className}`}>
      
      {/* RENDERIZADO CONDICIONAL: Si fue exitoso, mostramos la pantalla de espera */}
      {isSuccess ? (
        <div className="flex flex-col items-center text-center gap-6 w-full py-8">
          <LogoEstandarUnetNegro />
          <div className="bg-blue-100 p-4 rounded-full">
            <MdEmail className="text-[#155dfc] text-5xl" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-jakarta font-bold text-[24px] text-black">¡Verifica tu correo!</h2>
            <p className="font-jakarta text-[16px] text-gray-600 max-w-[400px]">
              Hemos enviado un enlace de confirmación a <br/>
              <span className="font-bold text-black">{email}</span>
            </p>
            <p className="font-jakarta text-[14px] text-gray-500 mt-4">
              Por favor, haz clic en el enlace del correo para activar tu cuenta de U-Locate y poder iniciar sesión.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => navigate('/login')} className="mt-4 w-full sm:w-auto">
            Ir a Iniciar Sesión
          </Button>
        </div>
      ) : (
        /* Si NO ha sido exitoso, mostramos el formulario normal */
        <>
          <form onSubmit={handleRegister} className="flex flex-col gap-[14px] items-center w-full sm:w-[556px]">
            <div className="flex flex-col gap-4 items-center w-full">
              <MensajeCreacionDeCuenta className="mb-4 sm:w-[408px]" />
              
              {errorMsg && (
                <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm text-center font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="w-full sm:w-[534px] flex flex-col gap-4">
                <InputField 
                  id="nombre"
                  label="Nombre completo"
                  type="text"
                  placeholder="Escribe tu nombre y apellido..."
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <InputField 
                  id="email"
                  label="Correo Institucional"
                  type="email"
                  placeholder="ejemplo@unet.edu.ve"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <InputField 
                  id="password"
                  label="Contraseña"
                  type="password"
                  placeholder="Crea una contraseña..."
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputField 
                  id="confirm-password"
                  label="Confirmar Contraseña"
                  type="password"
                  placeholder="Escribe tu contraseña nuevamente..."
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-4 items-center justify-between w-full sm:w-[534px] mt-6">
              <Button type="button" variant="secondary" onClick={handleVolver} className="sm:max-w-[153px]" disabled={loading}>
                Volver
              </Button>
              <Button type="submit" variant="primary" className="sm:max-w-[356px]" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </Button>
            </div>
          </form>

          <YaTienesUnaCuenta className="mt-4" />
        </>
      )}
    </div>
  );
}