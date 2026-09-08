import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getMiningActivities, 
  deleteMiningActivity 
} from '../services/dataService';
import { MiningActivityItem } from '../types';
import { Icons } from '../components/Icons';
import { CORE_COLOR } from '../constants';

const AdminMiningActivities: React.FC = () => {
  const [activities, setActivities] = useState<MiningActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token') || '';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getMiningActivities(50);
      setActivities(list);
    } catch (err: any) {
      setError('Error al cargar actividades mineras');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta publicación de Actividad Minera?')) return;
    try {
      await deleteMiningActivity(id, token);
      setActivities(prev => prev.filter(a => (a.id !== id && a._id !== id)));
      setSuccessMsg('Publicación eliminada correctamente');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert('Error al eliminar publicación');
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
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Gestión de Actividad Minera</h2>
            <p className="text-gray-500 mt-1">
              Agrega enlaces de medios o redes sociales para generar tarjetas automáticas con vista previa
            </p>
          </div>
          <Link 
            to="/admin/mining-activities/create"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg transform hover:scale-105 transition-all"
            style={{ backgroundColor: CORE_COLOR }}
          >
            <Icons.Plus className="w-5 h-5" /> Agregar por Link
          </Link>
        </header>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-2">
            <Icons.Check className="w-5 h-5 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Cargando actividades mineras...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">{error}</div>
          ) : activities.length === 0 ? (
            <div className="p-16 text-center text-gray-500 space-y-3">
              <Icons.Activity className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-lg font-semibold">No hay publicaciones de Actividad Minera</p>
              <p className="text-sm text-gray-400">Haz clic en "Agregar por Link" para publicar la primera tarjeta.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold text-gray-700">Publicación</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Plataforma / Autor</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Fecha</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activities.map((item) => {
                  const id = item.id || item._id || '';
                  return (
                    <tr key={id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <img 
                              src={item.imageUrl || '/CORESEMIN-LOGO.png'} 
                              className="w-full h-full object-cover" 
                              alt="" 
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/CORESEMIN-LOGO.png'; }}
                            />
                          </div>
                          <div className="max-w-md">
                            <span className="font-semibold text-gray-900 line-clamp-1 block">{item.title}</span>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-brand hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Icons.ExternalLink className="w-3 h-3" />
                              <span className="truncate">{item.url}</span>
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 block w-max mb-1">
                            {item.sourcePlatform || 'Web'}
                          </span>
                          <span className="text-gray-500 text-xs">{item.authorName || 'Sin autor'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {new Date(item.publishDate).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Ver enlace externo"
                          >
                            <Icons.ExternalLink className="w-5 h-5" />
                          </a>
                          <Link 
                            to={`/admin/mining-activities/edit/${id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Icons.Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Icons.Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminMiningActivities;
