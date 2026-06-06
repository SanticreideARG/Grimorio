import { useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { DIFFICULTIES } from '../core/state.js';
import { script } from '../data/script.js';
import { menuBg } from '../data/mapImages.js';
import SlotCard from './components/SlotCard.jsx';
import MapScreen from './screens/MapScreen.jsx';
import PartySelect from './screens/PartySelect.jsx';
import CombatScreen from './screens/CombatScreen.jsx';
import EventScreen from './screens/EventScreen.jsx';
import ShopScreen from './screens/ShopScreen.jsx';

const DIFFICULTY_LABEL = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };

export default function App() {
  const game = useGameStore((s) => s.game);
  const slots = useGameStore((s) => s.slots);
  const newGame = useGameStore((s) => s.newGame);
  const load = useGameStore((s) => s.load);
  const remove = useGameStore((s) => s.remove);

  const [difficulty, setDifficulty] = useState('normal');

  if (game) {
    switch (game.view) {
      case 'party-select': return <PartySelect />;
      case 'combat':       return <CombatScreen />;
      case 'event':        return <EventScreen />;
      case 'shop':         return <ShopScreen />;
      case 'map':
      default:             return <MapScreen />;
    }
  }

  return (
    <main className="screen screen--menu">
      {/* Imagen de fondo a pantalla completa (capa fija independiente del
          ancho del contenido). En pantallas anchas se ve completa (contain);
          en chicas, centrada y recortada (cover). */}
      <div className="menu-bg" style={{ backgroundImage: `url(${menuBg})` }} />
      {/* Overlay oscuro sobre la imagen para legibilidad */}
      <div className="menu-overlay" />

      <div className="menu-content">
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

        <footer className="footnote">GRIMORIO · v0.1.0</footer>
      </div>
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
