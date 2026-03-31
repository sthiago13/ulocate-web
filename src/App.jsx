import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DesktopLogin from './pages/DesktopLogin'
import DesktopRegistro from './pages/DesktopRegistro'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<DesktopLogin />} />
        <Route path="/registro" element={<DesktopRegistro />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
