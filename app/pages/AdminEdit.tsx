import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleBySlug, updateArticle } from '../services/dataService';
import { Article, ContentBlock } from '../types';
import { Icons } from '../components/Icons';
import { CORE_COLOR } from '../constants';

const AdminEdit: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('auth_token');
    const apiBase = (import.meta as any).env.VITE_FRONTEND_URL || '';
    const base = apiBase.replace(/\/(?:api\/?)?$/i, '');

    const [id, setId] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [coverImage, setCoverImage] = useState<string | File>('');
    const [category, setCategory] = useState<'Noticia' | 'Evento' | 'Capacitación' | 'Blog'>('Noticia');
    const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [blockFiles, setBlockFiles] = useState<{[key: string]: File}>({});
    const [gallery, setGallery] = useState<(string | File)[]>([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        if (slug) {
            (async () => {
                const article = await getArticleBySlug(slug);
                if (article) {
                    setId(article.id);
                    setTitle(article.title);
                    setSubtitle(article.subtitle || '');
                    setCoverImage(article.coverImage || '');
                    setCategory(article.category as any);
                    setPublishDate(new Date(article.publishDate).toISOString().split('T')[0]);
                    setBlocks(article.blocks || []);
                    setGallery(article.gallery || []);
                }
                setLoading(false);
            })();
        }
    }, [token, slug, navigate]);

  // Simple UID generator
  const generateId = () => Math.random().toString(36).substr(2, 9);

    const addBlock = (type: 'text' | 'image' | 'heading' | 'link') => {
        const newBlock: ContentBlock = {
            id: generateId(),
            type,
            content: type === 'image' ? '/CORESEMIN-LOGO.png' : '',
            linkName: type === 'link' ? 'Leer más' : undefined,
            styles: { width: 'full', align: 'left' }
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id: string, content: string, linkName?: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content, linkName: linkName !== undefined ? linkName : b.linkName } : b));
    };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !subtitle) return;

        const updatedArticle: Article = {
          id,
          slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          title,
          subtitle,
          coverImage,
          author: 'Admin Coresemin',
          publishDate: new Date(publishDate).toISOString(),
          category,
          blocks,
          gallery: gallery as any
        };

        (async () => {
            try {
                await updateArticle(id, updatedArticle, token || undefined, blockFiles);
                setSuccessMsg('Noticia actualizada exitosamente!');
                setTimeout(() => {
                    setSuccessMsg('');
                    navigate('/admin');
                }, 2000);
            } catch (err) {
                setSuccessMsg('Error al actualizar. Revisa permisos.');
            }
        })();
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-900 px-8 py-6 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Icons.Settings className="text-green-500"/> Editar Noticia
                </h1>
                <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white transition-colors">
                    Volver al panel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {successMsg && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">¡Éxito!</strong>
                        <span className="block sm:inline"> {successMsg}</span>
                    </div>
                )}

                {/* Meta Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                placeholder="Ej: Nueva campaña de seguridad"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value as any)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                            >
                                <option value="Noticia">Noticia</option>
                                <option value="Evento">Evento</option>
                                <option value="Capacitación">Capacitación</option>
                                <option value="Blog">Blog</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Publicación</label>
                            <input 
                                type="date" 
                                value={publishDate}
                                onChange={(e) => setPublishDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                                required
                            />
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Portada</label>
                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors cursor-pointer relative group">
                            <input 
                                type="file" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setCoverImage(file);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept="image/*"
                            />
                            <div className="space-y-1 text-center">
                                {coverImage ? (
                                    <div className="flex flex-col items-center">
                                        {typeof coverImage === 'string' ? (
                                            <img src={coverImage} alt="Preview" className="h-32 w-full object-cover rounded-md mb-2" />
                                        ) : (
                                            <div className="text-sm text-gray-600 mb-2">
                                                <Icons.Check className="w-8 h-8 text-green-500 mx-auto mb-1" />
                                                {coverImage.name}
                                            </div>
                                        )}
                                        <span className="text-xs text-green-600 font-semibold">Click para cambiar imagen</span>
                                    </div>
                                ) : (
                                    <>
                                        <Icons.Image className="mx-auto h-12 w-12 text-gray-400 group-hover:text-green-500" />
                                        <div className="flex text-sm text-gray-600">
                                            <span>Cargar un archivo</span>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                                    </>
                                )}
                            </div>
                         </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo / Bajada</label>
                    <textarea 
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                        rows={2}
                        placeholder="Breve resumen de la noticia..."
                        required
                    />
                </div>

                {/* Content Builder */}
                <div className="border-t border-gray-100 pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Bloques de Contenido</h3>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => addBlock('heading')} className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                                <Icons.Type className="w-4 h-4" /> Título
                            </button>
                            <button type="button" onClick={() => addBlock('text')} className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                                <Icons.Layout className="w-4 h-4" /> Texto
                            </button>
                            <button type="button" onClick={() => addBlock('image')} className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                                <Icons.Image className="w-4 h-4" /> Imagen
                            </button>
                            <button type="button" onClick={() => addBlock('link')} className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                                <Icons.ExternalLink className="w-4 h-4" /> Botón/Link
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200 min-h-[200px]">
                        {blocks.length === 0 && <p className="text-center text-gray-400 py-10">Agrega bloques de contenido para comenzar.</p>}
                        
                        {blocks.map((block, index) => (
                            <div key={block.id} className="group relative bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-green-300 transition-colors">
                                {/* Tools */}
                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Icons.ChevronRight className="w-4 h-4 -rotate-90"/></button>
                                    <button type="button" onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Icons.ChevronRight className="w-4 h-4 rotate-90"/></button>
                                    <button type="button" onClick={() => removeBlock(block.id)} className="p-1 hover:bg-red-50 text-red-500 rounded"><Icons.Trash2 className="w-4 h-4"/></button>
                                </div>

                                <div className="pr-12">
                                    <span className="text-xs font-bold text-gray-400 uppercase mb-2 block">{block.type === 'heading' ? 'Subtítulo' : block.type}</span>
                                    
                                    {block.type === 'image' ? (
                                        <div className="flex gap-4">
                                            <div className="w-1/3 aspect-video bg-gray-100 rounded overflow-hidden relative group/img">
                                                <img 
                                                    src={block.content.startsWith('http') || block.content.startsWith('blob:') ? block.content : `${base}${block.content}`} 
                                                    className="w-full h-full object-cover" 
                                                    alt="Preview"
                                                />
                                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold">
                                                    Cambiar Imagen
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setBlockFiles({ ...blockFiles, [block.id]: file });
                                                                updateBlock(block.id, URL.createObjectURL(file));
                                                            }
                                                        }}
                                                        accept="image/*"
                                                    />
                                                </label>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500">Origen de la imagen</label>
                                                <div className="flex flex-col gap-2 mt-1">
                                                    <input 
                                                        type="text" 
                                                        value={block.content.startsWith('blob:') ? 'Imagen local cargada' : block.content} 
                                                        disabled
                                                        className="w-full p-2 text-sm border rounded bg-gray-50 text-gray-400"
                                                    />
                                                    <p className="text-[10px] text-gray-400">Para mejores resultados usa imágenes horizontales.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : block.type === 'link' ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Nombre del botón</label>
                                                    <input 
                                                        type="text" 
                                                        value={block.linkName || ''} 
                                                        onChange={(e) => updateBlock(block.id, block.content, e.target.value)}
                                                        placeholder="Ej: Descargar PDF o Ver sitio web"
                                                        className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-green-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">URL (Link)</label>
                                                    <input 
                                                        type="text" 
                                                        value={block.content} 
                                                        onChange={(e) => updateBlock(block.id, e.target.value)}
                                                        placeholder="https://ejemplo.com"
                                                        className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-green-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded text-xs">
                                                <Icons.Info className="w-4 h-4" />
                                                Este bloque se verá como un botón destacado en la noticia.
                                            </div>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={block.content}
                                            onChange={(e) => updateBlock(block.id, e.target.value)}
                                            className={`w-full p-2 border-none focus:ring-0 resize-none bg-transparent ${block.type === 'heading' ? 'font-bold text-xl' : 'text-gray-600'}`}
                                            placeholder={block.type === 'heading' ? 'Escribe un subtítulo...' : 'Escribe el párrafo aquí...'}
                                            rows={block.type === 'heading' ? 1 : 3}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Gallery Manager */}
                <div className="border-t border-gray-100 pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Galería de Imágenes</h3>
                        <label className="cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition flex items-center gap-2">
                             <Icons.Plus className="w-4 h-4" /> Agregar Fotos
                            <input 
                                type="file" 
                                multiple 
                                className="hidden" 
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    setGallery([...gallery, ...files]);
                                }}
                                accept="image/*"
                            />
                        </label>
                    </div>
                    
                    {gallery.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {gallery.map((item, idx) => (
                                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group border border-gray-200">
                                    <img 
                                        src={typeof item === 'string' ? item : URL.createObjectURL(item)} 
                                        className="w-full h-full object-cover" 
                                        alt={`Gallery ${idx}`}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                                    >
                                        <Icons.Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <Icons.Image className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">No hay imágenes en la galería.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-8">
                    <button 
                        type="submit"
                        className="px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                        style={{ backgroundColor: CORE_COLOR }}
                    >
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  );
};

export default AdminEdit;
