// ShopScreen.jsx — Tienda / campamento (M4). Gastar oro en mejoras permanentes
// de party (ítems) y en curación (pociones). Al salir, el nodo queda resuelto.

import { useGameStore } from '../../store/gameStore.js';
import { content } from '../../data/index.js';
import {
  canBuyItem,
  canBuyPotion,
  potionCount,
  effectiveHero,
} from '../../systems/progression.js';
import { getCurrentNode } from '../../systems/board.js';
import { assetUrl } from '../assets.js';

export default function ShopScreen() {
  const game = useGameStore((s) => s.game);
  const buyItem = useGameStore((s) => s.shopBuyItem);
  const buyPotion = useGameStore((s) => s.shopBuyPotion);
  const leave = useGameStore((s) => s.leaveShop);

  const node = getCurrentNode(game);
  const owned = new Set(game.inventory ?? []);

  return (
    <main className="shop-screen">
      <header className="shop-header">
        <span className="shop-header__label">TIENDA</span>
        <h1 className="shop-header__title">{node?.name ?? 'El Mercader'}</h1>
        <span className="shop-header__gold">🪙 {game.gold}</span>
      </header>

      <div className="shop-body">
        <section className="shop-section">
          <h2 className="shop-section__title">Equipo (mejoras permanentes)</h2>
          <div className="shop-grid">
            {content.items.map((it) => {
              const has = owned.has(it.id);
              const buyable = canBuyItem(game, it.id);
              return (
                <article key={it.id} className={`shop-card${has ? ' is-owned' : ''}`}>
                  <ShopIcon icon={it.icon} name={it.name} />
                  <div className="shop-card__name">{it.name}</div>
                  <div className="shop-card__desc">{it.desc}</div>
                  {it.mod?.upgradeFace && <DiceFaceUpgradePreview item={it} game={game} />}
                  <div className="shop-card__foot">
                    <span className="shop-card__price">🪙 {it.price}</span>
                    <button
                      className="btn btn--primary btn--sm"
                      disabled={!buyable}
                      onClick={() => buyItem(it.id)}
                    >
                      {has ? 'En posesión' : 'Comprar'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="shop-section">
          <h2 className="shop-section__title">Pociones (para combate)</h2>
          <div className="shop-grid">
            {content.potions.map((p) => {
              const buyable = canBuyPotion(game, p.id);
              const count = potionCount(game, p.id);
              return (
                <article key={p.id} className="shop-card">
                  <ShopIcon icon={p.icon} name={p.name} />
                  <div className="shop-card__name">
                    {p.name}
                    {count > 0 && <span className="shop-card__count"> ×{count}</span>}
                  </div>
                  <div className="shop-card__desc">{p.desc}</div>
                  <div className="shop-card__foot">
                    <span className="shop-card__price">🪙 {p.price}</span>
                    <button
                      className="btn btn--primary btn--sm"
                      disabled={!buyable}
                      onClick={() => buyPotion(p.id)}
                    >
                      Comprar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <div className="shop-actions">
        <button className="btn btn--primary" onClick={leave}>
          Continuar el viaje →
        </button>
      </div>
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
