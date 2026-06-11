// CardbackFlash.jsx — Overlay breve y no bloqueante que hace un flip de un
// cardback centrado en pantalla y se desvanece. Se usa para "anunciar" pociones,
// maldiciones y magias caras durante el combate. Controlado por useCardbackFlash.

import { useEffect, useState } from 'react';
import { assetUrl } from '../assets.js';

const CARDBACK_PATH = {
  pociones:    'cardbacks/pociones.png',
  maldiciones: 'cardbacks/maldiciones.png',
  magias:      'cardbacks/magias.png',
};

/** @param {{ flash: { id: string, key: number } | null }} props */
export default function CardbackFlash({ flash }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!flash) return undefined;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 820);
    return () => clearTimeout(t);
  }, [flash?.key]);

  if (!flash || !visible) return null;
  const url = assetUrl(CARDBACK_PATH[flash.id] ?? '');
  if (!url) return null;

  return (
    <div className="cardback-flash" aria-hidden="true">
      <div key={flash.key} className={`cardback-flash__card cardback-flash__card--${flash.id}`}>
        <img className="cardback-flash__img" src={url} alt="" />
      </div>
    </div>
  );
}
