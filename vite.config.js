import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base según el destino de publicación:
//  - Vercel / Netlify (dominio raíz)     → '/'
//  - GitHub Pages (proyecto /Grimorio/)  → '/Grimorio/'
//  - Servidor de desarrollo              → '/'
// Vercel y Netlify exponen estas env vars en su entorno de build, así que
// detectamos la raíz automáticamente sin romper el deploy de GitHub Pages.
export default defineConfig(({ command }) => {
  const rootHost = Boolean(process.env.VERCEL || process.env.NETLIFY);
  return {
    base: command === 'build' && !rootHost ? '/Grimorio/' : '/',
    plugins: [react()],
    server: { open: true },
  };
});
