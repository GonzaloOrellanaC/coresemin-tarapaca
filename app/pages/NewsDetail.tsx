import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug } from '../services/dataService';
import { Article } from '../types';
import { Icons } from '../components/Icons';
import { CORE_COLOR } from '../constants';
import DOMPurify from 'dompurify';
import GallerySwiper from '../components/GallerySwiper';

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageBanner, setImageBanner] = useState<string | null>(null);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
  const apiBase = (import.meta as any).env.VITE_FRONTEND_URL;
  console.log('API Base URL:', apiBase);
  const base = apiBase.replace(/\/(?:api\/?)?$/i, '')

  useEffect(() => {
    if (article && article.coverImage) {
      setImageBanner((article.coverImage as string).includes('http') ? article.coverImage : `${base}${article.coverImage}`);
    } else {
        setImageBanner(`${apiBase}/public/CORESEMIN-LOGO.png`)
    }
  }, [article, base]);

  useEffect(() => {

  console.log('Image:', imageBanner);
  }, [imageBanner]);
  useEffect(() => {
    if (slug) {
            (async () => {
                const found = await getArticleBySlug(slug);
                setArticle(found || null);
            })();
    }
    setLoading(false);
  }, [slug]);

    // set meta tags for SEO and social
    useEffect(() => {
        if (!article) return;
        const title = `${article.title} - Coresemin Tarapacá`;
        const rawDesc = article.subtitle || article.blocks?.find(b => b.type === 'text')?.content || '';
        const desc = rawDesc.replace(/<[^>]*>/g, '').trim().slice(0, 200);
        document.title = title;

        const origin = window.location.origin.replace(/\/$/, '');
        let coverUrl = article.coverImage || '/public/CORESEMIN-LOGO.png';
        if (!coverUrl.startsWith('http')) {
          coverUrl = `${origin}${coverUrl.startsWith('/') ? '' : '/'}${coverUrl}`;
        }
        const currentUrl = window.location.href;

        const setMeta = (attr: string, key: string, content: string) => {
          let tag = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
          if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute(attr, key);
            document.head.appendChild(tag);
          }
          tag.content = content;
        };

        setMeta('name', 'description', desc);
        setMeta('property', 'og:type', 'article');
        setMeta('property', 'og:site_name', 'Coresemin Tarapacá');
        setMeta('property', 'og:title', title);
        setMeta('property', 'og:description', desc);
        setMeta('property', 'og:image', coverUrl);
        setMeta('property', 'og:image:secure_url', coverUrl);
        setMeta('property', 'og:url', currentUrl);

        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:title', title);
        setMeta('name', 'twitter:description', desc);
        setMeta('name', 'twitter:image', coverUrl);

    }, [article]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent"></div></div>;
  
  if (!article) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Artículo no encontrado</h2>
        <Link to="/noticias" className="text-green-600 hover:underline">Volver a noticias</Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-16">
            {/* JSON-LD for Article and Breadcrumbs */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    headline: article.title,
                    image: article.coverImage ? [article.coverImage] : [],
                    datePublished: new Date(article.publishDate).toISOString(),
                    author: { "@type": "Person", name: article.author || 'Coresemin' },
                    publisher: {
                        "@type": "Organization",
                        name: 'Coresemin Tarapacá',
                        logo: { "@type": "ImageObject", url: (window.location.origin.replace(/\/$/, '') + '/CORESEMIN-LOGO.png') }
                    },
                    mainEntityOfPage: { "@type": "WebPage", "@id": window.location.href }
                })}
            </script>
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    itemListElement: [
                        { "@type": "ListItem", position: 1, name: 'Inicio', item: window.location.origin.replace(/\/$/, '') + '/' },
                        { "@type": "ListItem", position: 2, name: 'Noticias', item: window.location.origin.replace(/\/$/, '') + '/noticias' },
                        { "@type": "ListItem", position: 3, name: article.title, item: window.location.href }
                    ]
                })}
            </script>
        {/* Header Image */}
        <div className="w-full h-[400px] md:h-[500px] relative">
            <img 
                src={imageBanner && (imageBanner.startsWith('http') || imageBanner.startsWith('blob:')) ? imageBanner : (imageBanner ? `${base}${imageBanner}` : '')} 
                alt={article.title} 
                className="w-full h-full object-cover" 
            />
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
            <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed mb-10 border-l-4 pl-4 italic whitespace-pre-wrap" style={{ borderColor: CORE_COLOR }}>
                {article.subtitle}
            </p>

            <div className="space-y-8">
                {article.blocks.map((block) => {
                    if (block.type === 'text') {
                        return (
                            <div key={block.id} className={`prose prose-lg text-gray-700 max-w-none whitespace-pre-wrap ${block.styles?.align === 'center' ? 'text-center' : block.styles?.align === 'right' ? 'text-right' : 'text-left'}`}>
                                <div className={block.styles?.bold ? 'font-bold' : ''} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content || '') }} />
                            </div>
                        );
                    } else if (block.type === 'image') {
                        const imgSrc = block.content.startsWith('http') || block.content.startsWith('blob:') ? block.content : `${base}${block.content}`;
                        return (
                            <figure key={block.id} className={`my-8 flex justify-center ${block.styles?.width === 'half' ? 'md:w-1/2 md:float-left md:mr-6' : 'w-full'}`}>
                                <img 
                                    src={imgSrc} 
                                    alt="Contenido articulo" 
                                    className="rounded-xl shadow-lg object-contain"
                                    style={{ maxHeight: '200px' }}
                                />
                                {/* Optional caption logic could go here */}
                            </figure>
                        );
                    } else if (block.type === 'link') {
                        const linkHref = block.content.startsWith('http') ? block.content : `${base}${block.content}`;
                        return (
                            <div key={block.id} className="my-8 flex justify-center">
                                <a 
                                    href={linkHref} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
                                >
                                    {block.linkName || 'Leer más'} <Icons.ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        );
                    } else if (block.type === 'heading') {
                         return <h2 key={block.id} className="text-2xl font-bold text-gray-800 mt-8 mb-4">{block.content}</h2>
                    }
                    return null;
                })}
            </div>

                        {/* Gallery (images) */}
                        {article.gallery && article.gallery.length > 0 && (() => {
                            const galleryFull = article.gallery!.map(p => p.startsWith('http') ? p : `${base}${p}`);
                            return (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Galería</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {galleryFull.map((src, idx) => (
                                            <figure key={idx} className="overflow-hidden rounded-lg">
                                                <button
                                                    onClick={() => { setGalleryIndex(idx); setGalleryOpen(true); }}
                                                    className="block w-full text-left"
                                                    aria-label={`Abrir imagen ${idx + 1} de la galería`}
                                                >
                                                    <img src={src} alt={`Galería ${idx + 1}`} className="w-full h-48 object-cover rounded-lg shadow-sm" />
                                                </button>
                                            </figure>
                                        ))}
                                    </div>

                                    {galleryOpen && (
                                        <GallerySwiper
                                            images={galleryFull}
                                            initialIndex={galleryIndex}
                                            onClose={() => setGalleryOpen(false)}
                                        />
                                    )}
                                </div>
                            );
                        })()}
            
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