import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CORE_COLOR } from '../constants';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // TODO: replace with real authentication against backend.
    if (!email || !password) {
      setError('Ingrese correo y contraseña');
      return;
    }

    try {
      // Simulate authentication success and store a token
      localStorage.setItem('auth_token', 'demo-token');
      navigate(from, { replace: true });
    } catch (err) {
      setError('Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-2">Iniciar sesión</h2>
        <p className="text-sm text-gray-500 mb-6">Accede con tu correo y contraseña para ingresar al área de administración.</p>
        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white font-bold w-full" style={{ backgroundColor: CORE_COLOR }}>Iniciar sesión</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
