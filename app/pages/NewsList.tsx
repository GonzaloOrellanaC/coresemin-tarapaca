import React, { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import { getArticles } from '../services/dataService';
import { Article } from '../types';
import { CORE_COLOR } from '../constants';

const NewsList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState('Todas');

  useEffect(() => {
    (async () => {
      const data = await getArticles();
      setArticles(data);
    })();
  }, []);

  const categories = ['Todas', 'Noticia', 'Capacitación', 'Evento'];

  const filteredArticles = filter === 'Todas' 
    ? articles 
    : articles.filter(a => a.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Noticias y Actualidad</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">Entérate de las últimas novedades, hitos y actividades de Coresemin Tarapacá.</p>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-4">
            <div className="inline-flex bg-white p-1 rounded-full shadow-sm border border-gray-200">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                            filter === cat 
                            ? 'text-white shadow-md' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        style={{ backgroundColor: filter === cat ? CORE_COLOR : 'transparent' }}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Grid */}
        {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
                <NewsCard key={article.id} article={article} />
            ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No se encontraron artículos en esta categoría.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;