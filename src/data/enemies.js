// enemies.js — Banco de enemigos (M2/M5). Balance preliminar (se afina M5).
// behavior (enemyAI): weakest | tank | swarm | summon | curse | boss.
// row: 'front' (melé) protege a 'back' (a distancia). Ver schema.js (typedef Enemy).

/** @type {import('./schema.js').Enemy[]} */
export const enemies = [
  // --- Cap.1: El Valle Quemado ---
  { id: 'esbirro', name: 'Esbirro Carroñero', maxHp: 5, dmg: 2, behavior: 'swarm', row: 'front', art: 'enemies/esbirro.png',
    lore: 'Restos humanos corrompidos por el Vacío. Atacan en masa sin piedad ni razonamiento propio.' },
  { id: 'enjambre', name: 'Enjambre', maxHp: 4, dmg: 1, behavior: 'swarm', row: 'front', art: 'enemies/enjambre.png',
    lore: 'Una marea de criaturas diminutas que devoran todo a su paso, unidas por el hambre del Vacío.' },
  { id: 'lanzador', name: 'Lanzador de Brea', maxHp: 5, dmg: 3, behavior: 'weakest', row: 'back', art: 'enemies/lanzador.png',
    lore: 'Arroja brea ardiente desde la distancia. Apunta al más débil para quebrar la línea de frente.' },
  { id: 'acechador', name: 'Acechador', maxHp: 7, dmg: 3, behavior: 'weakest', row: 'back', art: 'enemies/acechador.png',
    lore: 'Sigilo y velocidad letales. Se mueve entre las sombras y siempre elige a quien ya está herido.' },
  { id: 'invocador', name: 'Invocador de Cenizas', maxHp: 8, dmg: 1, behavior: 'summon', row: 'back', summons: 'esbirro', art: 'enemies/invocador.png',
    lore: 'Su canto fúnebre convoca a los caídos para que se levanten y vuelvan a luchar una vez más.' },
  { id: 'carronero_alfa', name: 'Carroñero Alfa', maxHp: 14, dmg: 4, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/carronero_alfa.png',
    lore: 'El líder de los carroñeros del Valle. Su piel endurecida por años de batalla desafía el acero.' },
  { id: 'caballero_caido', name: 'Caballero Caído', maxHp: 16, dmg: 5, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/caballero_caido.png',
    lore: 'Fue un guerrero honorable. Cayó ante el Vacío y ahora su juramento de proteger se ha invertido.' },

  // --- Cap.2: La Marisma de Telarañas ---
  { id: 'arana', name: 'Araña de la Marisma', maxHp: 6, dmg: 2, behavior: 'swarm', row: 'front', art: 'enemies/arana.png',
    lore: 'Arañas mutadas por la magia oscura de la marisma. Pequeñas pero letales cuando actúan en grupo.' },
  { id: 'larva_telar', name: 'Larva del Telar', maxHp: 5, dmg: 2, behavior: 'swarm', row: 'front', art: 'enemies/larva_telar.png',
    lore: 'Larvas que tejen redes de seda negra para inmovilizar a sus presas antes de devorarlas.' },
  { id: 'tejedor', name: 'Tejedor de Sombras', maxHp: 8, dmg: 2, behavior: 'curse', curse: 'debilidad', row: 'back', art: 'enemies/tejedor.png',
    lore: 'Maestra de las artes oscuras de la maldición. Sus hechizos debilitan el cuerpo y enturbian el alma.' },
  { id: 'sanguijuela', name: 'Sanguijuela Gigante', maxHp: 7, dmg: 3, behavior: 'weakest', row: 'back', art: 'enemies/sanguijuela.png',
    lore: 'Una bestia de la marisma que drena la sangre de las presas más vulnerables hasta dejarlas vacías.' },
  { id: 'viuda_negra', name: 'Viuda Negra', maxHp: 9, dmg: 2, behavior: 'summon', row: 'back', summons: 'arana', art: 'enemies/viuda_negra.png',
    lore: 'La madre araña. Desde la sombra invoca a sus crías para protegerse mientras ella teje su tela.' },
  { id: 'guardian_telar', name: 'Guardián del Telar', maxHp: 18, dmg: 4, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/guardian_telar.png',
    lore: 'Guardián ancestral de la marisma, su cuerpo está imbuido de magia de telaraña. Casi invulnerable.' },
  { id: 'devorador_aracnido', name: 'Devorador Arácnido', maxHp: 20, dmg: 5, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/devorador_aracnido.png',
    lore: 'Una bestia arácnida monstruosa criada en los pantanos más profundos. Devora huesos y todo.' },

  // --- Cap.3: La Ciudadela de Ceniza ---
  { id: 'ceniciento', name: 'Ceniciento', maxHp: 7, dmg: 3, behavior: 'swarm', row: 'front', art: 'enemies/ceniciento.png',
    lore: 'Un muerto viviente cubierto de ceniza del Señor de Brasa. Imparable hasta que se le destruye por completo.' },
  { id: 'ballesta_hueso', name: 'Ballestero de Hueso', maxHp: 7, dmg: 4, behavior: 'weakest', row: 'back', art: 'enemies/ballesta_hueso.png',
    lore: 'Arquero esquelético que dispara virotes tallados de hueso humano a distancias insólitas.' },
  { id: 'cultista_ceniza', name: 'Cultista de la Ceniza', maxHp: 9, dmg: 2, behavior: 'curse', curse: 'silencio', row: 'back', art: 'enemies/cultista_ceniza.png',
    lore: 'Fanático que practica rituales de silenciamiento. Su voz ahoga los hechizos antes de ser lanzados.' },
  { id: 'nigromante', name: 'Nigromante', maxHp: 11, dmg: 2, behavior: 'summon', row: 'back', summons: 'ceniciento', art: 'enemies/nigromante.png',
    lore: 'Maestro de los muertos. Con un gesto puede revivir a los caídos del campo de batalla.' },
  { id: 'caballero_brasa', name: 'Caballero de Brasa', maxHp: 12, dmg: 4, behavior: 'tank', row: 'front', art: 'enemies/caballero_brasa.png',
    lore: 'Un guerrero forjado en el fuego eterno de la ciudadela. Su armadura calcificada rechaza el daño.' },
  { id: 'coloso_ceniza', name: 'Coloso de Ceniza', maxHp: 22, dmg: 6, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/coloso_ceniza.png',
    lore: 'Un titán de ceniza y hueso condensado por magia oscura. Aplasta todo a su paso sin detenerse.' },
  { id: 'heraldo_ceniza', name: 'Heraldo de Ceniza', maxHp: 18, dmg: 4, behavior: 'curse', curse: 'veneno', row: 'back', isElite: true, art: 'enemies/heraldo_ceniza.png',
    lore: 'El emisario del Señor de Brasa. Sus garras inoculan un veneno que corroe hasta el alma misma.' },

  // --- Cap.4: La Grieta ---
  { id: 'larva_vacio', name: 'Larva del Vacío', maxHp: 9, dmg: 3, behavior: 'swarm', row: 'front', art: 'enemies/larva_vacio.png',
    lore: 'Una criatura del Vacío en su forma más primitiva. Hambrienta, sin razón, guiada solo por el instinto de consumir.' },
  { id: 'abisal', name: 'Abisal', maxHp: 10, dmg: 5, behavior: 'weakest', row: 'back', art: 'enemies/abisal.png',
    lore: 'Nacida de las profundidades del Vacío. Su sola presencia corrompe la mente de quienes la miran.' },
  { id: 'heraldo_grieta', name: 'Heraldo de la Grieta', maxHp: 12, dmg: 3, behavior: 'curse', curse: 'confusion', row: 'back', art: 'enemies/heraldo_grieta.png',
    lore: 'El mensajero del Vacío. Siembra confusión entre las filas enemigas con su canto discordante.' },
  { id: 'desgarrador', name: 'Desgarrador', maxHp: 16, dmg: 5, behavior: 'curse', curse: 'sangria', row: 'front', art: 'enemies/desgarrador.png',
    lore: 'Una bestia del Vacío que desgarra la realidad con sus garras. Cada golpe suyo abre una cicatriz en el mundo que no cesa de sangrar.' },
  { id: 'avatar_vacio', name: 'Avatar del Vacío', maxHp: 26, dmg: 7, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/avatar_vacio.png',
    lore: 'La manifestación física del Vacío. Su presencia dobla el tiempo y el espacio. Nada puede resistirle mucho tiempo.' },
  { id: 'ojo_abismo', name: 'Ojo del Abismo', maxHp: 20, dmg: 4, behavior: 'summon', row: 'back', summons: 'larva_vacio', isElite: true, art: 'enemies/ojo_abismo.png',
    lore: 'Un ojo eterno que contempla desde el Vacío. Con solo mirar invoca larvas que ejecutan su voluntad ancestral.' },

  // --- Cap.5: Las Costas de Sal Negra ---
  { id: 'ahogado_sal', name: 'Ahogado de Sal', maxHp: 10, dmg: 4, behavior: 'swarm', row: 'front', art: 'enemies/ahogado_sal.png', lore: 'Marinero cristalizado por sal negra; avanza con las voces de su tripulación.' },
  { id: 'gaviota_osaria', name: 'Gaviota Osaria', maxHp: 8, dmg: 5, behavior: 'weakest', row: 'back', art: 'enemies/gaviota_osaria.png', lore: 'Ave de huesos y anzuelos que localiza a los heridos desde la tormenta.' },
  { id: 'corsario_hueco', name: 'Corsario Hueco', maxHp: 14, dmg: 5, behavior: 'tank', row: 'front', art: 'enemies/corsario_hueco.png', lore: 'Una armadura naval vacía, colmada de agua negra y obediencia.' },
  { id: 'cantor_marea', name: 'Cantor de la Marea', maxHp: 11, dmg: 3, behavior: 'curse', curse: 'mareo_abismo', row: 'back', art: 'enemies/cantor_marea.png', lore: 'Su caracola entona la presión de un océano sin superficie.' },
  { id: 'recolector_nacar', name: 'Recolector de Nácar', maxHp: 12, dmg: 2, behavior: 'summon', summons: 'ahogado_sal', row: 'back', art: 'enemies/recolector_nacar.png', lore: 'Abre conchas funerarias para devolver ahogados al combate.' },
  { id: 'capitan_sin_pulso', name: 'Capitán sin Pulso', maxHp: 25, dmg: 7, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/capitan_sin_pulso.png', lore: 'El último timonel de Puerto Albor, encadenado a su ancla.' },
  { id: 'oraculo_salmuera', name: 'Oráculo de Salmuera', maxHp: 21, dmg: 5, behavior: 'curse', curse: 'petrificacion_sal', row: 'back', isElite: true, art: 'enemies/oraculo_salmuera.png', lore: 'Ve futuros inmóviles a través de ojos de sal negra.' },

  // --- Cap.6: El Monasterio del Eclipse ---
  { id: 'penitente_ciego', name: 'Penitente Ciego', maxHp: 11, dmg: 4, behavior: 'swarm', row: 'front', art: 'enemies/penitente_ciego.png', lore: 'Repite el mismo paso desde que el eclipse detuvo el día.' },
  { id: 'monje_campana', name: 'Monje Campana', maxHp: 16, dmg: 6, behavior: 'tank', row: 'front', art: 'enemies/monje_campana.png', lore: 'Cada golpe contra su torso de bronce anuncia una hora inexistente.' },
  { id: 'arquero_meridiano', name: 'Arquero del Meridiano', maxHp: 10, dmg: 6, behavior: 'weakest', row: 'back', art: 'enemies/arquero_meridiano.png', lore: 'Dispara fragmentos del último rayo de mediodía.' },
  { id: 'cantor_nona', name: 'Cantor de la Nona', maxHp: 13, dmg: 4, behavior: 'curse', curse: 'eclipse_interior', row: 'back', art: 'enemies/cantor_nona.png', lore: 'Canta la hora que Serath intenta imponer al mundo.' },
  { id: 'sacristan_reloj', name: 'Sacristán del Reloj', maxHp: 14, dmg: 3, behavior: 'summon', summons: 'penitente_ciego', row: 'back', art: 'enemies/sacristan_reloj.png', lore: 'Recoge minutos descartados y les da forma de penitente.' },
  { id: 'caballero_eclipse', name: 'Caballero del Eclipse', maxHp: 28, dmg: 8, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/caballero_eclipse.png', lore: 'Mitad juramento solar, mitad sombra lunar; ninguna parte puede ceder.' },
  { id: 'angel_horas_rotas', name: 'Ángel de las Horas Rotas', maxHp: 24, dmg: 6, behavior: 'curse', curse: 'tic_sangriento', row: 'back', isElite: true, art: 'enemies/angel_horas_rotas.png', lore: 'Sus alas contienen relojes que laten con sangre ajena.' },
];

export const enemiesById = Object.fromEntries(enemies.map((e) => [e.id, e]));
