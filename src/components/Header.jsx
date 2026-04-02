import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { MdMenu, MdClose } from "react-icons/md"

// 1. Recibimos la session como prop
export default function Header({ session }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { name: "Inicio", href: "#" },
        { name: "Características", href: "#features" },
        { name: "Cómo funciona", href: "#how-it-works" },
    ]

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg py-3" : "bg-transparent py-5"}`}>
            <nav className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer group">
                    <img className="w-8 md:w-10 transition-transform duration-300 group-hover:rotate-12" src={`${import.meta.env.BASE_URL}logoUnet.svg`} alt="Logo UNET" />
                    <h3 className="font-bold text-xl md:text-2xl tracking-tight text-gray-800">
                        <span className="text-blue-600">U</span>-Locate GPS
                    </h3>
                </div>

                {/* --- DESKTOP NAV --- */}
                <div className="hidden md:flex gap-8 items-center">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="h-6 w-px bg-gray-200 mx-2" />
                    
                    {/* Renderizado Condicional: Desktop */}
                    {session ? (
                        <Link 
                            to="/home"
                            className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 text-sm"
                        >
                            Abrir Mapa
                        </Link>
                    ) : (
                        <>
                            <Link 
                                to="/login"
                                className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link 
                                to="/registro"
                                className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 text-sm"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <MdClose className="w-7 h-7" /> : <MdMenu className="w-7 h-7" />}
                </button>
            </nav>

            {/* --- MOBILE MENU OVERLAY --- */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-lg font-bold text-gray-800"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <hr className="border-gray-100" />
                            <div className="flex flex-col gap-4">
                                
                                {/* Renderizado Condicional: Mobile */}
                                {session ? (
                                    <Link 
                                        to="/home"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 block text-center"
                                    >
                                        Abrir Mapa
                                    </Link>
                                ) : (
                                    <>
                                        <Link 
                                            to="/login"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full py-4 text-gray-600 font-bold border border-gray-100 rounded-2xl block text-center"
                                        >
                                            Iniciar Sesión
                                        </Link>
                                        <Link 
                                            to="/registro"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 block text-center"
                                        >
                                            Registrarse
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}