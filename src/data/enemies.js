// enemies.js — Banco de enemigos (M2/M5). Balance preliminar (se afina M5).
// behavior (enemyAI): weakest | tank | swarm | summon | curse | boss.
// row: 'front' (melé) protege a 'back' (a distancia). Ver schema.js (typedef Enemy).

/** @type {import('./schema.js').Enemy[]} */
export const enemies = [
  // --- Cap.1: El Valle Quemado ---
  { id: 'esbirro', name: 'Esbirro Carroñero', maxHp: 5, dmg: 2, behavior: 'swarm', row: 'front', art: 'enemies/esbirro.png' },
  { id: 'enjambre', name: 'Enjambre', maxHp: 4, dmg: 1, behavior: 'swarm', row: 'front', art: 'enemies/enjambre.png' },
  { id: 'lanzador', name: 'Lanzador de Brea', maxHp: 5, dmg: 3, behavior: 'weakest', row: 'back', art: 'enemies/lanzador.png' },
  { id: 'acechador', name: 'Acechador', maxHp: 7, dmg: 3, behavior: 'weakest', row: 'back', art: 'enemies/acechador.png' },
  { id: 'invocador', name: 'Invocador de Cenizas', maxHp: 8, dmg: 1, behavior: 'summon', row: 'back', summons: 'esbirro', art: 'enemies/invocador.png' },
  { id: 'carronero_alfa', name: 'Carroñero Alfa', maxHp: 14, dmg: 4, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/carronero_alfa.png' },
  { id: 'caballero_caido', name: 'Caballero Caído', maxHp: 16, dmg: 5, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/caballero_caido.png' },

  // --- Cap.2: La Marisma de Telarañas (más duros que el Cap.1) ---
  { id: 'arana', name: 'Araña de la Marisma', maxHp: 6, dmg: 2, behavior: 'swarm', row: 'front', art: 'enemies/arana.png' },
  { id: 'larva_telar', name: 'Larva del Telar', maxHp: 5, dmg: 2, behavior: 'swarm', row: 'front', art: 'enemies/larva_telar.png' },
  { id: 'tejedor', name: 'Tejedor de Sombras', maxHp: 8, dmg: 2, behavior: 'curse', row: 'back', art: 'enemies/tejedor.png' },
  { id: 'sanguijuela', name: 'Sanguijuela Gigante', maxHp: 7, dmg: 3, behavior: 'weakest', row: 'back', art: 'enemies/sanguijuela.png' },
  { id: 'viuda_negra', name: 'Viuda Negra', maxHp: 9, dmg: 2, behavior: 'summon', row: 'back', summons: 'arana', art: 'enemies/viuda_negra.png' },
  { id: 'guardian_telar', name: 'Guardián del Telar', maxHp: 18, dmg: 4, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/guardian_telar.png' },
  { id: 'devorador_aracnido', name: 'Devorador Arácnido', maxHp: 20, dmg: 5, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/devorador_aracnido.png' },

  // --- Cap.3: La Ciudadela de Ceniza ---
  { id: 'ceniciento', name: 'Ceniciento', maxHp: 7, dmg: 3, behavior: 'swarm', row: 'front', art: 'enemies/ceniciento.png' },
  { id: 'ballesta_hueso', name: 'Ballestero de Hueso', maxHp: 7, dmg: 4, behavior: 'weakest', row: 'back', art: 'enemies/ballesta_hueso.png' },
  { id: 'cultista_ceniza', name: 'Cultista de la Ceniza', maxHp: 9, dmg: 2, behavior: 'curse', row: 'back', art: 'enemies/cultista_ceniza.png' },
  { id: 'nigromante', name: 'Nigromante', maxHp: 11, dmg: 2, behavior: 'summon', row: 'back', summons: 'ceniciento', art: 'enemies/nigromante.png' },
  { id: 'caballero_brasa', name: 'Caballero de Brasa', maxHp: 12, dmg: 4, behavior: 'tank', row: 'front', art: 'enemies/caballero_brasa.png' },
  { id: 'coloso_ceniza', name: 'Coloso de Ceniza', maxHp: 22, dmg: 6, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/coloso_ceniza.png' },
  { id: 'heraldo_ceniza', name: 'Heraldo de Ceniza', maxHp: 18, dmg: 4, behavior: 'curse', row: 'back', isElite: true, art: 'enemies/heraldo_ceniza.png' },

  // --- Cap.4: La Grieta (los más duros) ---
  { id: 'larva_vacio', name: 'Larva del Vacío', maxHp: 9, dmg: 3, behavior: 'swarm', row: 'front', art: 'enemies/larva_vacio.png' },
  { id: 'abisal', name: 'Abisal', maxHp: 10, dmg: 5, behavior: 'weakest', row: 'back', art: 'enemies/abisal.png' },
  { id: 'heraldo_grieta', name: 'Heraldo de la Grieta', maxHp: 12, dmg: 3, behavior: 'curse', row: 'back', art: 'enemies/heraldo_grieta.png' },
  { id: 'desgarrador', name: 'Desgarrador', maxHp: 16, dmg: 6, behavior: 'tank', row: 'front', art: 'enemies/desgarrador.png' },
  { id: 'avatar_vacio', name: 'Avatar del Vacío', maxHp: 26, dmg: 7, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/avatar_vacio.png' },
  { id: 'ojo_abismo', name: 'Ojo del Abismo', maxHp: 20, dmg: 4, behavior: 'summon', row: 'back', summons: 'larva_vacio', isElite: true, art: 'enemies/ojo_abismo.png' },
];

export const enemiesById = Object.fromEntries(enemies.map((e) => [e.id, e]));
