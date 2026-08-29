// Geometría pura del tablero 16:9. No conoce React, DOM ni estado de partida.
export const BOARD_VIEWBOX = Object.freeze({ width: 1000, height: 562.5 });

export function toViewPoint(pos, width = BOARD_VIEWBOX.width, height = BOARD_VIEWBOX.height) {
  const x = Number(pos?.x);
  const y = Number(pos?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x: (x / 100) * width, y: (y / 100) * height };
}

const format = (number) => Number(number.toFixed(2));

/** Devuelve una curva cúbica por par de nodos usando tangentes Catmull–Rom. */
export function buildRouteSegments(nodes = [], options = {}) {
  const width = options.width ?? BOARD_VIEWBOX.width;
  const height = options.height ?? BOARD_VIEWBOX.height;
  const tension = options.tension ?? 0.35;
  const points = nodes.map((node) => toViewPoint(node.pos, width, height));
  if (points.length < 2 || points.some((point) => point == null)) return [];

  return points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    const before = points[index - 1] ?? start;
    const after = points[index + 2] ?? end;
    const c1 = {
      x: start.x + ((end.x - before.x) * tension) / 3,
      y: start.y + ((end.y - before.y) * tension) / 3,
    };
    const c2 = {
      x: end.x - ((after.x - start.x) * tension) / 3,
      y: end.y - ((after.y - start.y) * tension) / 3,
    };
    return {
      index,
      from: index,
      to: index + 1,
      d: `M ${format(start.x)} ${format(start.y)} C ${format(c1.x)} ${format(c1.y)}, ${format(c2.x)} ${format(c2.y)}, ${format(end.x)} ${format(end.y)}`,
    };
  });
}

export function getCameraTarget(nodes = [], currentIndex = 0) {
  const node = nodes[currentIndex] ?? nodes[0];
  if (!node) return null;
  const point = toViewPoint(node.pos);
  if (!point) return null;
  const bias = node.cameraBias ?? {};
  return {
    x: point.x + ((Number(bias.x) || 0) / 100) * BOARD_VIEWBOX.width,
    y: point.y + ((Number(bias.y) || 0) / 100) * BOARD_VIEWBOX.height,
  };
}

/** Errores rompen QA; warnings indican composición apretada pero renderizable. */
export function validateBoardLayout(chapter) {
  const errors = [];
  const warnings = [];
  const nodes = chapter?.nodes ?? [];
  if (nodes.length < 2) errors.push('El tablero necesita al menos dos nodos.');
  const ids = new Set();
  nodes.forEach((node, index) => {
    if (!node?.id || ids.has(node.id)) errors.push(`ID duplicado o ausente en nodo ${index}.`);
    ids.add(node?.id);
    const x = Number(node?.pos?.x);
    const y = Number(node?.pos?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) errors.push(`Coordenada inválida en ${node?.id ?? index}.`);
    else {
      if (x < 0 || x > 100 || y < 0 || y > 100) errors.push(`Coordenada fuera del canvas en ${node.id}.`);
      if (x < 8 || x > 92 || y < 10 || y > 90) warnings.push(`${node.id} está fuera de la zona segura recomendada.`);
    }
  });
  if (nodes[0]?.type !== 'start') errors.push('El primer nodo debe ser start.');
  if (nodes.at(-1)?.type !== 'boss') errors.push('El último nodo debe ser boss.');
  return { errors, warnings };
}

