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

const DIE_IMGS = {
  sword:  'ui/dado_espada.png',
  shield: 'ui/dado_escudo.png',
  star:   'ui/dado_estrella.png',
};

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

  const cardbackUrl = assetUrl('cardbacks/heroes.png');

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
            {type === 'hero'
              ? <HeroDetail unit={unit} />
              : <EnemyDetail unit={unit} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroDetail({ unit }) {
  const hero = content.heroesById[unit.id] ?? unit;
  const portraitUrl = assetUrl(hero.portrait ?? `heroes/${hero.id}.png`);

  return (
    <div className="card-detail__content">
      <div className="card-detail__portrait">
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

        <div>
          <span className="card-detail__section-label">Dado — {hero.dice} dado{hero.dice !== 1 ? 's' : ''} de 6 caras</span>
          <div className="card-detail__dice">
            {(hero.diceFaces ?? []).map((face, i) => {
              const entry = face.sword ? ['sword', face.sword]
                : face.shield ? ['shield', face.shield]
                : face.star   ? ['star',   face.star]
                : null;
              const url = entry ? assetUrl(DIE_IMGS[entry[0]]) : null;
              return (
                <span key={i} className="card-detail__die-face">
                  {entry ? (
                    <>
                      {url
                        ? <img className="card-detail__die-img" src={url} alt={entry[0]} />
                        : <span className="card-detail__die-emoji">{entry[0][0]}</span>
                      }
                      <span className="card-detail__die-num">{entry[1]}</span>
                    </>
                  ) : <span className="card-detail__die-blank">·</span>}
                </span>
              );
            })}
          </div>
        </div>

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

function EnemyDetail({ unit }) {
  const base = content.enemiesById[unit.id] ?? unit;
  const isBoss = unit.isBoss ?? false;
  const artUrl = assetUrl(unit.art ?? `enemies/${unit.id}.png`);
  const summonedName = base.summons ? (content.enemiesById[base.summons]?.name ?? base.summons) : null;
  const curseName = base.curse ? (content.cursesById?.[base.curse]?.name ?? base.curse) : null;

  return (
    <div className="card-detail__content">
      <div className="card-detail__portrait card-detail__portrait--enemy">
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
