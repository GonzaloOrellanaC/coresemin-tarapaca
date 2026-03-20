import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { Icons } from './Icons';
import { CORE_COLOR } from '../constants';

interface NewsCardProps {
  article: Article;
  featured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, featured = false }) => {
  return (
    <div className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col ${featured ? 'md:col-span-2 md:flex-row' : 'h-full'}`}>
      <div className={`relative overflow-hidden ${featured ? 'md:w-2/3 h-64 md:h-auto' : 'h-48'}`}>
        <img 
          src={article.coverImage} 
          alt={article.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-bold text-white uppercase rounded-full tracking-wide shadow-sm" style={{ backgroundColor: CORE_COLOR }}>
                {article.category}
            </span>
        </div>
      </div>
      
      <div className={`p-6 flex flex-col justify-between ${featured ? 'md:w-1/3' : 'flex-1'}`}>
        <div>
          <div className="flex items-center text-xs text-gray-400 mb-3 space-x-2">
            <Icons.Calendar className="w-3 h-3" />
            <span>{new Date(article.publishDate).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <Link to={`/noticia/${article.slug}`}>
            <h3 className={`font-bold text-gray-800 mb-2 group-hover:text-[${CORE_COLOR}] transition-colors ${featured ? 'text-2xl' : 'text-lg line-clamp-2'}`}>
              {article.title}
            </h3>
          </Link>
          <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
            {article.subtitle}
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
           <Link 
            to={`/noticia/${article.slug}`}
            className="text-sm font-semibold flex items-center gap-1 transition-colors hover:gap-2"
            style={{ color: CORE_COLOR }}
          >
            Leer más <Icons.ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;