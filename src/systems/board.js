// board.js — Avance por nodos y resolución de nodo (recorrido 100% lineal).
// Selectores puros (lectura) + transiciones puras (devuelven nuevo estado).
// En M1 la resolución es narrativa/superficial; combate (M2), eventos/maldiciones
// (M3), descanso/tienda/progresión (M4) profundizan cada tipo de nodo.

import { content } from '../data/index.js';

// ---------- Selectores (lectura) ----------

export function getChapter(state) {
  return content.chapters[state.chapterIndex] ?? null;
}

export function getNodes(state) {
  return getChapter(state)?.nodes ?? [];
}

export function getCurrentNode(state) {
  return getNodes(state)[state.nodeIndex] ?? null;
}

export function isNodeResolved(state, node) {
  return node ? state.visited.includes(node.id) : false;
}

export function isCurrentResolved(state) {
  return isNodeResolved(state, getCurrentNode(state));
}

export function isLastNode(state) {
  const nodes = getNodes(state);
  return nodes.length > 0 && state.nodeIndex >= nodes.length - 1;
}

/** El capítulo está completo cuando su último nodo (el jefe) está resuelto. */
export function isChapterComplete(state) {
  const last = getNodes(state).at(-1);
  return !!last && state.visited.includes(last.id);
}

// ---------- Narrativa por tipo de nodo (M1: superficial) ----------

const NODE_LABEL = {
  start: 'Inicio',
  combat: 'Combate',
  elite: 'Élite',
  event: 'Evento',
  rest: 'Descanso',
  shop: 'Tienda',
  boss: 'Jefe',
};

const NODE_ACTION = {
  start: 'Comenzar el descenso',
  combat: 'Entrar en combate',
  elite: 'Enfrentar a la élite',
  event: 'Afrontar lo que venga',
  rest: 'Descansar',
  shop: 'Visitar al mercader',
  boss: 'Desafiar al jefe',
};

const NODE_INTRO = {
  start: 'No hay vuelta atrás. El valle os espera.',
  combat: 'Enemigos cierran el paso. Preparad las armas.',
  elite: 'Una presencia temible acecha el camino.',
  event: 'Algo aguarda en el sendero. Vuestra decisión tendrá peso.',
  rest: 'Un momento de calma junto al fuego. La party recupera fuerzas.',
  shop: 'Un mercader despliega sus mercancías. Es hora de gastar el oro.',
  boss: 'El señor de este capítulo se alza ante vosotros.',
};

export const nodeLabel = (type) => NODE_LABEL[type] ?? type;
export const nodeActionLabel = (type) => NODE_ACTION[type] ?? 'Resolver';
export const describeNode = (node) => (node ? NODE_INTRO[node.type] ?? '' : '');

// ---------- Transiciones (devuelven nuevo estado) ----------

/**
 * Marca un nodo como resuelto (visitado + entrada de log con texto dado).
 * No-op si ya estaba resuelto. Lo usa tanto la resolución narrativa (M1) como
 * la victoria de combate (M2).
 */
export function markNodeResolved(state, node, text) {
  if (!node || state.visited.includes(node.id)) return state;
  const entry = { node: node.id, type: node.type, name: node.name, text, at: Date.now() };
  return {
    ...state,
    visited: [...state.visited, node.id],
    log: [...(state.log ?? []), entry],
  };
}

/**
 * Resuelve el nodo actual con su texto narrativo (nodos no-combate en M1).
 * @returns {{state: object, entry: object|null}}
 */
export function resolveNode(state) {
  const node = getCurrentNode(state);
  const next = markNodeResolved(state, node, describeNode(node));
  return { state: next, entry: next === state ? null : next.log.at(-1) };
}

/** Avanza al siguiente nodo si el actual está resuelto y no es el último. */
export function advanceNode(state) {
  if (!isCurrentResolved(state) || isLastNode(state)) return state;
  return { ...state, nodeIndex: state.nodeIndex + 1 };
}
