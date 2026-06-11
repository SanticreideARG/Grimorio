// Dice.jsx — Símbolos y caras de dado renderizados con los PNG de assets/img/ui.
// Compartido por el combate (CombatScreen) y los chequeos de evento (EventScreen).
// Cada cara real tiene un único tipo de símbolo (o está vacía).

import { assetUrl } from '../assets.js';

// Imagen de símbolo de dado (con fallback a emoji si el asset no carga)
export const DIE_IMGS = {
  sword:  { path: 'ui/dado_espada',   fallback: '🗡️' },
  shield: { path: 'ui/dado_escudo',   fallback: '🛡️' },
  star:   { path: 'ui/dado_estrella', fallback: '⭐' },
};

// Símbolo de dado pequeño para usar inline (totales, coste de hechizo, umbrales).
// La imagen va sobre un mini-azulejo dorado con mezcla multiply para borrar
// su fondo blanco original.
export function DieSymbol({ type }) {
  const info = DIE_IMGS[type];
  const url  = info ? assetUrl(info.path + '.png') : null;
  if (!url) return <span className="die-sym die-sym--emoji">{info?.fallback ?? '·'}</span>;
  return (
    <span className="die-sym">
      <img className="die-sym__img" src={url} alt={info.fallback} />
    </span>
  );
}

// Cara del dado grande: la imagen del símbolo llena el cuadrado y el número
// (cantidad de símbolos de esa cara) se superpone en amarillo con glow.
export function DieFace({ face }) {
  const entry = face.sword ? ['sword', face.sword]
    : face.shield ? ['shield', face.shield]
    : face.star ? ['star', face.star]
    : null;
  if (!entry) return <span className="die-blank">·</span>;
  const [type, count] = entry;
  const info = DIE_IMGS[type];
  const url  = info ? assetUrl(info.path + '.png') : null;
  return (
    <>
      {url
        ? <img className="die-face__img" src={url} alt={info.fallback} />
        : <span className="die-face__emoji">{info?.fallback}</span>}
      <span className="die-face__num">{count}</span>
    </>
  );
}
