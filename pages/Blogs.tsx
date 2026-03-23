import { Icons } from '../components/Icons';
import { CORE_COLOR } from '../constants';
import React, { useEffect, useState } from 'react';
import { Article } from '../types';
import { getArticles } from '../services/dataService';

const Blogs: React.FC = () => {
    const [blogs, setBlogs] = useState<Article[]>([]);

    useEffect(() => {
        (async () => {
            const all = await getArticles();
            // accept category 'Blog' (and 'Blog' if present)
            const filtered = all.filter(a => a.category === 'Blog');
            setBlogs(filtered);
        })();
    }, []);

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
            {blogs.length > 0 ? (
                blogs.map((blog) => (
                    <article key={blog.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col md:flex-row h-full md:h-64">
                        <div className="md:w-2/5 relative h-48 md:h-full">
                            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 uppercase font-bold tracking-wide">
                                <Icons.Calendar className="w-3 h-3" /> {new Date(blog.publishDate).toLocaleDateString('es-CL')}
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-green-600">{blog.author}</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 hover:text-green-700 transition-colors cursor-pointer">
                                {blog.title}
                            </h2>
                            <p className="text-gray-500 mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed">
                                {blog.subtitle}
                            </p>
                            <a href={`/noticia/${blog.slug}`} className="text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: CORE_COLOR }}>
                                Leer artículo completo <Icons.ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </article>
                ))
            ) : (
                <div className="text-center py-12 text-gray-500">Pronto se agregará contenido. Vuelve pronto.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Blogs;