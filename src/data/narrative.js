// narrative.js — Capa narrativa por nodo (CONTENIDO puro, sin lógica de motor).
// Tres voces que se muestran en el panel del nodo al pisarlo (MapScreen):
//   place → narración del Maestro de Ceremonias: qué era este sitio ANTES de la
//           guerra y qué queda ahora. Tono oscuro con humor ácido puntual.
//   bark  → comentario PERSONALIZADO de un héroe, solo si está en la party.
//           Refleja su personalidad (ver barks.js) y su pérdida personal.
//   lore  → goteo del trasfondo del Rey Ceniza / El Devorado en nodos clave.
//
// CANON (definido con el usuario):
//   El Rey Ceniza perdió su reino en la guerra; en su duelo decidió que el mundo
//   ardiera con él. Invocó a El Devorado (arma del Vacío) y no pudo controlarlo:
//   ahora la Grieta consume todo. Los héroes son sobrevivientes con cuentas
//   pendientes. El Caballero Oscuro fue caballero del propio Rey antes de la caída.
//
// Reglas anti-fatiga: en un recorrido lineal cada nodo se pisa una sola vez, así
// que la narración aparece naturalmente una única vez. Un bark por nodo como mucho.

// ───────────────────────── Capítulo 1: El Valle Quemado ─────────────────────────
// Gulrath (Devorador de Aldeas): no sirve al Rey; es la carroña que sigue al fuego.

const cap1 = {
  c1n01: {
    place:
      'Antes, este valle alimentaba a tres comarcas: el trigo llegaba hasta el ' +
      'horizonte. Ahora el horizonte llega hasta aquí, y es del color del carbón.',
    heroBarks: {
      picara: ['Encantador. ¿Quién quiere mudarse?'],
      guerrera: ['Conozco este olor. Es el de después de una batalla perdida.'],
    },
  },
  c1n02: {
    place:
      'El camino real unía el valle con la capital. Los postes de millas siguen ' +
      'en pie, contando distancias a ciudades que ya no existen.',
    heroBarks: {
      cazador: ['Huellas frescas sobre la ceniza. No somos los únicos aquí.'],
    },
  },
  c1n03: {
    place:
      'Cuatro caminos, cuatro destinos, todos terminan igual. Un viajero clavó ' +
      'aquí su bastón y no eligió ninguno. Fue, quizá, el más sabio.',
    heroBarks: {
      paladin: [
        'Mi orden juró proteger estos cruces. Mi orden ya no existe. El juramento, al parecer, sí.',
      ],
    },
  },
  c1n04: {
    place:
      'Aquí ondeaba la cebada. Cuando sopla el viento, la ceniza todavía imita el ' +
      'vaivén de las espigas. Es casi hermoso. Casi.',
  },
  c1n05: {
    place:
      'Donde hay catástrofe, hay quien venda paraguas. Este hombre sobrevivió al ' +
      'fin del mundo con su inventario intacto. Nadie pregunta cómo.',
    heroBarks: {
      picara: ['Me cae bien. Roba, pero con recibo.'],
      mago: ['Precios de saqueador. En fin: el oro no abriga.'],
    },
  },
  c1n06: {
    place:
      'Fue una posada: "El Buen Reposo". El cartel aún cuelga, chamuscado. Al ' +
      'menos cumple la mitad de su promesa.',
    heroBarks: {
      sanadora: ['Descansad. Los muertos no tienen prisa, y nosotros aún no somos de los suyos.'],
    },
  },
  c1n07: {
    place:
      'Aquí vivían doscientas almas. Celebraban la feria de la cosecha cada otoño. ' +
      'Este otoño, los espantapájaros son de verdad.',
    heroBarks: {
      guerrera: ['Bailé en una feria como esta. Una vez. No se me da bien recordarlo.'],
    },
  },
  c1n08: {
    place:
      'Las bestias no provocaron la guerra. Solo aprendieron que, después de una, ' +
      'siempre hay banquete.',
    heroBarks: {
      picara: ['Genial. La cadena alimenticia acaba de ascender de puesto.'],
    },
  },
  c1n09: {
    place:
      'El pozo del pueblo. Dicen que una moneda al fondo concede un deseo. El fondo ' +
      'está cubierto de monedas. Ninguno se cumplió.',
    heroBarks: {
      mago: ['Pide agua. Es lo único realista que queda por pedir.'],
    },
  },
  c1n10: {
    place:
      'La niebla del valle era célebre por su calma al alba. Ahora oculta cosas que ' +
      'prefieren no ser vistas hasta el momento exacto en que muerden.',
  },
  c1n11: {
    place:
      'Un claro con un árbol solitario, intacto entre tanta ruina. Hasta el fuego, ' +
      'parece, tuvo un instante de duda.',
    heroBarks: {
      sanadora: ['Un árbol vivo. Lo tomaré como una señal. Necesito creer en señales.'],
      caballero_oscuro: ['El fuego no dudó. Simplemente no terminó. Volverá.'],
    },
  },
  c1n12: {
    place:
      'Portó los colores de un rey que ya no reina. Murió defendiendo un muro que ya ' +
      'no existe. Y, aun así, no ha dejado de defenderlo.',
    lore:
      'El Caballero Oscuro reconoce el blasón: una corona partida sobre fondo de ceniza. ' +
      'El emblema del Rey, de cuando todavía era un hombre con un trono que perder.',
    heroBarks: {
      caballero_oscuro: ['Conozco esa armadura. Vestí una igual. Antes de… todo esto.'],
      paladin: ['Que los caídos descansen. Aunque este insista en lo contrario.'],
    },
  },
  c1n13: {
    place:
      'El gran bazar del valle. Se comerciaba con seda, especias y secretos. Hoy se ' +
      'comercia con lo que no ardió: poco, y caro.',
    heroBarks: {
      picara: ['Mi tipo de lugar. O lo era, cuando aún tenía techo.'],
    },
  },
  c1n14: {
    place:
      'Un altar a los Tres Hermanos: dioses de la cosecha, la lluvia y el descanso. ' +
      'Alguien talló encima un cuarto símbolo. A ese no le recéis.',
    lore:
      'El cuarto signo es una espiral que se devora a sí misma. No es un dios viejo: ' +
      'es algo que el Rey llamó desde más allá, y que ahora tiene más hambre que él.',
    heroBarks: {
      paladin: ['Profanaron lo sagrado. Mi fe vacila. Mi espada, no.'],
      mago: ['Cuatro dioses, ahora. El nuevo se ve… hambriento.'],
    },
  },
  c1n15: {
    place:
      'La última hoguera amistosa antes de las tierras de Gulrath. Disfrutad del calor: ' +
      'es lo último cálido que la bestia os dejará sentir.',
    heroBarks: {
      guerrera: ['Comed. Afilad. Rezad si os sirve. Mañana rompemos algo grande.'],
      picara: ['¿Un brindis por los que no llegamos hasta acá? No. Demasiado largo.'],
    },
  },
  c1n16: {
    place:
      'Gulrath no sirve al Rey Ceniza. Es lo que viene DESPUÉS del Rey: las fauces que ' +
      'limpian lo que el fuego deja. Donde pasa, ni la ceniza sobrevive.',
    lore:
      'Criaturas como esta no existían antes. La devastación del Rey las atrajo desde los ' +
      'rincones del mundo, como moscas a una herida que no cierra.',
    heroBarks: {
      caballero_oscuro: ['El Rey quemó el valle. Esta cosa vino a lamer el plato. Así de bajo hemos caído.'],
      guerrera: ['Grande, feo y hambriento. Mi especialidad.'],
    },
  },
};

// Registro por capítulo (caps 2-4 se irán completando).
export const narrative = {
  ...cap1,
};

// ───────────────────────── Selector (puro) ─────────────────────────

// Hash determinista de una cadena (para elegir bark sin estado ni flicker).
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Narración de un nodo para la party actual.
 * @param {string} nodeId
 * @param {string[]} party  ids de héroes en el grupo
 * @returns {{ place: string|null, lore: string|null, bark: {heroId,line}|null } | null}
 */
export function getNodeNarration(nodeId, party = []) {
  const entry = narrative[nodeId];
  if (!entry) return null;

  let bark = null;
  if (entry.heroBarks) {
    // Héroes presentes que tienen algo que decir aquí.
    const candidates = party.filter((id) => entry.heroBarks[id]?.length);
    if (candidates.length) {
      const heroId = candidates[hashStr(nodeId) % candidates.length];
      const lines = entry.heroBarks[heroId];
      const line = lines[hashStr(nodeId + heroId) % lines.length];
      bark = { heroId, line };
    }
  }

  return { place: entry.place ?? null, lore: entry.lore ?? null, bark };
}
