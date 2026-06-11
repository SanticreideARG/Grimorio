import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App.jsx';

// Fuentes auto-hospedadas (Fontsource) → empaquetadas por Vite, funcionan
// 100% offline. Antes se cargaban de Google Fonts (requería internet).
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/500.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/cinzel-decorative/700.css';
import '@fontsource/cinzel-decorative/900.css';
import '@fontsource/im-fell-english/400.css';
import '@fontsource/im-fell-english/400-italic.css';

import './ui/styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
