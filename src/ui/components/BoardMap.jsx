// BoardMap.jsx — Render del mapa del capítulo desde datos.
// El fondo es la imagen real del capítulo (mapBg prop).
// El sendero SVG y los nodos se superponen sobre ella por %.

import { mapImages } from '../../data/mapImages.js';
import { assetUrl } from '../assets.js';
import { nodeLabel } from '../../systems/board.js';

// PNG art por tipo de nodo (assets/img/nodes/). Fallback a emoji si no existe.
const NODE_ART = {
  start:  'nodes/start.png',
  combat: 'nodes/combat.png',
  elite:  'nodes/elite.png',
  event:  'nodes/event.png',
  rest:   'nodes/rest.png',
  shop:   'nodes/shop.png',
  boss:   'nodes/boss.png',
};

// Emoji de fallback (sólo se usa si no hay PNG cargado)
const ICON = {
  start: '🚩',
  combat: '⚔️',
  elite: '☠️',
  event: '🃏',
  rest: '🛏️',
  shop: '💰',
  boss: '👑',
};

// Lienzo virtual (16:9) sobre el que se posicionan los nodos por %.
const W = 1920;
const H = 1080;

/** Catmull-Rom → Bézier: sendero suave que une los centros de los nodos. */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || pts[i + 1];
    const k = 0.16;
    const c1x = p1.x + (p2.x - p0.x) * k;
    const c1y = p1.y + (p2.y - p0.y) * k;
    const c2x = p2.x - (p3.x - p1.x) * k;
    const c2y = p2.y - (p3.y - p1.y) * k;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function BoardMap({ chapterId, nodes, currentIndex, visited, title, subtitle }) {
  const abs = nodes.map((n) => ({ x: (n.pos.x / 100) * W, y: (n.pos.y / 100) * H }));
  const path = smoothPath(abs);
  const traveled = smoothPath(abs.slice(0, currentIndex + 1));
  const bgImage = mapImages[chapterId];

  return (
    <div className="board" role="img" aria-label={`Mapa: ${title}`}>

      {/* Fondo: imagen real del capítulo */}
      {bgImage
        ? <img className="board__bg" src={bgImage} alt="" aria-hidden="true" />
        : <div className="board__parchment" />   /* fallback mientras no haya imagen */
      }

      {/* Viñeta sutil encima de la imagen para que los nodos resalten */}
      <div className="board__vignette" />

      {/* Sendero */}
      <svg className="board__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <filter id="roadblur" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <path d={path} className="board__road board__road--bed" filter="url(#roadblur)" />
        <path d={path} className="board__road board__road--mid" filter="url(#roadblur)" />
        <path d={path} className="board__road board__road--dots" />
        <path d={traveled} className="board__road board__road--done" />
      </svg>

      {/* Nodos (medallones) */}
      <div className="board__nodes">
        {nodes.map((n, i) => {
          const isCurrent = i === currentIndex;
          const isVisited = visited.includes(n.id);
          const isFuture = i > currentIndex;
          const cls = [
            'node',
            `node--${n.type}`,
            n.type === 'boss' ? 'node--boss' : '',
            isCurrent ? 'is-current' : '',
            isVisited ? 'is-visited' : '',
            isFuture ? 'is-future' : '',
          ].filter(Boolean).join(' ');
          return (
            <div
              key={n.id}
              className={cls}
              style={{ left: `${n.pos.x}%`, top: `${n.pos.y}%` }}
              title={n.name}
            >
              <NodeMedallion type={n.type} />
              <span className="node__num">{i + 1}</span>
              {isCurrent && <span className="node__pawn" aria-label="Tu posición" />}
            </div>
          );
        })}
      </div>

      {/* Cartela del título */}
      <div className="board__cartouche">
        <div className="board__sub">{subtitle}</div>
        <div className="board__title">{title}</div>
        <div className="board__orn">
          <span className="ln" />✦<span className="ln r" />
        </div>
      </div>

    </div>
  );
}

/** Medallón de nodo: muestra el PNG de arte si existe, fallback a emoji. */
function NodeMedallion({ type }) {
  const url = assetUrl(NODE_ART[type]);
  return (
    <div className="node__medallion">
      {url
        ? <img className="node__art" src={url} alt={nodeLabel(type)} draggable={false} />
        : <span className="node__icon">{ICON[type] ?? '•'}</span>
      }
    </div>
  );
}
