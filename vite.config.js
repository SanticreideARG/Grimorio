import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El repo se publica en GitHub Pages bajo /Grimorio/.
// En dev usamos base '/', en build la base del repo.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Grimorio/' : '/',
  plugins: [react()],
  server: { open: true },
}));
