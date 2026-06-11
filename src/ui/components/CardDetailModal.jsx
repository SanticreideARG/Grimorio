import { useEffect, useState } from 'react';
import { content } from '../../data/index.js';
import { assetUrl } from '../assets.js';

const BEHAVIOR_LABEL = {
  swarm:   'Turba',
  weakest: 'Cazador',
  tank:    'Defensor',
  summon:  'Invocador',
  curse:   'Malditor',
  boss:    'Jefe',
};

function getCardbackPath(type, unit) {
  if (type === 'enemy') return unit?.isBoss ? 'cardbacks/bosses.png' : 'cardbacks/enemies.png';
  const MAP = {
    hero:   'cardbacks/heroes.png',
    item:   'cardbacks/botin.png',
    potion: 'cardbacks/botin.png',
    pet:    'cardbacks/mascotas.png',
  };
  return MAP[type] ?? 'cardbacks/heroes.png';
}

function faceLabel(f) {
  if (!f || !Object.keys(f).length) return '·';
  if (f.sword)  return `🗡️${f.sword > 1 ? f.sword : ''}`;
  if (f.shield) return `🛡️${f.shield > 1 ? f.shield : ''}`;
  if (f.star)   return `⭐${f.star > 1 ? f.star : ''}`;
  return '·';
}

export default function CardDetailModal({ unit, type, onClose }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 480);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const cardbackUrl = assetUrl(getCardbackPath(type, unit));

  return (
    <div className="card-detail-overlay" onClick={onClose}>
      <div
        className={`card-detail-flip${flipped ? ' is-flipped' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-detail-flip__inner">
          <div className="card-detail-flip__front">
            {cardbackUrl
              ? <img className="card-detail__cardback" src={cardbackUrl} alt="Carta" />
              : <div className="card-detail__cardback card-detail__cardback--fallback" />
            }
          </div>
          <div className="card-detail-flip__back">
            <button className="card-detail__close" onClick={onClose} aria-label="Cerrar">✕</button>
            {type === 'hero'   && <HeroDetail unit={unit} />}
            {type === 'enemy'  && <EnemyDetail unit={unit} />}
            {(type === 'item' || type === 'potion') && <LootDetail unit={unit} />}
            {type === 'pet'    && <PetDetail unit={unit} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function HeroDetail({ unit }) {
  const hero = content.heroesById[unit.id] ?? unit;
  const portraitUrl = assetUrl(hero.portrait ?? `heroes/${hero.id}.png`);
  const [hovered, setHovered] = useState(false);

  return (
    <div className={`card-detail__content${hovered ? ' is-portrait-hover' : ''}`}>
      <div
        className="card-detail__portrait"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {portraitUrl
          ? <img src={portraitUrl} alt={hero.name} className="card-detail__portrait-img" />
          : <span className="card-detail__portrait-fallback">{hero.name[0]}</span>
        }
        <div className="card-detail__portrait-vignette" />
        <div className="card-detail__portrait-name">
          <span className="card-detail__name">{hero.name}</span>
          <span className="card-detail__role">{hero.role}</span>
        </div>
      </div>

      <div className="card-detail__body">
        <div className="card-detail__stats">
          <span>❤ {hero.maxHp}</span>
          <span>🎲 ×{hero.dice}</span>
          <span>{hero.row === 'front' ? 'Vanguardia' : 'Retaguardia'}</span>
        </div>

        {hero.passive && (
          <div className="card-detail__passive">
            <span className="card-detail__section-label">Pasivo</span>
            <span className="card-detail__passive-text">{hero.passive.text}</span>
          </div>
        )}

        {hero.spells?.length > 0 && (
          <div>
            <span className="card-detail__section-label">Hechizos</span>
            <div className="card-detail__spells">
              {hero.spells.map((sid) => {
                const sp = content.spellsById[sid];
                if (!sp) return null;
                const iconUrl = sp.icon ? assetUrl(sp.icon) : null;
                return (
                  <div key={sid} className="card-detail__spell">
                    {iconUrl && <img className="card-detail__spell-icon" src={iconUrl} alt={sp.name} />}
                    <div className="card-detail__spell-info">
                      <div className="card-detail__spell-header">
                        <span className="card-detail__spell-name">{sp.name}</span>
                        <span className="card-detail__spell-cost">⭐ {sp.cost}</span>
                      </div>
                      <span className="card-detail__spell-desc">{sp.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Enemy ───────────────────────────────────────────────────────────────────

function EnemyDetail({ unit }) {
  const base = content.enemiesById[unit.id] ?? content.bossesById?.[unit.id] ?? unit;
  const isBoss = unit.isBoss ?? false;
  const artUrl = assetUrl(unit.art ?? `enemies/${unit.id}.png`);
  const summonedName = base.summons ? (content.enemiesById[base.summons]?.name ?? base.summons) : null;
  const curseName = base.curse ? (content.cursesById?.[base.curse]?.name ?? base.curse) : null;
  const [hovered, setHovered] = useState(false);

  return (
    <div className={`card-detail__content${hovered ? ' is-portrait-hover' : ''}`}>
      <div
        className="card-detail__portrait card-detail__portrait--enemy"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {artUrl
          ? <img src={artUrl} alt={unit.name} className="card-detail__portrait-img" />
          : <span className="card-detail__portrait-fallback">{unit.name[0]}</span>
        }
        <div className="card-detail__portrait-vignette" />
        <div className="card-detail__portrait-name">
          <span className="card-detail__name">{unit.name}</span>
          {(unit.isElite || isBoss) && (
            <span className={`card-detail__badge ${isBoss ? 'card-detail__badge--boss' : 'card-detail__badge--elite'}`}>
              {isBoss ? '☠ Jefe' : '★ Élite'}
            </span>
          )}
        </div>
      </div>

      <div className="card-detail__body">
        <div className="card-detail__stats">
          <span>❤ {unit.maxHp}</span>
          <span>⚔ {unit.dmg} dmg</span>
          <span>{unit.row === 'front' ? 'Vanguardia' : 'Retaguardia'}</span>
          {base.behavior && <span>{BEHAVIOR_LABEL[base.behavior] ?? base.behavior}</span>}
        </div>

        {base.lore && <p className="card-detail__lore">{base.lore}</p>}

        {(summonedName || curseName) && (
          <div className="card-detail__passive">
            {summonedName && (
              <>
                <span className="card-detail__section-label">Invoca</span>
                <span className="card-detail__passive-text">{summonedName}</span>
              </>
            )}
            {curseName && (
              <>
                <span className="card-detail__section-label">Maldición</span>
                <span className="card-detail__passive-text">{curseName}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Loot (items & potions) ──────────────────────────────────────────────────

function LootDetail({ unit }) {
  const iconUrl = unit.icon ? assetUrl(unit.icon) : null;

  return (
    <div className="card-detail__content card-detail__content--loot">
      <div className="card-detail__loot-icon">
        {iconUrl
          ? <img src={iconUrl} alt={unit.name} />
          : <span className="card-detail__portrait-fallback">{unit.name[0]}</span>
        }
      </div>
      <div className="card-detail__loot-name">{unit.name}</div>
      {unit.price != null && (
        <span className="card-detail__price">💰 {unit.price} de oro</span>
      )}

      <div className="card-detail__body card-detail__body--loot">
        <p className="card-detail__lore">{unit.desc}</p>

        {unit.mod?.upgradeFace && (
          <div className="card-detail__passive">
            <span className="card-detail__section-label">Mejora de dado</span>
            <span className="card-detail__passive-text">
              {faceLabel(unit.mod.upgradeFace.from)} → {faceLabel(unit.mod.upgradeFace.to)}
            </span>
          </div>
        )}
        {unit.mod?.dice && (
          <div className="card-detail__passive">
            <span className="card-detail__passive-text">
              +{unit.mod.dice} dado{unit.mod.dice > 1 ? 's' : ''} al pool
            </span>
          </div>
        )}
        {unit.mod?.maxHp && (
          <div className="card-detail__passive">
            <span className="card-detail__passive-text">+{unit.mod.maxHp} HP máximo</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pet ─────────────────────────────────────────────────────────────────────

function PetDetail({ unit: pet }) {
  const artUrl = pet.art ? assetUrl(pet.art) : null;
  const [hovered, setHovered] = useState(false);

  return (
    <div className={`card-detail__content${hovered ? ' is-portrait-hover' : ''}`}>
      <div
        className="card-detail__portrait"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {artUrl
          ? <img src={artUrl} alt={pet.name} className="card-detail__portrait-img" />
          : <span className="card-detail__portrait-fallback">{pet.name[0]}</span>
        }
        <div className="card-detail__portrait-vignette" />
        <div className="card-detail__portrait-name">
          <span className="card-detail__name">{pet.name}</span>
          <span className="card-detail__badge card-detail__badge--pet">Compañero</span>
        </div>
      </div>

      <div className="card-detail__body">
        <p className="card-detail__lore">{pet.desc}</p>
      </div>
    </div>
  );
}
