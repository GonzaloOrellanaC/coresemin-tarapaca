import React from 'react';
import { Icons } from '../components/Icons';
import { CORE_COLOR } from '../constants';

const Blogs: React.FC = () => {
  // Mock Data for full Blogs page
  const blogs = [
    {
        id: 1,
        title: "Automatización en Flotación: El Futuro del Procesamiento",
        excerpt: "Las nuevas tecnologías de celdas neumáticas y control avanzado mediante Machine Learning están reduciendo el consumo energético en un 15% y mejorando la recuperación de ley.",
        image: "https://images.unsplash.com/photo-1626084772352-7df7831d10e5?q=80&w=800&auto=format&fit=crop",
        date: "12 Octubre, 2024",
        author: "Dr. Juan Pérez",
        tags: ["Innovación", "Procesos", "Energía"]
    },
    {
        id: 2,
        title: "Hidrógeno Verde en Minería: Casos de Éxito en Tarapacá",
        excerpt: "Pilotos recientes en la región demuestran la viabilidad técnica y económica para la implementación de celdas de combustible en camiones CAEX de alto tonelaje.",
        image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=800&auto=format&fit=crop",
        date: "05 Octubre, 2024",
        author: "Ing. María González",
        tags: ["Sustentabilidad", "Hidrógeno", "Transporte"]
    },
    {
        id: 3,
        title: "Seguridad 4.0: IA para la Prevención de Fatiga",
        excerpt: "Sistemas de visión computarizada no invasivos están revolucionando la forma en que monitoreamos la salud y el estado de alerta de los operadores en tiempo real.",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
        date: "28 Septiembre, 2024",
        author: "Comité de Seguridad",
        tags: ["Seguridad", "IA", "Salud Ocupacional"]
    },
    {
        id: 4,
        title: "Lixiviación de Sulfuros Primarios",
        excerpt: "Avances en tecnologías de biolixiviación permiten recuperar cobre de minerales sulfurados de baja ley que anteriormente se consideraban estériles.",
        image: "https://images.unsplash.com/photo-1599939571322-792a326991f2?q=80&w=800&auto=format&fit=crop",
        date: "15 Septiembre, 2024",
        author: "Centro de Investigación",
        tags: ["Hidrometalurgia", "Innovación"]
    },
    {
        id: 5,
        title: "Gestión Hídrica Eficiente en el Desierto",
        excerpt: "Estrategias de recirculación y uso de agua de mar desalinizada están permitiendo a las faenas de Tarapacá operar con una huella hídrica continental mínima.",
        image: "https://images.unsplash.com/photo-1574689049597-7e6df3e2a029?q=80&w=800&auto=format&fit=crop",
        date: "02 Septiembre, 2024",
        author: "Departamento Ambiental",
        tags: ["Agua", "Medio Ambiente"]
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=1920&auto=format&fit=crop" className="w-full h-full object-cover" alt="Background"/>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Blogs Técnicos</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Análisis en profundidad, estudios técnicos y tendencias de la industria minera en Tarapacá.
            </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="space-y-8">
            {blogs.map((blog) => (
                <article key={blog.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col md:flex-row h-full md:h-64">
                    <div className="md:w-2/5 relative h-48 md:h-full">
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 flex gap-2">
                             {blog.tags.slice(0, 1).map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase rounded tracking-wider">
                                    {tag}
                                </span>
                             ))}
                        </div>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 uppercase font-bold tracking-wide">
                            <Icons.Calendar className="w-3 h-3" /> {blog.date}
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-green-600">{blog.author}</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 hover:text-green-700 transition-colors cursor-pointer">
                            {blog.title}
                        </h2>
                        <p className="text-gray-500 mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed">
                            {blog.excerpt}
                        </p>
                        <button className="text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: CORE_COLOR }}>
                            Leer artículo completo <Icons.ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </article>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;