// barks.js — Líneas de diálogo de combate ("barks") por personalidad.
// CONTENIDO puro (no lógica): la capa UI elige cuándo y con qué probabilidad
// mostrarlas (ver ui/combat/useCombatBarks.js). Solo se usan en batalla.
//
// Triggers:
//   attack → al iniciar un ataque/hechizo propio
//   hurt   → al recibir daño
//   idle   → frases sueltas (inicio de turno / fase enemiga)
//   taunt  → solo jefes: al usar su mazo de comportamiento
//
// Los jefes tienen líneas propias (bossBarks). Los enemigos comunes usan
// personalidad temática por región (personalityBarks + enemyPersonality).

// ───────────────────────── Héroes ─────────────────────────
export const heroBarks = {
  guerrera: { // Brenna la Quebrantahuesos — brutal, directa
    attack: ['¡A romper huesos!', '¡Esto va a doler!', '¡Apartaos!', '¡Por la fuerza!'],
    hurt:   ['¡Eso no es nada!', '¡Apenas lo sentí!', 'Grrr… ¡me las pagarás!', '¿Eso es todo?'],
    idle:   ['Acabemos con esto.', 'Ningún paso atrás.', 'Sostengo la línea.'],
  },
  paladin: { // Sir Aldric — noble, devoto
    attack: ['¡Por la luz!', '¡En nombre del refugio!', '¡Caed, impíos!', '¡Mi fe es mi escudo!'],
    hurt:   ['La luz me sostiene.', 'No flaquearé.', 'Aún resisto…', 'Por los caídos, aguanto.'],
    idle:   ['Protegeré a los míos.', 'Que la luz nos guíe.', 'Mantened la fe.'],
  },
  caballero_oscuro: { // sombrío, vampírico
    attack: ['Tu vida es mía.', 'La oscuridad reclama.', 'Sangra para mí.', 'Inevitable.'],
    hurt:   ['El dolor me alimenta.', 'Insignificante.', 'Ya estoy muerto por dentro.', 'Más…'],
    idle:   ['Todo perece.', 'La sombra no perdona.', 'Camino entre tumbas.'],
  },
  mago: { // Veyra de la Llama — ardiente, soberbia
    attack: ['¡Arded!', '¡Contemplad mi poder!', '¡Cenizas para vosotros!', '¡La llama no perdona!'],
    hurt:   ['¡Mi túnica!', '¡Inadmisible!', 'Ningún mortal me toca…', '¡Pagaréis caro!'],
    idle:   ['El fuego ansía salir.', 'Patético.', 'Que ardan todos.'],
  },
  sanadora: { // Maevis — serena, compasiva
    attack: ['Que esto te alivie… del existir.', 'Lo siento de veras.', 'Descansa ahora.', 'Por necesidad.'],
    hurt:   ['Resistiré por todos.', 'Aún puedo seguir.', 'No temáis.', 'La luz no se apaga.'],
    idle:   ['Manteneos en pie.', 'Estoy con vosotros.', 'Aún hay esperanza.'],
  },
  picara: { // Nix — sarcástica, ágil
    attack: ['¡Ni lo viste venir!', 'Justo en el punto débil.', 'Demasiado lento.', '¿Buscabas esto?'],
    hurt:   ['¡Oye, eso es trampa!', 'Vale, me lo merecía.', '¡Casi me despeinas!', 'Uy, dolió.'],
    idle:   ['Esto será divertido.', 'Sin testigos…', '¿Quién es el siguiente?'],
  },
  cazador: { // Corvin — preciso, parco
    attack: ['Un disparo.', 'Blanco fijado.', 'No fallo.', 'Respira hondo… ya.'],
    hurt:   ['Mala posición.', 'Reubicándome.', 'Tsk.', 'No otra vez.'],
    idle:   ['Tengo el ángulo.', 'Paciencia.', 'Veo todo desde aquí.'],
  },
  orphen: { // El Mago Oscuro — sombrío, calculador, indiferente
    attack: ['Sin rodeos.', 'Era inevitable.', 'Luz u oscuridad: el resultado es el mismo.', 'Ya terminó para ti.'],
    hurt:   ['Descuido mío.', '…Interesante.', 'No lo repetiré.', 'Eso sí dolió.'],
    idle:   ['No te confíes.', 'Cada movimiento tiene un precio.', 'Observo y aprendo.'],
  },
};

// ───────────────────────── Jefes ─────────────────────────
export const bossBarks = {
  gulrath: { // El Devorador de Aldeas — hambre, brutalidad
    attack: ['¡HAMBRE!', '¡Os devoraré a TODOS!', '¡Carne fresca!', '¡GULRATH come!'],
    hurt:   ['¡MÁS! ¡Dadme más!', 'Insectos…', '¡Eso aviva mi furia!', '¡No basta!'],
    taunt:  ['¡La horda os entierra!', '¡Temblad ante el Devorador!', '¡Vuestras aldeas ardieron por mí!'],
    idle:   ['Huelo vuestro miedo.', 'Tan pequeños… tan sabrosos.'],
  },
  la_tejedora: { // Tejedora de Maldiciones — siniestra
    attack: ['Quedáis atrapados.', 'Mis hilos os reclaman.', 'Tejed vuestra ruina.', 'Tan frágiles…'],
    hurt:   ['Mis hebras se rehacen.', '¿Creéis haberme herido?', 'Insolentes…', 'La seda no se rompe.'],
    taunt:  ['La desdicha es mi don.', 'Cada hilo, una maldición.', 'Bailad en mi red.'],
    idle:   ['Os observo desde mil ojos.', 'Vuestro destino ya está tejido.'],
  },
  rey_ceniza: { // El Rey Ceniza — majestuoso, muerte lenta
    attack: ['Arrodillaos ante la ceniza.', 'Mi reino es vuestra tumba.', 'Polvo seréis.', 'Inclinaos.'],
    hurt:   ['Un rey no cae.', '¿Osáis tocar la corona?', 'La ceniza renace.', 'Insignificantes súbditos.'],
    taunt:  ['Mi ciudadela jamás cae.', 'La muerte lenta os reclama.', 'Reinaré sobre vuestros huesos.'],
    idle:   ['Todo arde y se enfría.', 'Bienvenidos a mi corte de cenizas.'],
  },
  el_devorado: { // jefe final — vacío cósmico
    attack: ['Sois nada.', 'Os devuelvo al vacío.', 'El fin os alcanza.', 'Dejad de existir.'],
    hurt:   ['No podéis herir a la nada.', 'Vuestro esfuerzo es vano.', '…', 'El vacío no sangra.'],
    taunt:  ['Yo soy el final de todo.', 'Los mundos caen en mí.', 'Vuestro refugio será olvidado.'],
    idle:   ['Más allá de vosotros, solo yo.', 'El silencio os espera.'],
  },
};

// ───────── Personalidades temáticas (enemigos comunes) ─────────
export const personalityBarks = {
  feral: { // carroñeros del Valle Quemado
    attack: ['¡Grraaah!', '¡Carne!', '¡A por ellos!', '¡Sangre!'],
    hurt:   ['¡Iiieee!', '¡Gah!', '¡Duele!', '*chillido*'],
    idle:   ['*gruñe*', '*olfatea*', '*resopla*'],
  },
  spider: { // arañas de la Marisma
    attack: ['Ssss…', 'Quedaos quietos.', 'A mi tela.', '*siseo venenoso*'],
    hurt:   ['¡Skreee!', '*patas crujen*', '¡Sssagh!', '*se retuerce*'],
    idle:   ['*teje en silencio*', 'Ssss…', '*acecha*'],
  },
  ash: { // muertos y cultistas de la Ciudadela
    attack: ['Cenizas a las cenizas.', 'El Rey lo ordena.', 'Uníos a los muertos.', 'Ardéis.'],
    hurt:   ['Ya estoy muerto.', '*crepita*', 'No sentimos dolor.', '*ceniza cae*'],
    idle:   ['*susurra plegarias*', 'El fin se acerca.', '*humea*'],
  },
  void: { // horrores de la Grieta
    attack: ['No deberíais estar aquí.', 'Volved a la nada.', 'Sois un error.', '*chirrido imposible*'],
    hurt:   ['*realidad se quiebra*', 'No… importa…', '*eco vacío*', 'Irrelevante.'],
    idle:   ['*la grieta respira*', 'Nada perdura.', '*susurros sin boca*'],
  },
};

// Mapa enemigo → personalidad (los que no figuran caen al fallback por behavior).
export const enemyPersonality = {
  // Cap.1 — feral
  esbirro: 'feral', enjambre: 'feral', lanzador: 'feral', acechador: 'feral',
  invocador: 'feral', carronero_alfa: 'feral', caballero_caido: 'ash',
  // Cap.2 — spider
  arana: 'spider', larva_telar: 'spider', tejedor: 'spider', sanguijuela: 'spider',
  viuda_negra: 'spider', guardian_telar: 'spider', devorador_aracnido: 'spider',
  // Cap.3 — ash
  ceniciento: 'ash', ballesta_hueso: 'ash', cultista_ceniza: 'ash', nigromante: 'ash',
  caballero_brasa: 'ash', coloso_ceniza: 'ash', heraldo_ceniza: 'ash',
  // Cap.4 — void
  larva_vacio: 'void', abisal: 'void', heraldo_grieta: 'void', desgarrador: 'void',
  avatar_vacio: 'void', ojo_abismo: 'void',
};

// Fallback de personalidad por comportamiento, por si falta el mapeo directo.
const BEHAVIOR_FALLBACK = {
  swarm: 'feral', weakest: 'feral', tank: 'feral',
  summon: 'ash', curse: 'void',
};

// ───────────────────────── Selectores ─────────────────────────

/** Líneas de un héroe para un trigger (cae a idle si no hay específicas). */
export function heroLines(heroId, trigger) {
  const b = heroBarks[heroId];
  if (!b) return [];
  return b[trigger]?.length ? b[trigger] : (b.idle ?? []);
}

/** Líneas de un enemigo/jefe para un trigger. */
export function enemyLines(enemyId, isBoss, behavior, trigger) {
  if (isBoss && bossBarks[enemyId]) {
    const b = bossBarks[enemyId];
    return b[trigger]?.length ? b[trigger] : (b.idle ?? []);
  }
  const persona = enemyPersonality[enemyId] ?? BEHAVIOR_FALLBACK[behavior] ?? 'feral';
  const p = personalityBarks[persona];
  return p?.[trigger]?.length ? p[trigger] : (p?.idle ?? []);
}
