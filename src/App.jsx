import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient' // Ajusta si la ruta es distinta

import LandingPage from './pages/LandingPage'
import PanelLogin from './pages/PanelLogin'
import PanelRegistro from './pages/PanelRegistro'
import PanelRecuperar from './pages/PanelRecuperar'
import Home from './pages/Home'
import ExplorePage from './pages/ExplorePage'

function App() {
  const [session, setSession] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let isInitialLoad = true;

    const verifyAndSetSession = async (currentSession) => {
      if (currentSession) {
        // Verificamos si el usuario está activo en la base de datos
        const { data: usuarioDB, error } = await supabase
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
      
      // Actualizamos la sesión solo si es distinta para evitar re-renders innecesarios
      setSession(currentSession);
      
      // Solo desactivamos isCheckingAuth después de la primera verificación exitosa
      if (isInitialLoad) {
        setIsCheckingAuth(false);
        isInitialLoad = false;
      }
    };

    // 1. Revisar la sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      verifyAndSetSession(initialSession);
    });

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        verifyAndSetSession(currentSession);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsCheckingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {isCheckingAuth ? (
        <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
          <p className="font-jakarta text-lg">Cargando U-Locate...</p>
        </div>
      ) : (
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LandingPage session={session} />} />
          <Route path="/explorar" element={<ExplorePage session={session} />} />
          
          {/* Rutas para invitados */}
          <Route 
            path="/login" 
            element={!session ? <PanelLogin /> : <Navigate to="/home" replace />} 
          />
          <Route 
            path="/registro" 
            element={!session ? <PanelRegistro /> : <Navigate to="/home" replace />} 
          />
          <Route 
            path="/recuperar" 
            element={!session ? <PanelRecuperar /> : <Navigate to="/home" replace />} 
          />

          {/* Rutas Protegidas */}
          <Route 
            path="/home" 
            element={session ? <Home /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      )}

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