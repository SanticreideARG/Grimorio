// fx.js — Efectos visuales de combate (imperativos, sin React).
// Reproduce animaciones sobre las cartas usando sus posiciones DOM:
//   melee  → la carta atacante embiste hacia la víctima y vuelve + impacto
//   ranged → un proyectil (flecha física / orbe arcano) viaja origen→destino
//   heal   → brillo verde + cruces ascendentes sobre la carta curada
// Las cartas se localizan por su atributo data-anim-key (uid de enemigo / id de héroe).

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function elByKey(key) {
  if (!key) return null;
  return document.querySelector(`[data-anim-key="${String(key).replace(/"/g, '\\"')}"]`);
}

/** Centro de una carta en coordenadas de viewport, o null si no está en el DOM. */
export function getCenter(key) {
  const el = elByKey(key);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function flash(key, cls, ms) {
  const el = elByKey(key);
  if (!el) return;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}

// ---------- Primitivas de partículas ----------

function spawnProjectile(layer, from, to, variant) {
  if (!layer) return;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  const outer = document.createElement('div');
  outer.className = 'fx-projwrap';
  outer.style.left = `${from.x}px`;
  outer.style.top = `${from.y}px`;

  const inner = document.createElement('div');
  inner.className = `fx-proj fx-proj--${variant}`;
  inner.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  outer.appendChild(inner);
  layer.appendChild(outer);

  const anim = outer.animate(
    [
      { transform: 'translate(0, 0)', opacity: 0.2 },
      { opacity: 1, offset: 0.15 },
      { transform: `translate(${dx}px, ${dy}px)`, opacity: 1 },
    ],
    { duration: 380, easing: 'cubic-bezier(.35,.1,.7,1)' }
  );
  anim.onfinish = () => outer.remove();
}

function impact(layer, at, variant) {
  if (!layer) return;
  const el = document.createElement('div');
  el.className = `fx-impact fx-impact--${variant}`;
  el.style.left = `${at.x}px`;
  el.style.top = `${at.y}px`;
  layer.appendChild(el);
  el.animate(
    [
      { transform: 'translate(-50%, -50%) scale(.3)', opacity: 0.95 },
      { transform: 'translate(-50%, -50%) scale(1.6)', opacity: 0 },
    ],
    { duration: 340, easing: 'ease-out' }
  ).onfinish = () => el.remove();
}

function spawnHeal(layer, at) {
  if (!layer) return;
  const el = document.createElement('div');
  el.className = 'fx-heal';
  el.style.left = `${at.x}px`;
  el.style.top = `${at.y}px`;
  el.innerHTML =
    '<div class="fx-heal__glow"></div>' +
    '<span class="fx-heal__cross" style="--i:0">✚</span>' +
    '<span class="fx-heal__cross" style="--i:1">✚</span>' +
    '<span class="fx-heal__cross" style="--i:2">✚</span>';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function spawnShield(layer, at) {
  if (!layer) return;
  const el = document.createElement('div');
  el.className = 'fx-shield';
  el.style.left = `${at.x}px`;
  el.style.top = `${at.y}px`;
  el.innerHTML = '<div class="fx-shield__ring"></div><span class="fx-shield__icon">🛡️</span>';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function spawnCleanse(layer, at) {
  if (!layer) return;
  const el = document.createElement('div');
  el.className = 'fx-cleanse';
  el.style.left = `${at.x}px`;
  el.style.top = `${at.y}px`;
  el.innerHTML =
    '<div class="fx-cleanse__glow"></div>' +
    '<span class="fx-cleanse__orb" style="--i:0">✦</span>' +
    '<span class="fx-cleanse__orb" style="--i:1">✦</span>' +
    '<span class="fx-cleanse__orb" style="--i:2">✦</span>';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 850);
}

function spawnExplosion(layer, at) {
  if (!layer) return;
  const el = document.createElement('div');
  el.className = 'fx-explosion';
  el.style.left = `${at.x}px`;
  el.style.top = `${at.y}px`;
  el.innerHTML =
    '<div class="fx-explosion__flash"></div>' +
    '<div class="fx-explosion__ring" style="--i:0"></div>' +
    '<div class="fx-explosion__ring" style="--i:1"></div>' +
    '<div class="fx-explosion__ring" style="--i:2"></div>';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function spawnArcaneCast(layer, at) {
  if (!layer) return;
  const el = document.createElement('div');
  el.className = 'fx-arcane-cast';
  el.style.left = `${at.x}px`;
  el.style.top = `${at.y}px`;
  el.innerHTML =
    '<span class="fx-arcane-cast__star" style="--i:0">✦</span>' +
    '<span class="fx-arcane-cast__star" style="--i:1">★</span>' +
    '<span class="fx-arcane-cast__star" style="--i:2">✦</span>' +
    '<div class="fx-arcane-cast__ring"></div>';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 750);
}

// ---------- Reproductores por tipo ----------

async function playMelee(layer, from, to, sourceKey, targetKey) {
  const src = elByKey(sourceKey);
  const dx = (to.x - from.x) * 0.55;
  const dy = (to.y - from.y) * 0.55;
  if (src) {
    src.animate(
      [
        { transform: 'translate(0,0)' },
        { transform: `translate(${dx}px, ${dy}px)`, offset: 0.45 },
        { transform: 'translate(0,0)' },
      ],
      { duration: 360, easing: 'cubic-bezier(.3,.85,.4,1)' }
    );
  }
  await wait(170); // hasta el momento del golpe
  impact(layer, to, 'melee');
  flash(targetKey, 'is-hit', 340);
  await wait(200);
}

async function playRanged(layer, from, to, targetKey, variant) {
  spawnProjectile(layer, from, to, variant);
  await wait(380); // viaje del proyectil
  impact(layer, to, variant);
  flash(targetKey, 'is-hit', 340);
  await wait(120);
}

async function playHeal(layer, at, targetKey) {
  spawnHeal(layer, at);
  flash(targetKey, 'is-healing', 820);
  await wait(720);
}

async function playExplosion(layer, targets) {
  if (!targets?.length) return;
  for (const uid of targets) {
    const at = getCenter(uid);
    if (at) spawnExplosion(layer, at);
    flash(uid, 'is-hit', 500);
    await wait(50);
  }
  await wait(850);
}

async function playAoe(layer, from, targets) {
  if (!from || !targets?.length) return;
  // Dispara proyectiles a cada enemigo con un pequeño escalonado
  for (const uid of targets) {
    const to = getCenter(uid);
    if (to) spawnProjectile(layer, from, to, 'arcane');
    await wait(80);
  }
  await wait(300); // tiempo de viaje
  for (const uid of targets) {
    const to = getCenter(uid);
    if (to) impact(layer, to, 'arcane');
    flash(uid, 'is-hit', 340);
    await wait(60);
  }
  await wait(200);
}

async function playHealAll(layer, targets) {
  if (!targets?.length) return;
  for (const id of targets) {
    const at = getCenter(id);
    if (at) spawnHeal(layer, at);
    flash(id, 'is-healing', 820);
    await wait(100);
  }
  await wait(700);
}

async function playShieldAnim(layer, at, targetKey) {
  spawnShield(layer, at);
  flash(targetKey, 'is-shielded', 600);
  await wait(550);
}

async function playCleanseAnim(layer, at, targetKey) {
  spawnCleanse(layer, at);
  flash(targetKey, 'is-cleansed', 750);
  await wait(700);
}

/** Reproduce una entrada de log con animación. Resuelve cuando termina. */
export async function playEvent(layer, e) {
  if (prefersReduced()) return;

  // Efecto de canalización arcana sobre el lanzador (no bloqueante)
  if (e.kind === 'spell' && e.source) {
    const srcAt = getCenter(e.source);
    if (srcAt) spawnArcaneCast(layer, srcAt);
  }

  // AoE — múltiples objetivos, no usa e.target
  if (e.anim === 'explosion') {
    await playExplosion(layer, e.targets);
    return;
  }
  if (e.anim === 'aoe') {
    const from = e.source ? getCenter(e.source) : null;
    await playAoe(layer, from, e.targets);
    return;
  }
  if (e.anim === 'heal_all') {
    await playHealAll(layer, e.targets);
    return;
  }

  // Single-target — necesita e.target
  const to = getCenter(e.target);
  if (!to) return;

  if (e.anim === 'heal') {
    await playHeal(layer, to, e.target);
    return;
  }
  if (e.anim === 'shield') {
    await playShieldAnim(layer, to, e.target);
    return;
  }
  if (e.anim === 'cleanse') {
    await playCleanseAnim(layer, to, e.target);
    return;
  }

  const from = e.source ? getCenter(e.source) : null;
  if (!from) {
    flash(e.target, 'is-hit', 340);
    return;
  }
  if (e.anim === 'laser') {
    await playRanged(layer, from, to, e.target, 'laser');
  } else if (e.anim === 'ranged') {
    const variant = (e.kind === 'spell' || e.arcane) ? 'arcane' : 'arrow';
    await playRanged(layer, from, to, e.target, variant);
  } else {
    await playMelee(layer, from, to, e.source, e.target);
  }
}
