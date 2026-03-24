import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const extraHosts = env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',').map(h => h.trim()).filter(Boolean) : [];
  const defaultHosts = ['localhost', '127.0.0.1', 'coresemin-tarapaca.omtecnologia.cl', 'coresemintarapaca.cl', 'web.coresemintarapaca.cl'];
  const hostVariants = extraHosts.flatMap(h => [h, `${h}:80`, `${h}:443`]);
  const allowedHosts = Array.from(new Set([...defaultHosts, ...extraHosts, ...hostVariants]));

  return {
      server: {
        port: 4174,
        host: '0.0.0.0',
        watch: {
          // ignore server folder so Vite doesn't react to backend changes
          ignored: ['**/server/**']
        },
        allowedHosts: allowedHosts
      },
      plugins: [
        react(),
        tailwindcss()
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
