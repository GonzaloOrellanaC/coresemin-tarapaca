import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icons } from './Icons';
import { CORE_COLOR, LOGO_URL, SOCIAL_LINKS } from '../constants';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Noticias', path: '/noticias' },
    { name: 'Eventos', path: '/eventos' },
    { name: 'Blog', path: '/blogs' },
    { name: 'Contacto', path: '/contacto' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20"> {/* Increased height slightly for logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <img 
                src={LOGO_URL} 
                alt="Coresemin Tarapacá Logo" 
                className="h-14 w-auto transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="flex flex-col justify-center">
                <span className="font-bold text-lg leading-none text-gray-800 tracking-tight hidden sm:block">
                  CORESEMIN
                </span>
                <span className="font-bold text-sm leading-none tracking-widest hidden sm:block" style={{ color: CORE_COLOR }}>
                  TARAPACÁ
                </span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center">
            <ul className="flex items-center space-x-4">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    aria-current={isActive(link.path) ? 'page' : undefined}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? `text-[${CORE_COLOR}] bg-green-50`
                        : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                    }`}
                    style={{ color: isActive(link.path) ? CORE_COLOR : undefined }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <ul>
            <div className="flex items-center gap-3 ml-4">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-700 transition-colors">
                <Icons.Facebook className="w-5 h-5" />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-700 transition-colors">
                <Icons.Twitter className="w-5 h-5" />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-700 transition-colors">
                <Icons.Instagram className="w-5 h-5" />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-700 transition-colors">
                <Icons.Linkedin className="w-5 h-5" />
              </a>
            </div>
            </ul>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <Icons.X className="block h-6 w-6" /> : <Icons.Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with translation transition (0.5s) */}
      <div
        className={`md:hidden bg-white border-t border-gray-100 transform transition-all duration-500 ease-out overflow-hidden ${
          isOpen ? 'translate-y-0 opacity-100 max-h-screen pointer-events-auto' : '-translate-y-4 opacity-0 max-h-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.path)
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-3 px-3 pt-4">
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-700 transition-colors">
              <Icons.Facebook className="w-5 h-5" />
            </a>
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-700 transition-colors">
              <Icons.Twitter className="w-5 h-5" />
            </a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-700 transition-colors">
              <Icons.Instagram className="w-5 h-5" />
            </a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-700 transition-colors">
              <Icons.Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;