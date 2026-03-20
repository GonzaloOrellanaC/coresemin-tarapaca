import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icons } from './Icons';
import { CORE_COLOR, LOGO_URL } from '../constants';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Noticias', path: '/noticias' },
    { name: 'Eventos', path: '/eventos' },
    { name: 'Blogs', path: '/blogs' },
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
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path) 
                    ? `text-[${CORE_COLOR}] bg-green-50` 
                    : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                }`}
                style={{ color: isActive(link.path) ? CORE_COLOR : undefined }}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/admin" 
              className="px-4 py-2 rounded-full text-white text-sm font-medium transition transform hover:scale-105 shadow-sm"
              style={{ backgroundColor: CORE_COLOR }}
            >
              Admin
            </Link>
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

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
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
             <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              >
                Administrador
              </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;