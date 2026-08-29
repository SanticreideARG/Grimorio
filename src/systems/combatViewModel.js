// Adaptador de presentación: traduce el estado serializable del motor a una
// lectura estable para la UI. No decide acciones ni altera reglas.

const INTENTS = {
  weakest: { icon: '◆', label: 'Caza al herido', tone: 'attack' },
  tank:    { icon: '◈', label: 'Rompe la línea', tone: 'attack' },
  curse:   { icon: '✦', label: 'Prepara maldición', tone: 'curse' },
  summon:  { icon: '♜', label: 'Puede invocar', tone: 'summon' },
  swarm:   { icon: '⋰', label: 'Ataque de enjambre', tone: 'attack' },
  boss:    { icon: '☽', label: 'Patrón desconocido', tone: 'boss' },
};

export function enemyIntent(enemy) {
  const base = INTENTS[enemy?.behavior] ?? INTENTS.weakest;
  return { ...base, damage: enemy?.dmg ?? 0 };
}

export function buildCombatViewModel(combat) {
  const phase = combat?.phase ?? 'hero';
  const activeHeroId = combat?.heroes?.[combat.activeHeroIndex]?.id ?? null;
  const pendingEnemies = combat?.pendingEnemies ?? [];
  const nextEnemyUid = phase === 'enemy' ? (pendingEnemies[0] ?? null) : null;

  const heroes = (combat?.heroes ?? []).map((hero) => ({
    key: hero.id,
    name: hero.name.split(' ')[0],
    side: 'hero',
    status: hero.down ? 'down'
      : hero.id === activeHeroId && phase === 'hero' ? 'active'
      : hero.hasRolled ? 'done' : 'waiting',
  }));
  const enemies = (combat?.enemies ?? []).filter((enemy) => enemy.hp > 0).map((enemy) => ({
    key: enemy.uid,
    name: enemy.name,
    side: 'enemy',
    status: enemy.uid === nextEnemyUid ? 'active' : 'waiting',
  }));

  return {
    phase,
    phaseLabel: phase === 'hero' ? 'Fase de héroes' : phase === 'enemy' ? 'Fase enemiga' : 'Resolución',
    actors: phase === 'enemy' ? [...enemies, ...heroes] : [...heroes, ...enemies],
    nextEnemyUid,
    intents: Object.fromEntries((combat?.enemies ?? []).map((enemy) => [enemy.uid, enemyIntent(enemy)])),
  };
}
