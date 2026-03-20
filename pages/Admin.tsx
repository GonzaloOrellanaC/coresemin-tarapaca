import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Simulation
import { saveArticle } from '../services/dataService';
import { Article, ContentBlock } from '../types';
import { Icons } from '../components/Icons';
import { CORE_COLOR } from '../constants';

// Simple UID generator for browser environment without external deps
const generateId = () => Math.random().toString(36).substr(2, 9);

const Admin: React.FC = () => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [coverImage, setCoverImage] = useState('https://picsum.photos/800/400');
  const [category, setCategory] = useState<'Noticia' | 'Evento' | 'Capacitación'>('Noticia');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  const addBlock = (type: 'text' | 'image' | 'heading') => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: type === 'image' ? 'https://picsum.photos/seed/new/800/400' : '',
      styles: { width: 'full', align: 'left' }
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
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

    const newArticle: Article = {
      id: generateId(),
      slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      title,
      subtitle,
      coverImage,
      author: 'Admin Coresemin',
      publishDate: new Date().toISOString(),
      category,
      blocks
    };

    saveArticle(newArticle);
    setSuccessMsg('Noticia publicada exitosamente!');
    // Reset form
    setTitle('');
    setSubtitle('');
    setBlocks([]);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-900 px-8 py-6 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Icons.Settings className="text-green-500"/> Panel de Administración
                </h1>
                <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">v1.0.0</span>
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
                            </select>
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">URL Imagen Portada</label>
                         <input 
                            type="text" 
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm mb-2"
                        />
                        <div className="h-24 bg-gray-100 rounded-lg overflow-hidden relative">
                            <img src={coverImage} alt="Preview" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold bg-black/30">VISTA PREVIA</div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo / Bajada</label>
                    <textarea 
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-20 resize-none"
                        required
                    />
                </div>

                {/* Content Blocks Editor */}
                <div className="border-t border-gray-200 pt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Cuerpo de la Noticia</h3>
                        <div className="flex space-x-2">
                            <button type="button" onClick={() => addBlock('heading')} className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                                <Icons.Type className="w-4 h-4" /> Título
                            </button>
                            <button type="button" onClick={() => addBlock('text')} className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                                <Icons.Layout className="w-4 h-4" /> Texto
                            </button>
                            <button type="button" onClick={() => addBlock('image')} className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                                <Icons.Image className="w-4 h-4" /> Imagen
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
                                            <div className="w-1/3 aspect-video bg-gray-100 rounded overflow-hidden">
                                                <img src={block.content} className="w-full h-full object-cover" alt="Preview"/>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500">URL de la imagen</label>
                                                <input 
                                                    type="text" 
                                                    value={block.content} 
                                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                                    className="w-full p-2 text-sm border rounded mt-1"
                                                />
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

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        className="flex items-center gap-2 px-8 py-3 rounded-lg text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                        style={{ backgroundColor: CORE_COLOR }}
                    >
                        <Icons.Save className="w-5 h-5" /> Publicar Noticia
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;