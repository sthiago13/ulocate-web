import { MdEmail, MdLocationOn, MdOutlineLocationOn, MdOutlineMail } from "react-icons/md"

export default function Footer() {
    return (
        <footer className="bg-gray-900 pt-20 pb-10 px-6 md:px-10 text-white rounded-t-[3rem]">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <img className="w-10 brightness-0 invert" src={`${import.meta.env.BASE_URL}logo_ulocate_plano.svg`} alt="Logo U-Locate" />
                            <h3 className="font-bold text-2xl tracking-tight">
                                <span className="text-blue-500">U</span>-Locate GPS
                            </h3>
                        </div>
                        <div className="col-span-1 md:col-span-1 border-white/10">
                            <p className="text-gray-400 leading-relaxed">
                                La plataforma definitiva de posicionamiento y navegación para la comunidad universitaria de la UNET.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <img className="w-10 brightness-0 invert" src={`${import.meta.env.BASE_URL}logoUnet.svg`} alt="Logo UNET" />
                            <h4 className="align-center font-bold text-sm">Universidad Nacional Experimental del Táchira</h4>
                        </div>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="https://www.unet.edu.ve" className="hover:text-blue-500 transition-colors">Sitio Web UNET</a></li>
                            <li><a href="https://campuvirtual.com" className="hover:text-blue-500 transition-colors">Campus Virtual</a></li>
                            <li><a href="https://control.unet.edu.ve" className="hover:text-blue-500 transition-colors">Control de Estudios</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6">Contacto</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-center gap-3">
                                <MdOutlineMail className="w-5 h-5 text-blue-500" />
                                soporte@unet.edu.ve
                            </li>
                            <li className="flex items-center gap-3">
                                <MdOutlineLocationOn className="w-5 h-5 text-blue-500" />
                                San Cristóbal, Táchira, Venezuela
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} U-Locate GPS. Casi todos los derechos reservados.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                        <a href="#" className="hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
