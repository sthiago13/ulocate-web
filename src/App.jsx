import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient' // Ajusta si la ruta es distinta

import LandingPage from './pages/LandingPage'
import DesktopLogin from './pages/DesktopLogin'
import DesktopRegistro from './pages/DesktopRegistro'
import Home from './pages/Home'

function App() {
  const [session, setSession] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // 1. Revisar la sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsCheckingAuth(false)
    })

    // 2. Escuchar cambios (cuando el usuario hace login o logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

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

        {/* Rutas Protegidas (Si NO tiene sesión, lo regresamos al Login) */}
        <Route 
          path="/home" 
          element={session ? <Home /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App