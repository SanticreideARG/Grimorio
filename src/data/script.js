// script.js — Textos del Maestro de Ceremonias (CPU narra en pantalla).
// Tono épico-serio (Q-NARRATIVA). Vacío en M0; se llena junto al contenido.

export const script = {
  intro:
    'Sois lo único que se interpone entre la oscuridad y el último refugio. ' +
    'El camino es uno solo, y no tiene vuelta atrás.',

  endings: {
    good:
      'La Grieta se sella para siempre. Volváis a casa cubiertos de cicatrices ' +
      'pero con la cabeza en alto: cada decisión, cada mano tendida, cada momento ' +
      'de piedad en un camino sin piedad fue una piedra sobre la que se sostuvo el mundo. ' +
      'El último refugio canta vuestros nombres. La oscuridad os teme.',

    bittersweet:
      'La Grieta colapsa sobre sí misma y el terror que la habitaba se apaga. ' +
      'Sobrevivisteis, aunque el precio fue alto y el camino dejó heridas que ' +
      'tardarán en cicatrizar. El refugio permanece en pie, tal vez gracias a vosotros, ' +
      'tal vez a pesar de vosotros. El mundo sigue. Eso tendrá que bastar.',

    bad:
      'El Devorado cae, sí, pero la Perdición que sembrasteis a lo largo del viaje ' +
      'ya ha germinado. Las sombras que ignorasteis, los inocentes que abandonasteis, ' +
      'los altares que profanasteis: todo cobra su precio. El refugio sobrevive apenas, ' +
      'mutado, oscuro, difícilmente digno de llamarse hogar. Ganasteis la batalla. ' +
      'Perdisteis algo más difícil de nombrar.',
  },
  expansionEndings: {
    good: 'La semilla se apaga y el tiempo vuelve a avanzar. Puerto Albor conserva sus nombres; el monasterio acepta su primera noche. No recuperasteis lo perdido: hicisteis algo más difícil. Le permitisteis descansar.',
    bittersweet: 'El eclipse termina, aunque algunos recuerdos permanecen encadenados a la sal y a las campanas. El mundo continúa incompleto, como todos los que lo habitan. Esta vez nadie intentará obligarlo a retroceder.',
    bad: 'La semilla concede el deseo. Durante un instante todo vuelve a ser como antes de la guerra. Luego el instante se repite. Y se repite. El mundo ya no sufre pérdidas, porque tampoco puede llegar a mañana.',
  },
};
