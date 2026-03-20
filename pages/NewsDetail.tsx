import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug } from '../services/dataService';
import { Article } from '../types';
import { Icons } from '../components/Icons';
import { CORE_COLOR } from '../constants';

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const found = getArticleBySlug(slug);
      setArticle(found || null);
    }
    setLoading(false);
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent"></div></div>;
  
  if (!article) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Artículo no encontrado</h2>
        <Link to="/noticias" className="text-green-600 hover:underline">Volver a noticias</Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-16">
        {/* Header Image */}
        <div className="w-full h-[400px] md:h-[500px] relative">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 max-w-4xl mx-auto">
                <span className="inline-block px-3 py-1 rounded bg-green-600 text-white text-xs font-bold uppercase tracking-wide mb-3">{article.category}</span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 shadow-sm">{article.title}</h1>
                 <div className="flex items-center text-gray-300 text-sm gap-4">
                    <span className="flex items-center gap-1"><Icons.Calendar className="w-4 h-4"/> {new Date(article.publishDate).toLocaleDateString('es-CL')}</span>
                    <span className="flex items-center gap-1"><Icons.Users className="w-4 h-4"/> Por {article.author}</span>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
            <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed mb-10 border-l-4 pl-4 italic" style={{ borderColor: CORE_COLOR }}>
                {article.subtitle}
            </p>

            <div className="space-y-8">
                {article.blocks.map((block) => {
                    if (block.type === 'text') {
                        return (
                            <div key={block.id} className={`prose prose-lg text-gray-700 max-w-none ${block.styles?.align === 'center' ? 'text-center' : block.styles?.align === 'right' ? 'text-right' : 'text-left'}`}>
                                <p className={block.styles?.bold ? 'font-bold' : ''}>{block.content}</p>
                            </div>
                        );
                    } else if (block.type === 'image') {
                        return (
                            <figure key={block.id} className={`my-8 ${block.styles?.width === 'half' ? 'md:w-1/2 md:float-left md:mr-6' : 'w-full'}`}>
                                <img 
                                    src={block.content} 
                                    alt="Contenido articulo" 
                                    className="rounded-xl shadow-lg w-full object-cover"
                                />
                                {/* Optional caption logic could go here */}
                            </figure>
                        );
                    } else if (block.type === 'heading') {
                         return <h2 key={block.id} className="text-2xl font-bold text-gray-800 mt-8 mb-4">{block.content}</h2>
                    }
                    return null;
                })}
            </div>
            
             <div className="mt-16 pt-8 border-t border-gray-200">
                <Link to="/noticias" className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 font-medium transition">
                    <Icons.ArrowRight className="w-4 h-4 rotate-180" /> Volver al listado
                </Link>
            </div>
        </div>
    </div>
  );
};

export default NewsDetail;