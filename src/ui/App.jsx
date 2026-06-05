// App.jsx — Pantalla de título de M0.
// Demuestra el entregable: la app arranca, crea/guarda/carga partida en 3 slots.
// El juego en sí (mapa, combate) llega en M1+.

import { useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { DIFFICULTIES } from '../core/state.js';
import { script } from '../data/script.js';
import SlotCard from './components/SlotCard.jsx';
import MapScreen from './screens/MapScreen.jsx';
import PartySelect from './screens/PartySelect.jsx';
import CombatScreen from './screens/CombatScreen.jsx';

const DIFFICULTY_LABEL = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };

export default function App() {
  const game = useGameStore((s) => s.game);
  const slots = useGameStore((s) => s.slots);
  const newGame = useGameStore((s) => s.newGame);
  const load = useGameStore((s) => s.load);
  const remove = useGameStore((s) => s.remove);

  const [difficulty, setDifficulty] = useState('normal');

  // Partida activa: enrutar por vista en juego.
  if (game) {
    switch (game.view) {
      case 'party-select':
        return <PartySelect />;
      case 'combat':
        return <CombatScreen />;
      case 'map':
      default:
        return <MapScreen />;
    }
  }

  // Menú de título: 3 slots + selector de dificultad.
  return (
    <main className="screen">
      <Header />

      <p className="intro">{script.intro}</p>

      <section className="difficulty">
        <span className="difficulty__label">Dificultad</span>
        <div className="difficulty__options">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={`btn btn--toggle${difficulty === d ? ' is-active' : ''}`}
              onClick={() => setDifficulty(d)}
            >
              {DIFFICULTY_LABEL[d]}
            </button>
          ))}
        </div>
      </section>

      <section className="slots">
        {slots.map((s) => (
          <SlotCard
            key={s.slot}
            info={s}
            onNew={() => newGame(s.slot, { difficulty })}
            onLoad={() => load(s.slot)}
            onDelete={() => remove(s.slot)}
          />
        ))}
      </section>

      <footer className="footnote">GRIMORIO · v0.1.0 · M0</footer>
    </main>
  );
}

function Header() {
  return (
    <header className="title">
      <div className="title__sub">UN VIAJE SIN RETORNO</div>
      <h1 className="title__main">GRIMORIO</h1>
      <div className="title__orn">
        <span className="ln" />✦<span className="ln r" />
      </div>
    </header>
  );
}
