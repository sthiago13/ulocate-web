import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Ajusta la ruta según dónde esté exactamente este componente
import logoULocate from '../assets/logo_ulocate_final.png';
import Button from './common/Button';
import InputField from './common/InputField';
import ModalConfirmacion from './common/ModalConfirmacion';

function NoTienesUnaCuenta({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-[6px] font-inter text-[16px] whitespace-nowrap ${className}`}>
      <p className="text-black">
        ¿No tienes cuenta?
      </p>
      <Link to="/registro" className="text-[#155dfc] cursor-pointer hover:underline border-b border-transparent hover:border-[#155dfc] transition-colors">
        Registrate aquí
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

function MensajeBienvenidaLogin({ className = '' }) {
  return (
    <div className={`flex flex-col gap-3 items-center justify-center w-full ${className}`}>
      <LogoEstandarULocate />
      <div className="flex flex-col font-jakarta font-bold text-center">
        <h1 className="text-[24px] leading-tight text-black">Bienvenido de nuevo</h1>
        <p className="font-normal text-[16px] text-black mt-2">Ingresa tus credenciales para continuar....</p>
      </div>
    </div>
  );
}

export default function Login({ className = '' }) {
  const navigate = useNavigate();
  
  // 1. Añadimos estados para capturar la información del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, titulo: '', mensaje: '', color: '' });

  // 2. Transformamos la función en asíncrona para esperar a Supabase
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("Intentando iniciar sesión con:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Error devuelto por Supabase:", error.message);
      if (error.message.includes('Invalid login credentials')) {
        setModal({ 
          isOpen: true, 
          titulo: 'Acceso Denegado', 
          mensaje: 'Contraseña incorrecta, verifique si la escribió correctamente, si la olvidó, puede recuperarla aquí abajo!', 
          color: 'bg-[#cd1e1e] hover:bg-red-800' 
        });
      } else {
        setModal({ 
          isOpen: true, 
          titulo: 'Error de Red', 
          mensaje: 'Ocurrió un error al iniciar sesión. Intenta de nuevo.', 
          color: 'bg-[#cd1e1e] hover:bg-red-800' 
        });
      }
      setLoading(false);
      return;
    }

    console.log("¡Sesión iniciada!", data.user);
    // 3. Redirigimos al usuario al mapa tras el éxito
    navigate("/home"); 
  };

  const handleVolver = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className={`bg-[#f9f9f9] border border-[#4a4a4a] flex flex-col gap-[30px] items-center px-6 py-10 sm:px-[25px] sm:py-[50px] rounded-[30px] w-full max-w-[626px] mx-auto shadow-sm ${className}`}>
      
      <form onSubmit={handleLogin} className="flex flex-col gap-[14px] items-center w-full sm:w-[556px]">
        
        {/* Header & Inputs */}
        <div className="flex flex-col gap-4 items-center w-full">
          <MensajeBienvenidaLogin className="mb-4 sm:w-[408px]" />

          <div className="w-full flex-col flex gap-4 mt-2">
            {/* 4. Conectamos los Inputs con el estado */}
            <InputField 
              id="email"
              label="Correo"
              type="email"
              placeholder="Escribe tu correo universitario..."
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField 
              id="password"
              label="Contraseña"
              type="password"
              placeholder="Escribe tu contraseña..."
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 items-center justify-between w-full sm:w-[534px] mt-6">
          <Button type="button" variant="secondary" onClick={handleVolver} className="sm:max-w-[153px]" disabled={loading}>
            Volver
          </Button>
          <Button type="submit" variant="primary" className="sm:max-w-[356px]" disabled={loading}>
            {loading ? 'Cargando...' : 'Entrar'}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <div className="flex flex-col items-center gap-4 w-full mt-4">
        <NoTienesUnaCuenta />
        
        <Link to="/recuperar" className="text-gray-500 hover:text-[#155dfc] font-['Plus_Jakarta_Sans'] font-medium text-[14px] transition-colors border-b border-transparent hover:border-[#155dfc]">
          ¿Olvidó su contraseña? ¡Recupere el acceso aquí!
        </Link>
      </div>

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