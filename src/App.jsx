import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient' // Ajusta si la ruta es distinta

import LandingPage from './pages/LandingPage'
import DesktopLogin from './pages/DesktopLogin'
import DesktopRegistro from './pages/DesktopRegistro'
import DesktopRecuperar from './pages/DesktopRecuperar'
import Home from './pages/Home'

function App() {
  const [session, setSession] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const verifyAndSetSession = async (currentSession) => {
      if (currentSession) {
        const { data: usuarioDB } = await supabase
          .from('Usuario')
          .select('Activo')
          .eq('ID_Usuario', currentSession.user.id)
          .single();
        
        if (usuarioDB && usuarioDB.Activo === false) {
          await supabase.auth.signOut();
          setAuthError('Tu cuenta ha sido desactivada temporalmente. Por favor, comunícate con un administrador para restaurar el acceso.');
          setSession(null);
          setIsCheckingAuth(false);
          return;
        }
      }
      setSession(currentSession);
      setIsCheckingAuth(false);
    };

    // 1. Revisar la sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      verifyAndSetSession(session);
    });

    // 2. Escuchar cambios (cuando el usuario hace login o logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN') {
        setIsCheckingAuth(true); // volvemos a mostrar la pantalla de carga de ser necesario
        verifyAndSetSession(session);
      } else if (_event === 'SIGNED_OUT') {
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Muestra una pantalla de carga básica mientras verifica la sesión
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
        <p className="font-jakarta text-lg">Cargando U-Locate...</p>
      </div>
    )
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage session={session} />} />
        
        {/* Rutas para invitados (Si ya tiene sesión, lo mandamos directo al Home) */}
        <Route 
          path="/login" 
          element={!session ? <DesktopLogin /> : <Navigate to="/home" replace />} 
        />
        <Route 
          path="/registro" 
          element={!session ? <DesktopRegistro /> : <Navigate to="/home" replace />} 
        />
        <Route 
          path="/recuperar" 
          element={!session ? <DesktopRecuperar /> : <Navigate to="/home" replace />} 
        />

        {/* Rutas Protegidas (Si NO tiene sesión, lo regresamos al Login) */}
        <Route 
          path="/home" 
          element={session ? <Home /> : <Navigate to="/login" replace />} 
        />
      </Routes>

      {/* Auth Error Modal */}
      {authError && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex justify-center items-center p-4">
          <div className="bg-white rounded-[24px] p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[20px] text-gray-900 mb-2">Acceso Denegado</h3>
            <p className="font-['Plus_Jakarta_Sans'] text-[15px] text-gray-600 mb-6">{authError}</p>
            <button 
              onClick={() => setAuthError(null)}
              className="w-full bg-[#101828] text-white font-['Plus_Jakarta_Sans'] font-semibold py-3 px-4 rounded-[12px] hover:bg-black transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </BrowserRouter>
  )
}

export default App