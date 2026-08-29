import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { DIFFICULTIES } from '../core/state.js';
import { script } from '../data/script.js';
import { menuBg, aboutBg } from '../data/mapImages.js';
import SlotCard from './components/SlotCard.jsx';
import PreloadBar from './components/PreloadBar.jsx';
import TutorialCoach from './components/TutorialCoach.jsx';
import MapScreen from './screens/MapScreen.jsx';
import PartySelect from './screens/PartySelect.jsx';
import CombatScreen from './screens/CombatScreen.jsx';
import EventScreen from './screens/EventScreen.jsx';
import ShopScreen from './screens/ShopScreen.jsx';
import { useAudio } from './hooks/useAudio.js';
import { useAssetPreload } from './preload.js';
import { cloudEnabled } from '../core/supabase.js';
import { signInWithGoogle, signOut } from '../core/auth.js';
import { debugAllowed } from '../core/debug.js';
import DebugPanel from './components/DebugPanel.jsx';

const DIFFICULTY_LABEL = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };

export default function App() {
  const game = useGameStore((s) => s.game);
  const slots = useGameStore((s) => s.slots);
  const newGame = useGameStore((s) => s.newGame);
  const load = useGameStore((s) => s.load);
  const remove = useGameStore((s) => s.remove);
  const user = useGameStore((s) => s.user);

  const [difficulty, setDifficulty] = useState('normal');
  const [playerCount, setPlayerCount] = useState(1);
  const [showAbout, setShowAbout] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [tutorialOn, setTutorialOn] = useState(() => {
    try { return localStorage.getItem('grimorio_tutorial_off') !== '1'; } catch { return true; }
  });
  const toggleTutorial = () => {
    setTutorialOn((on) => {
      const next = !on;
      try {
        if (next) localStorage.removeItem('grimorio_tutorial_off');
        else localStorage.setItem('grimorio_tutorial_off', '1');
      } catch { /* noop */ }
      return next;
    });
  };

  // Audio — se inicializa una sola vez aquí para toda la app
  const { muted, toggleMuted } = useAudio();

  // Precarga de imágenes en segundo plano (warming de caché) + barra de progreso
  const preload = useAssetPreload();

  useEffect(() => {
    if (!debugAllowed) return undefined;
    const onKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        // Una partida normal nunca se reemplaza desde un atajo accidental.
        if (!game || game.debugSession) setShowDebug((visible) => !visible);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game]);

  if (game) {
    // La key cambia con cada vista → React desmonta/monta la pantalla
    // → el CSS de .view dispara la animación de entrada automáticamente.
    const screen = (() => {
      switch (game.view) {
        case 'party-select': return <PartySelect />;
        case 'combat':       return <CombatScreen />;
        case 'event':        return <EventScreen />;
        case 'shop':         return <ShopScreen />;
        case 'map':
        default:             return <MapScreen />;
      }
    })();
    return (
      <>
        <PreloadBar {...preload} />
        <div key={game.view} className="view">
          {screen}
        </div>
        <TutorialCoach />
        <MuteButton muted={muted} onToggle={toggleMuted} />
        {debugAllowed && game.debugSession && (
          <>
            <button className="debug-fab" onClick={() => setShowDebug(true)}>DEBUG</button>
            <DebugPanel open={showDebug} onClose={() => setShowDebug(false)} />
          </>
        )}
      </>
    );
  }

  return (
    <main className="screen screen--menu">
      <PreloadBar {...preload} />
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
          <span className="difficulty__label">Jugadores (hotseat)</span>
          <div className="difficulty__options">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className={`btn btn--toggle${playerCount === n ? ' is-active' : ''}`}
                onClick={() => setPlayerCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

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

        {cloudEnabled && <AuthBar user={user} />}

        <section className="slots">
          {slots.map((s) => (
            <SlotCard
              key={s.slot}
              info={s}
              onNew={() => newGame(s.slot, {
                difficulty,
                players: Array.from({ length: playerCount }, (_, i) => `Jugador ${i + 1}`),
              })}
              onLoad={() => load(s.slot)}
              onDelete={() => remove(s.slot)}
            />
          ))}
        </section>

        <footer className="footnote">
          <span>GRIMORIO · v1.0</span>
          <button
            className="btn btn--ghost btn--xs"
            onClick={toggleTutorial}
            title="Mostrar el tutorial guiado al iniciar partidas nuevas"
          >
            Tutorial: {tutorialOn ? 'Sí' : 'No'}
          </button>
          <button className="btn btn--ghost btn--xs about-btn" onClick={() => setShowAbout(true)}>
            Acerca de este juego
          </button>
          {debugAllowed && (
            <button className="btn btn--ghost btn--xs debug-menu-btn" onClick={() => setShowDebug(true)}>
              Modo debug
            </button>
          )}
        </footer>
      </div>

      {showAbout && <AboutScreen onClose={() => setShowAbout(false)} />}
      {debugAllowed && <DebugPanel open={showDebug} onClose={() => setShowDebug(false)} />}
    </main>
  );
}

// Barra de cuenta: login con Google o chip del usuario + salir. Solo se renderiza
// si la nube está habilitada (cloudEnabled). El email/avatar vienen del provider.
function AuthBar({ user }) {
  if (!user) {
    return (
      <section className="auth-bar">
        <button className="btn btn--google" onClick={signInWithGoogle}>
          <span className="auth-bar__g" aria-hidden="true">G</span>
          Entrar con Google
        </button>
        <span className="auth-bar__hint">Guardá tus partidas en la nube</span>
      </section>
    );
  }
  const meta = user.user_metadata ?? {};
  const name = meta.full_name || meta.name || user.email || 'Aventurero';
  const avatar = meta.avatar_url || meta.picture || null;
  return (
    <section className="auth-bar">
      <div className="auth-chip">
        {avatar
          ? <img className="auth-chip__avatar" src={avatar} alt="" referrerPolicy="no-referrer" />
          : <span className="auth-chip__avatar auth-chip__avatar--ph" aria-hidden="true">{name[0]}</span>}
        <span className="auth-chip__name">{name}</span>
      </div>
      <button className="btn btn--ghost btn--xs" onClick={signOut}>Salir</button>
    </section>
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

// ── Pantalla "Acerca de" ─────────────────────────────────────────────────

function AboutScreen({ onClose }) {
  return (
    <div className="about-overlay">
      {aboutBg && <div className="about-bg" style={{ backgroundImage: `url(${aboutBg})` }} />}
      <div className="about-overlay__dark" />
      <div className="about-content">
        <div className="about-orn">✦</div>
        <h2 className="about-title">GRIMORIO</h2>
        <p className="about-subtitle">Un juego cooperativo de rol y fantasía oscura por turnos</p>
        <div className="about-divider" />
        <dl className="about-data">
          <dt>Autor</dt>
          <dd>Santiago Creide</dd>
          <dt>Finalización</dt>
          <dd>Junio de 2026</dd>
          <dt>Versión</dt>
          <dd>1.0</dd>
        </dl>
        <div className="about-divider" />
        <a
          className="about-link"
          href="https://santiagocreide.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          santiagocreide.netlify.app ↗
        </a>
        <button className="btn btn--ghost about-back" onClick={onClose}>
          ← Volver al menú
        </button>
      </div>
    </div>
  );
}

// ── Botón mute flotante ───────────────────────────────────────────────────

function MuteButton({ muted, onToggle }) {
  return (
    <button
      className={`mute-btn${muted ? ' is-muted' : ''}`}
      onClick={onToggle}
      title={muted ? 'Activar sonido' : 'Silenciar'}
      aria-label={muted ? 'Activar sonido' : 'Silenciar'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
