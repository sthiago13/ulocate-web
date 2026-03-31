import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoUnet from '../assets/logo-unet.png';
import Button from './common/Button';
import InputField from './common/InputField';

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

function LogoEstandarUnetNegro({ className = '' }) {
  return (
    <div className={`flex items-center justify-center size-[100px] ${className}`}>
      <img alt="UNET Logo" className="w-full h-full object-contain" src={logoUnet} />
    </div>
  );
}

function MensajeCreacionDeCuenta({ className = '' }) {
  return (
    <div className={`flex flex-col gap-3 items-center justify-center w-full ${className}`}>
      <LogoEstandarUnetNegro />
      <div className="flex flex-col font-jakarta font-bold text-center">
        <h1 className="text-[24px] leading-tight text-black">Crea tu cuenta</h1>
        <p className="font-normal text-[16px] text-black mt-2">Únete a U-Locate y no te pierdas en el campus.</p>
      </div>
    </div>
  );
}

export default function Registro({ className = '' }) {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Intentando crear cuenta...");
    navigate("/home");
  };

  const handleVolver = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className={`bg-[#f9f9f9] border border-[#4a4a4a] flex flex-col gap-[30px] items-center px-6 py-10 sm:px-[25px] sm:py-[50px] rounded-[30px] w-full max-w-[626px] mx-auto shadow-sm ${className}`}>
      
      <form onSubmit={handleRegister} className="flex flex-col gap-[14px] items-center w-full sm:w-[556px]">
        
        {/* Header & Inputs */}
        <div className="flex flex-col gap-4 items-center w-full">
          <MensajeCreacionDeCuenta className="mb-4 sm:w-[408px]" />
          
          <div className="w-full sm:w-[534px] flex flex-col gap-4">
            <InputField 
              id="email"
              label="Correo"
              type="email"
              placeholder="Escribe tu correo universitario..."
              required
            />
            <InputField 
              id="password"
              label="Contraseña"
              type="password"
              placeholder="Escribe tu contraseña..."
              required
            />
            <InputField 
              id="confirm-password"
              label="Contraseña"
              type="password"
              placeholder="Escribe tu contraseña nuevamente..."
              required
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 items-center justify-between w-full sm:w-[534px] mt-6">
          <Button type="button" variant="secondary" onClick={handleVolver} className="sm:max-w-[153px]">
            Volver
          </Button>
          <Button type="submit" variant="primary" className="sm:max-w-[356px]">
            Registrarse
          </Button>
        </div>

      </form>

      {/* Footer */}
      <YaTienesUnaCuenta className="mt-4" />

    </div>
  );
}