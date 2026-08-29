// BoardMap.jsx — Render del mapa del capítulo desde datos.
// El fondo es la imagen real del capítulo. Los nodos se posicionan por % sobre ella.

import { useEffect, useMemo, useRef } from 'react';
import { mapImages } from '../../data/mapImages.js';
import { assetUrl } from '../assets.js';
import { nodeLabel } from '../../systems/board.js';
import { BOARD_VIEWBOX, buildRouteSegments, getCameraTarget } from '../../systems/boardGeometry.js';

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
  const partyPawn = assetUrl('ui/party_pawn.webp');
  const compassRose = assetUrl('ui/compass_rose.webp');
  const viewportRef = useRef(null);
  const route = useMemo(() => buildRouteSegments(nodes), [nodes]);

  const centerParty = (behavior = 'smooth') => {
    const viewport = viewportRef.current;
    const target = getCameraTarget(nodes, currentIndex);
    if (!viewport || !target) return;
    const scaleX = viewport.scrollWidth / BOARD_VIEWBOX.width;
    const scaleY = viewport.scrollHeight / BOARD_VIEWBOX.height;
    viewport.scrollTo({
      left: Math.max(0, target.x * scaleX - viewport.clientWidth / 2),
      top: Math.max(0, target.y * scaleY - viewport.clientHeight / 2),
      behavior,
    });
  };

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = requestAnimationFrame(() => centerParty(reduced ? 'auto' : 'smooth'));
    return () => cancelAnimationFrame(timer);
  }, [currentIndex, chapterId]);

  return (
    <div className="board-viewport" ref={viewportRef}>
    <nav className="board" aria-label={`Recorrido de ${title}`}>

      {/* Fondo: imagen real del capítulo */}
      {bgImage
        ? <img className="board__bg" src={bgImage} alt="" aria-hidden="true" />
        : <div className="board__parchment" />   /* fallback mientras no haya imagen */
      }

      {/* Viñeta sutil encima de la imagen para que los nodos resalten */}
      <div className="board__vignette" />
      {compassRose && (
        <img className="board__compass" src={compassRose} alt="" aria-hidden="true" />
      )}

      <svg
        className="board__svg"
        viewBox={`0 0 ${BOARD_VIEWBOX.width} ${BOARD_VIEWBOX.height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {route.map((segment) => (
          <g key={segment.index}>
            <path className="board__road board__road--bed" d={segment.d} />
            <path className="board__road board__road--mid" d={segment.d} />
            <path className="board__road board__road--dots" d={segment.d} />
            {segment.to <= currentIndex && <path className="board__road board__road--done" d={segment.d} />}
          </g>
        ))}
      </svg>

      {/* Nodos (medallones) */}
      <ol className="board__nodes" aria-label={`${nodes.length} etapas`}>
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
            <li
              key={n.id}
              className={cls}
              style={{ left: `${n.pos.x}%`, top: `${n.pos.y}%` }}
            >
              <button
                className="node__button"
                type="button"
                disabled={isFuture}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${i + 1}. ${n.name}, ${nodeLabel(n.type)}${isVisited ? ', superado' : isCurrent ? ', actual' : ', futuro'}`}
                title={n.name}
              >
                <NodeMedallion type={n.type} />
              </button>
              <span className="node__num">{i + 1}</span>
              {isCurrent && (
                <span className={`node__pawn${partyPawn ? ' node__pawn--art' : ''}`} aria-label="Tu posición">
                  {partyPawn && <img src={partyPawn} alt="" aria-hidden="true" draggable={false} />}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Cartela del título */}
      <div className="board__cartouche">
        <div className="board__sub">{subtitle}</div>
        <div className="board__title">{title}</div>
        <div className="board__orn">
          <span className="ln" />✦<span className="ln r" />
        </div>
      </div>

    </nav>
    <button className="board-center" type="button" onClick={() => centerParty()}>
      Centrar party
    </button>
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
