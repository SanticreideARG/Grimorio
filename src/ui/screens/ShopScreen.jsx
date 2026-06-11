// ShopScreen.jsx — Tienda / campamento (M4). Gastar oro en mejoras permanentes
// de party (ítems) y en curación (pociones). Al salir, el nodo queda resuelto.

import { useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import CardDetailModal from '../components/CardDetailModal.jsx';
import { content } from '../../data/index.js';
import {
  canBuyItem,
  canBuyPotion,
  potionCount,
  effectiveHero,
} from '../../systems/progression.js';
import { getCurrentNode } from '../../systems/board.js';
import { assetUrl } from '../assets.js';
import Coin from '../components/Coin.jsx';

function SectionBanner({ cardback, title }) {
  const url = assetUrl(cardback);
  if (!url) return <h2 className="shop-section__title">{title}</h2>;
  return (
    <div className="shop-section__banner" style={{ backgroundImage: `url(${url})` }}>
      <h2 className="shop-section__title shop-section__title--over">{title}</h2>
    </div>
  );
}

export default function ShopScreen() {
  const game = useGameStore((s) => s.game);
  const buyItem = useGameStore((s) => s.shopBuyItem);
  const buyPotion = useGameStore((s) => s.shopBuyPotion);
  const leave = useGameStore((s) => s.leaveShop);
  const [detailCard, setDetailCard] = useState(null);

  const node = getCurrentNode(game);
  const owned = new Set(game.inventory ?? []);

  return (
    <main className="shop-screen">
      <header className="shop-header">
        <span className="shop-header__label">TIENDA</span>
        <h1 className="shop-header__title">{node?.name ?? 'El Mercader'}</h1>
        <span className="shop-header__gold"><Coin /> {game.gold}</span>
      </header>

      {node?.greeting && (
        <blockquote className="shop-greeting">
          {node.greeting.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </blockquote>
      )}

      <div className="shop-body">
        <section className="shop-section">
          <SectionBanner cardback="cardbacks/magias.png" title="Equipo (mejoras permanentes)" />
          <div className="shop-grid">
            {content.items.map((it) => {
              const has = owned.has(it.id);
              const buyable = canBuyItem(game, it.id);
              return (
                <div
                  key={it.id}
                  className="unit-wrap"
                  onContextMenu={(ev) => { ev.preventDefault(); setDetailCard({ unit: it, type: 'item' }); }}
                >
                  <article className={`shop-card${has ? ' is-owned' : ''}`}>
                    <ShopIcon icon={it.icon} name={it.name} />
                    <div className="shop-card__name">{it.name}</div>
                    <div className="shop-card__desc">{it.desc}</div>
                    {it.mod?.upgradeFace && <DiceFaceUpgradePreview item={it} game={game} />}
                    <div className="shop-card__foot">
                      <span className="shop-card__price"><Coin /> {it.price}</span>
                      <button
                        className="btn btn--primary btn--sm"
                        disabled={!buyable}
                        onClick={() => buyItem(it.id)}
                      >
                        {has ? 'En posesión' : 'Comprar'}
                      </button>
                    </div>
                  </article>
                  <button
                    className="unit__info-btn"
                    tabIndex={-1}
                    aria-label="Ver detalles"
                    onClick={() => setDetailCard({ unit: it, type: 'item' })}
                  >ⓘ</button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="shop-section">
          <SectionBanner cardback="cardbacks/pociones.png" title="Pociones (para combate)" />
          <div className="shop-grid">
            {content.potions.map((p) => {
              const buyable = canBuyPotion(game, p.id);
              const count = potionCount(game, p.id);
              return (
                <div
                  key={p.id}
                  className="unit-wrap"
                  onContextMenu={(ev) => { ev.preventDefault(); setDetailCard({ unit: p, type: 'potion' }); }}
                >
                  <article className="shop-card">
                    <ShopIcon icon={p.icon} name={p.name} />
                    <div className="shop-card__name">
                      {p.name}
                      {count > 0 && <span className="shop-card__count"> ×{count}</span>}
                    </div>
                    <div className="shop-card__desc">{p.desc}</div>
                    <div className="shop-card__foot">
                      <span className="shop-card__price"><Coin /> {p.price}</span>
                      <button
                        className="btn btn--primary btn--sm"
                        disabled={!buyable}
                        onClick={() => buyPotion(p.id)}
                      >
                        Comprar
                      </button>
                    </div>
                  </article>
                  <button
                    className="unit__info-btn"
                    tabIndex={-1}
                    aria-label="Ver detalles"
                    onClick={() => setDetailCard({ unit: p, type: 'potion' })}
                  >ⓘ</button>
                </div>
              );
            })}
          </div>
        </section>

        {(game.pets ?? []).length > 0 && (
          <section className="shop-section">
            <SectionBanner cardback="cardbacks/mascotas.png" title="Mascotas de la party" />
            <div className="shop-grid shop-grid--pets">
              {(game.pets ?? []).map((petId) => {
                const pet = content.petsById[petId];
                if (!pet) return null;
                const artUrl = pet.art ? assetUrl(pet.art) : null;
                return (
                  <div
                    key={petId}
                    className="unit-wrap"
                    onContextMenu={(ev) => { ev.preventDefault(); setDetailCard({ unit: pet, type: 'pet' }); }}
                  >
                    <article className="shop-card shop-card--pet">
                      {artUrl
                        ? <img className="shop-card__icon shop-card__icon--pet" src={artUrl} alt={pet.name} />
                        : <span className="shop-card__icon shop-card__icon--placeholder">{pet.name[0]}</span>
                      }
                      <div className="shop-card__name">{pet.name}</div>
                      <div className="shop-card__desc">{pet.desc}</div>
                      <div className="shop-card__foot">
                        <span className="chip chip--pet">Compañero activo</span>
                      </div>
                    </article>
                    <button
                      className="unit__info-btn"
                      tabIndex={-1}
                      aria-label="Ver detalles"
                      onClick={() => setDetailCard({ unit: pet, type: 'pet' })}
                    >ⓘ</button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <div className="shop-actions">
        <button className="btn btn--primary" onClick={leave}>
          Continuar el viaje →
        </button>
      </div>

      {detailCard && (
        <CardDetailModal
          unit={detailCard.unit}
          type={detailCard.type}
          onClose={() => setDetailCard(null)}
        />
      )}
    </main>
  );
}

function faceToText(f) {
  if (f.sword)  return `🗡️${f.sword > 1 ? f.sword : ''}`;
  if (f.shield) return `🛡️${f.shield > 1 ? f.shield : ''}`;
  if (f.star)   return `⭐${f.star > 1 ? f.star : ''}`;
  return '·';
}

function DiceFaceUpgradePreview({ item, game }) {
  const { from, to } = item.mod.upgradeFace;
  // Muestra qué héroe(s) se ven afectados y qué cara cambia
  const affected = (game.party ?? []).filter((id) => {
    const faces = effectiveHero(id, game)?.diceFaces ?? [];
    return faces.some((f) => {
      const keys = Object.keys(from);
      if (keys.length === 0) return Object.values(f).every((v) => !v);
      return keys.every((k) => f[k] === from[k]);
    });
  }).map((id) => content.heroesById[id]?.name?.split(' ')[0] ?? id);

  if (!affected.length) return (
    <p className="dice-preview dice-preview--none">Sin caras compatibles en la party.</p>
  );
  return (
    <div className="dice-preview">
      <span className="dice-preview__arrow">
        {faceToText(Object.keys(from).length ? from : {})} → {faceToText(to)}
      </span>
      <span className="dice-preview__who">{affected.join(', ')}</span>
    </div>
  );
}

function ShopIcon({ icon, name }) {
  const url = assetUrl(icon);
  if (url) return <img className="shop-card__icon" src={url} alt={name} loading="lazy" />;
  return <span className="shop-card__icon shop-card__icon--placeholder" aria-hidden="true">{name[0]}</span>;
}
