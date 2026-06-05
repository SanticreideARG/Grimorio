// SessionPanel.jsx — Panel de la partida activa (placeholder de M0).
// Prueba que crear/guardar/cargar/mutar una partida funciona de punta a punta.
// El bucle real de juego (mapa, combate) reemplaza este panel en M1+.

import { useGameStore } from '../../store/gameStore.js';

const DIFFICULTY_LABEL = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };

export default function SessionPanel() {
  const game = useGameStore((s) => s.game);
  const activeSlot = useGameStore((s) => s.activeSlot);
  const patchGame = useGameStore((s) => s.patchGame);
  const quitToMenu = useGameStore((s) => s.quitToMenu);

  return (
    <section className="session">
      <h2 className="session__title">Partida en curso</h2>
      <p className="session__hint">
        Andamiaje M0: el bucle de juego (mapa y combate) llega en M1.
      </p>

      <dl className="session__meta">
        <dt>Ranura</dt>
        <dd>{activeSlot + 1}</dd>
        <dt>Dificultad</dt>
        <dd>{DIFFICULTY_LABEL[game.difficulty] ?? game.difficulty}</dd>
        <dt>Semilla</dt>
        <dd>{game.seed}</dd>
        <dt>Capítulo</dt>
        <dd>{game.chapterIndex + 1}</dd>
        <dt>Perdición</dt>
        <dd>{game.doom}</dd>
        <dt>Oro</dt>
        <dd>{game.gold}</dd>
      </dl>

      <div className="session__actions">
        {/* Smoke test de mutación + autosave: subir Perdición persiste al recargar. */}
        <button
          className="btn"
          onClick={() => patchGame((g) => ({ ...g, doom: g.doom + 1 }))}
        >
          + Perdición (test de guardado)
        </button>
        <button className="btn btn--primary" onClick={quitToMenu}>
          Volver al menú
        </button>
      </div>
    </section>
  );
}
