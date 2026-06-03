import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getArticles, deleteArticle } from '../services/dataService';
import { Article } from '../types';
import { Icons } from '../components/Icons';
import { CORE_COLOR } from '../constants';

const AdminDashboard: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('auth_token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        loadArticles();
    }, [token, navigate]);

    const loadArticles = async () => {
        try {
            const data = await getArticles();
            setArticles(data.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()));
        } catch (err) {
            setError('Error al cargar noticias');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar esta noticia?')) return;
        try {
            await deleteArticle(id, token || '');
            setArticles(articles.filter(a => a.id !== id));
        } catch (err) {
            alert('Error al eliminar noticia');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        navigate('/login');
    };

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
                    <Link to="/admin" className="flex items-center gap-3 p-3 rounded-lg bg-green-600/20 text-green-400 font-semibold">
                        <Icons.Layout className="w-5 h-5" /> Noticias
                    </Link>
                    <Link to="/admin/events" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-400 transition-colors">
                        <Icons.Calendar className="w-5 h-5" /> Eventos
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
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Gestión de Noticias</h2>
                        <p className="text-gray-500 mt-1">Administra el contenido del sitio web</p>
                    </div>
                    <Link 
                        to="/admin/create" 
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg transform hover:scale-105 transition-all"
                        style={{ backgroundColor: CORE_COLOR }}
                    >
                        <Icons.Plus className="w-5 h-5" /> Nueva Noticia
                    </Link>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Cargando noticias...</div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">{error}</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 font-semibold text-gray-700">Título</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Categoría</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Fecha</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {articles.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                    <img src={article.image || article.coverImage} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <span className="font-semibold text-gray-900 line-clamp-1">{article.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(article.publishDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/noticia/${article.slug}`)}
                                                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Ver"
                                                >
                                                    <Icons.Eye className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/admin/edit/${article.slug}`)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Icons.Edit className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(article.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Icons.Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
