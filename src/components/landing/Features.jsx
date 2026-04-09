import { motion } from "framer-motion"
import { MdOutlineLocationOn, MdSearch, MdOutlineMap } from "react-icons/md"

const features = [
    {
        title: "Navegación Precisa",
        description: "Encuentra cualquier aula o laboratorio dentro del campus de la UNET con una precisión asombrosa.",
        icon: <MdOutlineLocationOn className="w-8 h-8 text-blue-600" />
    },
    {
        title: "Búsqueda Instantánea",
        description: "Filtra por edificios, departamentos o servicios estudiantiles y obtén resultados al momento.",
        icon: <MdSearch className="w-8 h-8 text-blue-600" />
    },
    {
        title: "Siempre Actualizado",
        description: "Mapas dinámicos que reflejan los cambios en el campus, eventos y nuevas instalaciones.",
        icon: <MdOutlineMap className="w-8 h-8 text-blue-600" />
    }
]

export default function Features() {
    return (
        <section className="py-16 md:py-24 px-6 md:px-10 bg-gray-50/50" id="features">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-gray-900 mb-4"
                    >
                        Todo lo que necesitas para tu <span className="text-blue-600">día a día</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 text-lg max-w-2xl mx-auto"
                    >
                        Diseñado para estudiantes y profesores que buscan optimizar su tiempo en la universidad.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group"
                        >
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 transition-colors duration-300"
                            >
                                {feature.icon}
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
