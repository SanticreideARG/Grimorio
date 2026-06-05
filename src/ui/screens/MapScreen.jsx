// MapScreen.jsx — Pantalla de mapa (M1): recorrer el capítulo nodo a nodo.
// HUD (capítulo, perdición, oro, progreso) + tablero + panel del nodo actual.
// El combate/eventos reales llegan en M2/M3; aquí la resolución es narrativa.

import { useGameStore } from '../../store/gameStore.js';
import {
  getChapter,
  getNodes,
  getCurrentNode,
  isCurrentResolved,
  isLastNode,
  isChapterComplete,
  describeNode,
  nodeLabel,
  nodeActionLabel,
} from '../../systems/board.js';
import { getDoomRatio } from '../../systems/doom.js';
import { content } from '../../data/index.js';
import BoardMap from '../components/BoardMap.jsx';

const COMBAT_TYPES = new Set(['combat', 'elite', 'boss']);

export default function MapScreen() {
  const game = useGameStore((s) => s.game);
  const resolveNode = useGameStore((s) => s.resolveNode);
  const advanceNode = useGameStore((s) => s.advanceNode);
  const startCombat = useGameStore((s) => s.startCombat);
  const startEvent = useGameStore((s) => s.startEvent);
  const quitToMenu = useGameStore((s) => s.quitToMenu);

  const chapter = getChapter(game);
  const nodes = getNodes(game);
  const node = getCurrentNode(game);
  const resolved = isCurrentResolved(game);
  const last = isLastNode(game);
  const complete = isChapterComplete(game);
  const atStart = game.nodeIndex === 0 && !resolved;
  const isCombat = COMBAT_TYPES.has(node.type);
  const isEvent = node.type === 'event';

  // Acción al resolver el nodo según tipo.
  const onResolve = isCombat ? startCombat : isEvent ? startEvent : resolveNode;

  return (
    <main className="map-screen">
      {/* HUD superior */}
      <header className="hud">
        <button className="btn btn--ghost hud__quit" onClick={quitToMenu}>
          ← Menú
        </button>
        <div className="hud__chapter">
          <span className="hud__sub">{chapter.subtitle}</span>
          <span className="hud__title">{chapter.title}</span>
        </div>
        <div className="hud__stats">
          <span className="hud__stat doom-stat" title="Perdición">
            <span className="doom-label">☠ Perdición</span>
            <span className="doom-bar">
              <span
                className="doom-bar__fill"
                style={{ width: `${getDoomRatio(game, Object.values(content.chaptersById)) * 100}%` }}
              />
            </span>
            <span className="doom-num">{game.doom}/{chapter.doomMax}</span>
          </span>
          <span className="hud__stat" title="Oro">🪙 {game.gold}</span>
          <span className="hud__stat" title="Progreso">{game.nodeIndex + 1}/{nodes.length}</span>
        </div>
      </header>

      <div className="map-body">
        <BoardMap
          chapterId={chapter.id}
          nodes={nodes}
          currentIndex={game.nodeIndex}
          visited={game.visited}
          title={chapter.title}
          subtitle={chapter.subtitle}
        />

        {/* Panel del nodo actual / narración del MC */}
        <aside className="node-panel">
          {atStart && <p className="node-panel__mc">{chapter.script.intro}</p>}

          <div className="node-panel__type">{nodeLabel(node.type)}</div>
          <h2 className="node-panel__name">{node.name}</h2>
          <p className="node-panel__desc">
            {resolved
              ? node.type === 'boss'
                ? chapter.script.bossIntro
                : 'Superado. El camino continúa.'
              : describeNode(node)}
          </p>

          <div className="node-panel__actions">
            {!resolved && (
              <button className="btn btn--primary" onClick={onResolve}>
                {nodeActionLabel(node.type)}
              </button>
            )}
            {resolved && !last && (
              <button className="btn btn--primary" onClick={advanceNode}>
                Avanzar →
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Final de capítulo */}
      {complete && (
        <div className="overlay">
          <div className="overlay__card">
            <div className="overlay__sub">CAPÍTULO COMPLETADO</div>
            <h2 className="overlay__title">{chapter.title}</h2>
            <p className="overlay__text">{chapter.script.victory}</p>
            <p className="overlay__hint">
              La transición al Capítulo II y el campamento llegan en M4.
            </p>
            <button className="btn btn--primary" onClick={quitToMenu}>
              Volver al menú
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
