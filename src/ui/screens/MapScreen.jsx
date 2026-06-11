// MapScreen.jsx — Pantalla de mapa (M1): recorrer el capítulo nodo a nodo.
// HUD (capítulo, perdición, oro, progreso) + tablero + panel del nodo actual.
// El combate/eventos reales llegan en M2/M3; aquí la resolución es narrativa.

import { useState } from 'react';
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
import { script } from '../../data/script.js';
import { effectiveMaxHp, partyHpRatio } from '../../systems/progression.js';
import { content } from '../../data/index.js';
import { getNodeNarration } from '../../data/narrative.js';
import { assetUrl } from '../assets.js';
import BoardMap from '../components/BoardMap.jsx';
import Coin from '../components/Coin.jsx';
import CardDetailModal from '../components/CardDetailModal.jsx';

export default function MapScreen() {
  const game = useGameStore((s) => s.game);
  const [detailPet, setDetailPet] = useState(null);
  const resolveNode = useGameStore((s) => s.resolveNode);
  const advanceNode = useGameStore((s) => s.advanceNode);
  const startCombat = useGameStore((s) => s.startCombat);
  const startEvent = useGameStore((s) => s.startEvent);
  const rest = useGameStore((s) => s.rest);
  const openShop = useGameStore((s) => s.openShop);
  const advanceChapter = useGameStore((s) => s.advanceChapter);
  const computeAndSetEnding = useGameStore((s) => s.computeAndSetEnding);
  const quitToMenu = useGameStore((s) => s.quitToMenu);

  const chapter = getChapter(game);
  const nodes = getNodes(game);
  const node = getCurrentNode(game);
  const resolved = isCurrentResolved(game);
  const last = isLastNode(game);
  const complete = isChapterComplete(game);
  const hasNext = game.chapterIndex < content.chapters.length - 1;
  const atStart = game.nodeIndex === 0 && !resolved;

  // Narración del nodo (lugar + comentario de party + lore), solo al llegar.
  const narration = !resolved ? getNodeNarration(node.id, game.party ?? []) : null;

  // Acción al resolver el nodo según tipo.
  const RESOLVERS = {
    combat: startCombat, elite: startCombat, boss: startCombat,
    event: startEvent, rest, shop: openShop,
  };
  const onResolve = RESOLVERS[node.type] ?? resolveNode;

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
          <span className="hud__stat" title="Oro"><Coin /> {game.gold}</span>
          <span className="hud__stat" title="Progreso">{game.nodeIndex + 1}/{nodes.length}</span>
        </div>
      </header>

      {/* Estado de la party (vida persistente) + mascotas */}
      <div className="party-status">
        {(game.party ?? []).map((id) => {
          const hero = content.heroesById[id];
          if (!hero) return null;
          const maxHp = effectiveMaxHp(id, game);
          const hp = game.partyHp?.[id] ?? maxHp;
          const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
          // Mascota acompañante (cosmético): icono al inicio de la fila.
          const petId = Object.entries(game.petAssignments ?? {})
            .find(([, heroId]) => heroId === id)?.[0];
          const pet = petId ? content.petsById[petId] : null;
          const petUrl = pet?.art ? assetUrl(pet.art) : null;
          return (
            <span key={id} className="party-status__hero" title={`${hero.name}: ${hp}/${maxHp}`}>
              {pet && (
                <span className="party-status__heropet" title={`${pet.name} acompaña a ${hero.name}`}>
                  {petUrl
                    ? <img src={petUrl} alt={pet.name} />
                    : <span>{pet.name[0]}</span>
                  }
                </span>
              )}
              <span className="party-status__name">{hero.name.split(' ')[0]}</span>
              <span className="party-status__bar">
                <span className="party-status__fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="party-status__num">{hp}/{maxHp}</span>
            </span>
          );
        })}
        {(game.pets ?? []).length > 0 && (
          <div className="party-status__pets">
            {(game.pets ?? []).map((petId) => {
              const pet = content.petsById[petId];
              if (!pet) return null;
              const artUrl = pet.art ? assetUrl(pet.art) : null;
              return (
                <button
                  key={petId}
                  className="party-status__pet"
                  title={pet.name}
                  onClick={() => setDetailPet(pet)}
                >
                  {artUrl
                    ? <img className="party-status__pet-art" src={artUrl} alt={pet.name} />
                    : <span className="party-status__pet-label">{pet.name[0]}</span>
                  }
                </button>
              );
            })}
          </div>
        )}
      </div>

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

          {/* Narración del lugar (qué fue antes) o descripción genérica por tipo */}
          <p className="node-panel__desc">
            {resolved
              ? node.type === 'boss'
                ? chapter.script.bossIntro
                : 'Superado. El camino continúa.'
              : narration?.place ?? describeNode(node)}
          </p>

          {/* Goteo de lore del Rey Ceniza / El Devorado */}
          {narration?.lore && (
            <p className="node-panel__lore">{narration.lore}</p>
          )}

          {/* Comentario personalizado de un héroe de la party */}
          {narration?.bark && (
            <HeroComment heroId={narration.bark.heroId} line={narration.bark.line} />
          )}

          {/* Preview de enemigos para nodos de combate (antes de entrar) */}
          {!resolved && ['combat', 'elite', 'boss'].includes(node.type) && node.enemies?.length > 0 && (
            <EnemyPreview enemies={node.enemies} />
          )}

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

      {detailPet && (
        <CardDetailModal unit={detailPet} type="pet" onClose={() => setDetailPet(null)} />
      )}

      {/* Final de capítulo */}
      {complete && (
        <div className="overlay">
          <div className="overlay__card">
            <div className="overlay__sub">
              {hasNext ? 'CAPÍTULO COMPLETADO' : 'CAMPAÑA COMPLETADA'}
            </div>
            <h2 className="overlay__title">{chapter.title}</h2>
            <p className="overlay__text">{chapter.script.victory}</p>
            {hasNext ? (
              <CampChoices
                game={game}
                onChoose={advanceChapter}
              />
            ) : (
              <EndingOverlay
                ending={game.ending}
                onCompute={computeAndSetEnding}
                onQuit={quitToMenu}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}

const ENDING_TITLE = {
  good: '✦ Un Final de Luz ✦',
  bittersweet: '— Un Final Agridulce —',
  bad: '☠ Un Final Oscuro ☠',
};

function EndingOverlay({ ending, onCompute, onQuit }) {
  // Calcular el final la primera vez que se muestra este overlay
  if (!ending) {
    onCompute();
    return null;
  }
  const title = ENDING_TITLE[ending] ?? 'FIN';
  const text = script.endings[ending] ?? '';
  return (
    <>
      <p className={`overlay__ending-type overlay__ending-type--${ending}`}>{title}</p>
      <p className="overlay__text">{text}</p>
      <button className="btn btn--primary" onClick={onQuit}>
        Volver al menú
      </button>
    </>
  );
}

// ── Campamento: elecciones entre capítulos ──────────────────────────────────

const CAMP_OPTIONS = [
  {
    id: 'full',
    icon: '🔥',
    title: 'Descanso Largo',
    desc: 'Acampáis junto al fuego toda la noche. La party recupera toda su vida.',
    bonus: 'Curación total',
    cost: null,
  },
  {
    id: 'half',
    icon: '⚔',
    title: 'Guardia Nocturna',
    desc: 'Dormís por turnos, vigilando. Menos descanso, pero llegáis alertas.',
    bonus: 'Curación al 50%',
    cost: null,
  },
  {
    id: 'explore',
    icon: '🗺',
    title: 'Explorar los Alrededores',
    desc: 'Registráis la zona en busca de recursos. Poco sueño, pero algo de oro.',
    bonus: 'Curación al 25% + 25 de oro',
    cost: null,
  },
];

function CampChoices({ game, onChoose }) {
  const [chosen, setChosen] = useState(null);
  const hpPct = Math.round(partyHpRatio(game) * 100);

  return (
    <div className="camp">
      <p className="camp__state">
        La Perdición se disipa con el amanecer.
        Estado actual de la party: <strong>{hpPct}% de vida</strong>.
      </p>
      <div className="camp__options">
        {CAMP_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={`camp-option${chosen === opt.id ? ' is-chosen' : ''}`}
            onClick={() => setChosen(opt.id)}
          >
            <span className="camp-option__icon">{opt.icon}</span>
            <div className="camp-option__body">
              <div className="camp-option__title">{opt.title}</div>
              <div className="camp-option__desc">{opt.desc}</div>
              <div className="camp-option__bonus">{opt.bonus}</div>
            </div>
          </button>
        ))}
      </div>
      <button
        className="btn btn--primary camp__confirm"
        disabled={!chosen}
        onClick={() => chosen && onChoose(chosen)}
      >
        {chosen
          ? `${CAMP_OPTIONS.find((o) => o.id === chosen)?.title} → Siguiente capítulo`
          : 'Elegí cómo pasar la noche…'}
      </button>
    </div>
  );
}

// ── Comentario personalizado de un héroe en el nodo ─────────────────────────

function HeroComment({ heroId, line }) {
  const hero = content.heroesById[heroId];
  if (!hero) return null;
  const url = assetUrl(hero.portrait ?? `heroes/${heroId}.png`);
  const firstName = hero.name.split(' ')[0];
  return (
    <figure className="hero-comment">
      {url
        ? <img className="hero-comment__face" src={url} alt={firstName} loading="lazy" />
        : <span className="hero-comment__face hero-comment__face--ph" aria-hidden="true">{firstName[0]}</span>
      }
      <figcaption className="hero-comment__body">
        <span className="hero-comment__name">{firstName}</span>
        <span className="hero-comment__line">"{line}"</span>
      </figcaption>
    </figure>
  );
}

// ── Preview de enemigos antes del combate ───────────────────────────────────

function EnemyPreview({ enemies }) {
  // Cuenta cuántos de cada tipo hay
  const counts = {};
  for (const id of enemies) counts[id] = (counts[id] ?? 0) + 1;

  return (
    <div className="enemy-preview">
      <div className="enemy-preview__label">Encuentro</div>
      <div className="enemy-preview__list">
        {Object.entries(counts).map(([id, n]) => {
          const e = content.enemiesById[id] ?? content.bossesById[id];
          if (!e) return null;
          const isBoss = !!e.isBoss;
          return (
            <span
              key={id}
              className={`enemy-preview__tag${isBoss ? ' is-boss' : ''}`}
              title={e.name}
            >
              {n > 1 && <span className="enemy-preview__count">×{n} </span>}
              {e.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
