import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPaginatedMiningActivities } from '../services/dataService';
import { MiningActivityItem } from '../types';
import { Icons } from '../components/Icons';
import { CORE_COLOR } from '../constants';

const MiningActivitiesList: React.FC = () => {
  const [activities, setActivities] = useState<MiningActivityItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const limit = 10;

  useEffect(() => {
    loadPage(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const loadPage = async (page: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await getPaginatedMiningActivities(page, limit);
      setActivities(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err: any) {
      setError('Error al cargar las publicaciones de actividad minera.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Principal */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Ecosistema & Novedades
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Actividad Minera
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Revisa las noticias, hitos de faenas y publicaciones más destacadas de la industria minera regional y nacional.
          </p>
        </div>

        {/* Estado de carga */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-3">
            <Icons.Loader2 className="w-10 h-10 animate-spin text-green-600" />
            <p className="text-sm font-medium">Cargando publicaciones...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center max-w-lg mx-auto">
            <p>{error}</p>
            <button 
              onClick={() => loadPage(currentPage)}
              className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition"
            >
              Reintentar
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 max-w-md mx-auto space-y-3">
            <Icons.Activity className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">No hay publicaciones disponibles</h3>
            <p className="text-sm text-gray-500">Pronto se agregarán nuevas noticias y artículos de actividad minera.</p>
          </div>
        ) : (
          <>
            {/* Grid de 10 Publicaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {activities.map((item, index) => (
                <a
                  key={item.id || item._id || index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/80 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    {/* Imagen con Overlay y Badge de Plataforma */}
                    <div className="relative overflow-hidden aspect-[16/10] w-full bg-gray-100">
                      <img
                        src={item.imageUrl || '/CORESEMIN-LOGO.png'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/CORESEMIN-LOGO.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                      
                      {item.sourcePlatform && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 text-xs font-bold text-white uppercase rounded-full shadow-md bg-[#028938]/90 backdrop-blur-sm">
                            {item.sourcePlatform}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className="p-6">
                      <div className="flex items-center text-xs font-semibold text-gray-400 mb-2.5 gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Icons.Calendar className="w-3.5 h-3.5" />
                          {new Date(item.publishDate).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        {item.authorName && (
                          <>
                            <span>•</span>
                            <span className="text-gray-600 line-clamp-1">{item.authorName}</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors text-lg line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-gray-600 text-sm mt-3 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer de la tarjeta */}
                  <div className="px-6 pb-6 pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-emerald-700 group-hover:text-emerald-800">
                    <span className="flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                      Ver publicación original
                      <Icons.ExternalLink className="w-4 h-4" />
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200/80 pt-8">
                <span className="text-sm text-gray-500 order-2 sm:order-1">
                  Mostrando página <strong className="text-gray-900">{currentPage}</strong> de <strong className="text-gray-900">{totalPages}</strong> ({totalItems} publicaciones en total)
                </span>

                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                  >
                    <Icons.ChevronRight className="w-4 h-4 rotate-180" />
                    <span>Anterior</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, idx, arr) => {
                        const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(p)}
                              className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                                p === currentPage
                                  ? 'text-white shadow-md'
                                  : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-200'
                              }`}
                              style={{
                                backgroundColor: p === currentPage ? CORE_COLOR : undefined
                              }}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                  >
                    <span>Siguiente</span>
                    <Icons.ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default MiningActivitiesList;
