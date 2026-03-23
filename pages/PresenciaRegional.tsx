import React from 'react'
import { Icons } from '../components/Icons'
import { CORE_COLOR } from '../constants'
import { Link } from 'react-router-dom'

const PresenciaRegional: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <header className="rounded-xl overflow-hidden mb-10 shadow-lg" style={{ background: 'linear-gradient(90deg, rgba(2,6,23,0.6), rgba(16,185,129,0.06))' }}>
        <div className="relative h-48 md:h-64 lg:h-72">
          <img
            src="/collahuasi-1.jpg"
            alt="Presencia Regional Tarapacá"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white">Presencia Regional</h1>
            <p className="text-sm md:text-base text-white/90 mt-2">Impactando en faenas y comunidades de toda la región de Tarapacá.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-md bg-green-50 flex items-center justify-center text-green-700"><Icons.MapPin className="w-6 h-6"/></div>
                <h3 className="font-bold text-gray-900">Cobertura Territorial</h3>
              </div>
              <p className="text-sm text-gray-500">Trabajamos en localidades mineras y centros urbanos, entregando apoyo técnico, formación y coordinación entre empresas y comunidades para mejorar la seguridad operacional.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-md bg-green-50 flex items-center justify-center text-green-700"><Icons.Users className="w-6 h-6"/></div>
                <h3 className="font-bold text-gray-900">Alianzas Estratégicas</h3>
              </div>
              <p className="text-sm text-gray-500">Coordinamos con empresas, autoridades y organismos técnicos para elevar los estándares de seguridad y salud ocupacional en faenas de distintas escalas.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-md bg-green-50 flex items-center justify-center text-green-700"><Icons.BookOpen className="w-6 h-6"/></div>
                <h3 className="font-bold text-gray-900">Capacitación y Eventos</h3>
              </div>
              <p className="text-sm text-gray-500">Programas de formación, jornadas técnicas y eventos que comparten buenas prácticas entre profesionales y equipos operativos.</p>
            </div>
          </div>

          <article className="prose prose-lg max-w-none text-gray-700 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Qué hacemos en Tarapacá</h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              <strong>Coresemin Tarapacá</strong> impulsa la seguridad minera mediante <strong>asesoría técnica</strong>, generación de conocimiento, capacitación y coordinación interinstitucional. Nuestro propósito es <strong>reducir riesgos</strong> y fortalecer culturas de seguridad sostenibles en el tiempo.
            </p>

            <hr className="border-t border-gray-200 my-6" />

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Actividades principales</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Formación y certificación:</strong> programas para operarios y mandos intermedios.</li>
              <li><strong>Auditorías y asesorías:</strong> implementación de buenas prácticas en faenas.</li>
              <li><strong>Foros y encuentros:</strong> intercambio técnico y soluciones operativas.</li>
              <li><strong>Vinculación comunitaria:</strong> proyectos de diálogo e integración local.</li>
            </ul>

            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded mb-6">
              <p className="mb-0 text-sm text-gray-800"><strong>Impacto clave:</strong> En 2024 apoyamos más de <strong>80 capacitaciones</strong> regionales, fortaleciendo competencias y reduciendo incidentes en faenas.</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Proyectos por comuna</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <h4 className="font-semibold text-gray-900">Iquique</h4>
                <p className="text-sm text-gray-500 mt-1">Programas de capacitación y mesas técnicas con empresas locales.</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <h4 className="font-semibold text-gray-900">Alto Hospicio</h4>
                <p className="text-sm text-gray-500 mt-1">Proyectos de prevención e integración con comunidades.</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <h4 className="font-semibold text-gray-900">Pozo Almonte</h4>
                <p className="text-sm text-gray-500 mt-1">Asesorías en faenas y jornadas de buenas prácticas.</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <h4 className="font-semibold text-gray-900">Pica</h4>
                <p className="text-sm text-gray-500 mt-1">Actividades de acercamiento y formación en terreno.</p>
              </div>
            </div>
          </article>
        </main>

        <aside>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h4 className="font-bold text-gray-900 mb-2">Contacto Regional</h4>
            <p className="text-sm text-gray-500 mb-4">Escríbenos para coordinar actividades, solicitar apoyo técnico o informarte sobre nuestros programas.</p>
            <Link to="/contacto" className="block text-center px-4 py-3 rounded-lg font-semibold" style={{ backgroundColor: CORE_COLOR, color: '#fff' }}>Contactar</Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h5 className="text-sm font-bold text-gray-900 mb-2">Estadísticas</h5>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-extrabold">+12</div>
                <div className="text-xs text-gray-500">Comunas impactadas</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold">+80</div>
                <div className="text-xs text-gray-500">Capacitaciones (2024)</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h5 className="text-sm font-bold text-gray-900 mb-2">Próximos eventos</h5>
            <p className="text-sm text-gray-500">Revisa nuestro calendario para jornadas y capacitaciones regionales.</p>
            <Link to="/eventos" className="mt-4 inline-block text-sm font-medium text-green-700">Ver eventos</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default PresenciaRegional
