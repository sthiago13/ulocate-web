import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DesktopLogin from './pages/DesktopLogin'
import DesktopRegistro from './pages/DesktopRegistro'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<DesktopLogin />} />
        <Route path="/registro" element={<DesktopRegistro />} />
        {/* Aquí podrás añadir más rutas (ej. /dashboard) en el futuro */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
