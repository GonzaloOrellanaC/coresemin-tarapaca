import React from 'react';
import { CORE_COLOR } from '../constants';
import { Icons } from '../components/Icons';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="relative py-20 bg-gray-900">
        <div className="absolute inset-0 overflow-hidden">
             <img 
                src="https://coresemintarapaca.cl/wp-content/uploads/2020/06/b.jpg" 
                alt="Nosotros" 
                className="w-full h-full object-cover opacity-20"
            />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Quiénes Somos</h1>
            <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
                Una organización sin fines de lucro dedicada a promover la excelencia en seguridad dentro de la industria minera regional.
            </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        
        {/* Intro */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 relative">
                    Nuestra Historia
                    <span className="block h-1 w-20 mt-2 bg-green-600"></span>
                </h2>
                <div className="prose prose-lg text-gray-500">
                    <p>
                        Coresemin Tarapacá nació de la necesidad de unificar criterios y estándares de seguridad en la región. 
                        A lo largo de los años, hemos reunido a las principales empresas mineras, contratistas y autoridades 
                        para crear un ecosistema colaborativo.
                    </p>
                    <p className="mt-4">
                        Trabajamos día a día para que cada trabajador minero regrese sano y salvo a su hogar, fomentando 
                        el liderazgo y la innovación en prevención de riesgos.
                    </p>
                </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
                <img src="https://coresemintarapaca.cl/wp-content/uploads/2020/06/b.jpg" alt="Equipo Coresemin" className="w-full h-full object-cover" />
            </div>
        </div>

        {/* Vision / Mission Cards */}
        <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icons.Search className="w-32 h-32 text-green-700" />
                </div>
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-6 text-green-700">
                    <Icons.Search className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Visión</h3>
                <p className="text-gray-600 leading-relaxed">
                    Ser una corporación reconocida que agregue valor a la seguridad minera.
                </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icons.Layout className="w-32 h-32 text-green-700" />
                </div>
                 <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-6 text-green-700">
                    <Icons.Layout className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Misión</h3>
                <p className="text-gray-600 leading-relaxed">
                    Nuestros esfuerzos están dirigidos al sector minero de la región de Tarapacá a través de las buenas prácticas.
                </p>
            </div>

             <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icons.Settings className="w-32 h-32 text-green-700" />
                </div>
                 <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-6 text-green-700">
                    <Icons.Settings className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Objetivos</h3>
                <p className="text-gray-600 leading-relaxed">
                    Desarrollar y difundir las buenas prácticas en prevención de riesgos de accidentes y enfermedades profesionales en la minería.
                </p>
            </div>
        </div>

        {/* NEW: Strategic Pillars Section */}
        <section className="relative rounded-3xl overflow-hidden bg-gray-900 text-white p-8 md:p-12 lg:p-16">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            <div className="relative z-10 text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Enfoque Estratégico</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                    El enfoque definido para el desarrollo de este plan se sustenta en dos pilares fundamentales:
                </p>
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Pillar 1: Liderazgo */}
                <div className="group bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/15 transition duration-300">
                    <div className="flex items-start gap-6">
                        <div className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition duration-300">
                            <Icons.Award className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Liderazgo Activo</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Liderazgo de cada uno de los integrantes del consejo para poder transmitir las buenas prácticas en seguridad y salud ocupacional implementadas en sus propias empresas a las pequeñas empresas mineras de la región de Tarapacá.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pillar 2: Difusión */}
                <div className="group bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/15 transition duration-300">
                    <div className="flex items-start gap-6">
                         <div className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition duration-300">
                            <Icons.Megaphone className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Difusión y Vinculación</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Difusión del quehacer del consejo, actividades que nos posicione en el inconsciente colectivo de los habitantes de la región, que conozcan lo que hacemos y cómo podemos apoyarlos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
};

export default About;