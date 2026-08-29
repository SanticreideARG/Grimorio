import { useEffect, useMemo, useState } from 'react';
import { content } from '../../data/index.js';
import { useGameStore } from '../../store/gameStore.js';

export default function DebugPanel({ open, onClose }) {
  const game = useGameStore((state) => state.game);
  const start = useGameStore((state) => state.startDebugSession);
  const jump = useGameStore((state) => state.debugJumpToNode);
  const enter = useGameStore((state) => state.debugEnterCurrentNode);
  const setResources = useGameStore((state) => state.debugSetResources);
  const heal = useGameStore((state) => state.debugHealParty);
  const quit = useGameStore((state) => state.quitDebugSession);
  const isDebug = game?.debugSession === true;

  const [chapterIndex, setChapterIndex] = useState(game?.chapterIndex ?? 0);
  const [nodeIndex, setNodeIndex] = useState(game?.nodeIndex ?? 0);
  const [seed, setSeed] = useState(1337);
  const [gold, setGold] = useState(game?.gold ?? 0);
  const [doom, setDoom] = useState(game?.doom ?? 0);

  const chapter = content.chapters[chapterIndex] ?? content.chapters[0];
  const nodes = useMemo(() => chapter?.nodes ?? [], [chapter]);

  useEffect(() => {
    if (!isDebug) return;
    setChapterIndex(game.chapterIndex);
    setNodeIndex(game.nodeIndex);
    setGold(game.gold ?? 0);
    setDoom(game.doom ?? 0);
  }, [isDebug, game?.chapterIndex, game?.nodeIndex, game?.gold, game?.doom]);

  if (!open) return null;

  const startOrJump = () => {
    if (!isDebug) start({ seed: Number(seed) || 1337 });
    jump(chapterIndex, nodeIndex);
  };

  return (
    <div className="debug-overlay" role="dialog" aria-modal="true" aria-label="Panel debug">
      <section className="debug-panel">
        <header className="debug-panel__header">
          <div>
            <div className="debug-panel__eyebrow">SESIÓN EFÍMERA</div>
            <h2>Modo debug</h2>
          </div>
          <button className="btn btn--ghost btn--xs" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        <p className="debug-panel__warning">DEBUG — NO SE GUARDARÁ EN NINGÚN SLOT</p>

        <label className="debug-field">
          <span>Capítulo</span>
          <select
            value={chapterIndex}
            onChange={(event) => {
              setChapterIndex(Number(event.target.value));
              setNodeIndex(0);
            }}
          >
            {content.chapters.map((entry, index) => (
              <option key={entry.id} value={index}>{index + 1}. {entry.title}</option>
            ))}
          </select>
        </label>

        <label className="debug-field">
          <span>Nodo</span>
          <select value={nodeIndex} onChange={(event) => setNodeIndex(Number(event.target.value))}>
            {nodes.map((node, index) => (
              <option key={node.id} value={index}>{index + 1}. [{node.type}] {node.name}</option>
            ))}
          </select>
        </label>

        {!isDebug && (
          <label className="debug-field">
            <span>Semilla RNG</span>
            <input type="number" value={seed} onChange={(event) => setSeed(event.target.value)} />
          </label>
        )}

        <div className="debug-panel__actions">
          <button className="btn btn--primary" onClick={startOrJump}>
            {isDebug ? 'Saltar al nodo' : 'Iniciar aquí'}
          </button>
          {isDebug && <button className="btn" onClick={enter}>Entrar al encuentro</button>}
        </div>

        {isDebug && (
          <>
            <div className="debug-panel__resources">
              <label className="debug-field">
                <span>Oro</span>
                <input type="number" min="0" max="9999" value={gold} onChange={(event) => setGold(event.target.value)} />
              </label>
              <label className="debug-field">
                <span>Perdición</span>
                <input type="number" min="0" max={chapter?.doomMax ?? 99} value={doom} onChange={(event) => setDoom(event.target.value)} />
              </label>
            </div>
            <div className="debug-panel__actions">
              <button className="btn btn--ghost" onClick={() => setResources({ gold, doom })}>Aplicar recursos</button>
              <button className="btn btn--ghost" onClick={heal}>Curar party</button>
              <button className="btn btn--danger" onClick={() => { quit(); onClose(); }}>Salir de debug</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

