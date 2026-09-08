import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  previewMiningActivityLink, 
  createMiningActivity, 
  updateMiningActivity, 
  getMiningActivityById 
} from '../services/dataService';
import { MiningActivityItem } from '../types';
import { Icons } from '../components/Icons';
import { CORE_COLOR } from '../constants';

const AdminMiningActivityForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token') || '';

  // Input states
  const [inputUrl, setInputUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('/CORESEMIN-LOGO.png');
  const [sourcePlatform, setSourcePlatform] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (isEditing && id) {
      (async () => {
        setLoading(true);
        const item = await getMiningActivityById(id);
        if (item) {
          setTitle(item.title || '');
          setDescription(item.description || '');
          setUrl(item.url || '');
          setInputUrl(item.url || '');
          setImageUrl(item.imageUrl || '/CORESEMIN-LOGO.png');
          setSourcePlatform(item.sourcePlatform || '');
          setAuthorName(item.authorName || '');
          setPublishDate(item.publishDate ? item.publishDate.split('T')[0] : new Date().toISOString().split('T')[0]);
        } else {
          setError('No se encontró la publicación especificada');
        }
        setLoading(false);
      })();
    }
  }, [id, isEditing, token, navigate]);

  const handleFetchPreview = async () => {
    if (!inputUrl.trim()) {
      setScrapeError('Por favor ingresa un enlace válido');
      return;
    }
    setIsScraping(true);
    setScrapeError('');
    try {
      const data = await previewMiningActivityLink(inputUrl.trim(), token);
      setUrl(data.url || inputUrl.trim());
      setTitle(data.title || '');
      setDescription(data.description || '');
      setImageUrl(data.imageUrl || '/CORESEMIN-LOGO.png');
      setSourcePlatform(data.sourcePlatform || '');
      setAuthorName(data.authorName || '');
      setPublishDate(data.publishDate || new Date().toISOString().split('T')[0]);
    } catch (err: any) {
      setScrapeError('No fue posible obtener los datos automáticos. Puedes completar los campos manualmente.');
      setUrl(inputUrl.trim());
      if (!imageUrl) setImageUrl('/CORESEMIN-LOGO.png');
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setError('El título y la URL de destino son obligatorios');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const payload: Partial<MiningActivityItem> = {
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        imageUrl: imageUrl.trim() || '/CORESEMIN-LOGO.png',
        sourcePlatform: sourcePlatform.trim(),
        authorName: authorName.trim(),
        publishDate: publishDate || new Date().toISOString().split('T')[0]
      };

      if (isEditing && id) {
        await updateMiningActivity(id, payload, token);
      } else {
        await createMiningActivity(payload, token);
      }

      navigate('/admin/mining-activities');
    } catch (err: any) {
      setError('Error al guardar: ' + (err?.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-green-600 mr-2" />
        <span>Cargando publicación...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Icons.Settings className="text-green-500 w-6 h-6" /> Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-400 transition-colors">
            <Icons.Layout className="w-5 h-5" /> Noticias
          </Link>
          <Link to="/admin/mining-activities" className="flex items-center gap-3 p-3 rounded-lg bg-green-600/20 text-green-400 font-semibold">
            <Icons.Activity className="w-5 h-5" /> Actividad Minera
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-red-900/20 text-red-500 transition-colors"
          >
            <Icons.LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl">
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link 
              to="/admin/mining-activities" 
              className="text-sm font-semibold text-gray-500 hover:text-green-700 flex items-center gap-1 mb-2 transition-colors"
            >
              <Icons.ChevronRight className="w-4 h-4 rotate-180" /> Volver a la lista
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Publicación' : 'Nueva Publicación por Enlace'}
            </h2>
            <p className="text-gray-500 mt-1">
              Ingresa la URL externa para extraer los datos automáticamente, revísalos y publica la tarjeta.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
            <Icons.Info className="w-5 h-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Bloque de Extracción de Enlace */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Icons.Globe className="w-5 h-5 text-green-600" /> 
              Cargar datos desde URL (Scraping Automático)
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Pega el link de la publicación (LinkedIn, medios de comunicación, portales mineros o redes sociales) para autocompletar la tarjeta.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="url" 
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://ejemplo.com/noticia-o-publicacion-minera"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition"
              />
              <button
                type="button"
                onClick={handleFetchPreview}
                disabled={isScraping || !inputUrl.trim()}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-green-700 hover:bg-green-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0 shadow-md"
              >
                {isScraping ? (
                  <>
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extrayendo datos...</span>
                  </>
                ) : (
                  <>
                    <Icons.Search className="w-4 h-4" />
                    <span>Obtener Vista Previa</span>
                  </>
                )}
              </button>
            </div>
            {scrapeError && (
              <p className="text-xs text-amber-700 mt-2">{scrapeError}</p>
            )}
          </div>

          {/* Formulario de Revisión y Edición */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              Detalles de la Publicación
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Título de la Publicación <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Título descriptivo de la actividad o noticia"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Descripción / Bajada
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Breve resumen o extracto de la publicación..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    URL Destino (Enlace a la fuente) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    URL de la Imagen
                  </label>
                  <input 
                    type="text" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/CORESEMIN-LOGO.png"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">Si no se especifica o falla, se utilizará el logo oficial de CORESEMIN.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Plataforma de Origen
                  </label>
                  <input 
                    type="text" 
                    value={sourcePlatform}
                    onChange={(e) => setSourcePlatform(e.target.value)}
                    placeholder="Ej: LinkedIn, Portal Minero, Emol"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Nombre de quien publica (Autor / Medio)
                  </label>
                  <input 
                    type="text" 
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ej: Cía. Minera Doña Inés de Collahuasi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Fecha de Publicación
                  </label>
                  <input 
                    type="date" 
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Vista Previa de la Tarjeta Final */}
            <div className="pt-4 border-t border-gray-100">
              <span className="block text-xs font-bold uppercase text-gray-500 mb-3">
                Vista previa de cómo se verá en el Landing:
              </span>
              <div className="max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[16/10] w-full bg-gray-100">
                    <img 
                      src={imageUrl || '/CORESEMIN-LOGO.png'} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/CORESEMIN-LOGO.png'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                    {sourcePlatform && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 text-xs font-bold text-white uppercase rounded-full shadow-md bg-[#028938]/90">
                          {sourcePlatform}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center text-xs font-semibold text-gray-400 mb-2 gap-2">
                      <Icons.Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{publishDate || 'Fecha de hoy'}</span>
                      {authorName && (
                        <>
                          <span>•</span>
                          <span className="text-gray-600 line-clamp-1">{authorName}</span>
                        </>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 text-base line-clamp-2 leading-snug">
                      {title || 'Título de la tarjeta...'}
                    </h4>
                    {description && (
                      <p className="text-gray-600 text-xs mt-2 line-clamp-3 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-5 pb-4 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span className="flex items-center gap-1">
                    Ver publicación original
                    <Icons.ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Link 
                to="/admin/mining-activities"
                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                style={{ backgroundColor: CORE_COLOR }}
              >
                {isSaving ? (
                  <>
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Icons.Save className="w-4 h-4" />
                    <span>{isEditing ? 'Guardar Cambios' : 'Publicar Tarjeta'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminMiningActivityForm;
