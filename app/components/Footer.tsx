import React from 'react';
import { SOCIAL_LINKS, CORE_COLOR, LOGO_URL } from '../constants';
import { Link } from 'react-router-dom';
import { Icons } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 shadow-lg shrink-0">
                    <img src={LOGO_URL} alt="Coresemin Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold leading-none">
                        <span style={{ color: CORE_COLOR }}>CORESEMIN</span>
                    </h3>
                    <h3 className="text-xl font-bold leading-none text-gray-100">
                        Tarapacá
                    </h3>
                </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mt-2">
              Comité Regional de Seguridad Minera. Promoviendo la cultura de seguridad, salud ocupacional y medio ambiente en la industria minera de la Región de Tarapacá.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-green-400 transition-colors flex items-center gap-2"><Icons.ChevronRight className="w-3 h-3"/> Inicio</Link></li>
              <li><Link to="/nosotros" className="hover:text-green-400 transition-colors flex items-center gap-2"><Icons.ChevronRight className="w-3 h-3"/> Nosotros</Link></li>
              <li><Link to="/noticias" className="hover:text-green-400 transition-colors flex items-center gap-2"><Icons.ChevronRight className="w-3 h-3"/> Noticias</Link></li>
              <li><Link to="/eventos" className="hover:text-green-400 transition-colors flex items-center gap-2"><Icons.ChevronRight className="w-3 h-3"/> Eventos</Link></li>
              <li><Link to="/blogs" className="hover:text-green-400 transition-colors flex items-center gap-2"><Icons.ChevronRight className="w-3 h-3"/> Blog</Link></li>
              <li><Link to="/contacto" className="hover:text-green-400 transition-colors flex items-center gap-2"><Icons.ChevronRight className="w-3 h-3"/> Contacto</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200">Síguenos</h4>
            <div className="flex space-x-4">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-[#1877F2] transition-colors group">
                <Icons.Facebook className="w-5 h-5 group-hover:text-white" />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-[#000000] transition-colors group">
                <Icons.Twitter className="w-5 h-5 group-hover:text-white" />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-[#E4405F] transition-colors group">
                <Icons.Instagram className="w-5 h-5 group-hover:text-white" />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-[#0A66C2] transition-colors group">
                <Icons.Linkedin className="w-5 h-5 group-hover:text-white" />
              </a>
            </div>
            <div className="mt-6 text-sm text-gray-500 space-y-1">
                <p className="flex items-center gap-2">
                    <Icons.Home className="w-4 h-4" /> Iquique, Región de Tarapacá, Chile
                </p>
                <p className="flex items-center gap-2">
                    <Icons.Menu className="w-4 h-4" /> contacto@coresemintarapaca.cl
                </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Coresemin Tarapacá. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;