import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base de publicación. Por defecto la raíz del dominio '/', que es lo que usan
// Vercel, Netlify, los previews y el dev server. Para publicar en GitHub Pages
// (proyecto servido bajo /Grimorio/) hacé el build con la env var GH_PAGES=1:
//   GH_PAGES=1 npm run build
// Se evita depender de detectar el proveedor: por defecto SIEMPRE es raíz.
export default defineConfig(() => ({
  base: process.env.GH_PAGES ? '/Grimorio/' : '/',
  plugins: [react()],
  server: { open: true },
}));
