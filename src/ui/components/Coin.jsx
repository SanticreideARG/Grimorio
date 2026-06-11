// Coin.jsx — Símbolo de moneda (oro del juego) dibujado como SVG vectorial.
// Reemplaza al emoji 🪙, que no existe en algunas versiones de Windows y se
// veía vacío en otros equipos. Al ser SVG inline es idéntico en todo dispositivo
// y funciona sin conexión. Se dimensiona en `em` para alinear con el texto.

export default function Coin({ className = '', title = 'Oro' }) {
  return (
    <svg
      className={`coin-ico ${className}`}
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      focusable="false"
    >
      <defs>
        <radialGradient id="coinFace" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#f7e3a8" />
          <stop offset="55%" stopColor="#e7b24e" />
          <stop offset="100%" stopColor="#a9762f" />
        </radialGradient>
      </defs>
      {/* Disco exterior */}
      <circle cx="12" cy="12" r="11" fill="url(#coinFace)" stroke="#7a4e16" strokeWidth="1.5" />
      {/* Bisel interior */}
      <circle cx="12" cy="12" r="8.4" fill="none" stroke="#8a5a1c" strokeWidth="1" opacity="0.7" />
      {/* Estrella central grabada (coherente con la energía arcana ✦) */}
      <path
        d="M12 5.6 L13.5 10.5 L18.4 12 L13.5 13.5 L12 18.4 L10.5 13.5 L5.6 12 L10.5 10.5 Z"
        fill="#5e3c12"
        opacity="0.85"
      />
      {/* Brillo */}
      <ellipse cx="8.6" cy="7.6" rx="2.6" ry="1.6" fill="#fff6dc" opacity="0.55" transform="rotate(-30 8.6 7.6)" />
    </svg>
  );
}
