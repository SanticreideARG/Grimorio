// BoardMap.jsx — Render del mapa del capítulo desde datos.
// El fondo es la imagen real del capítulo. Los nodos se posicionan por % sobre ella.

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


export default function BoardMap({ chapterId, nodes, currentIndex, visited, title, subtitle }) {
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
