// Registro declarativo: el contenido elige fxId; la UI decide cómo representarlo.
export const FX_PROFILES = Object.freeze({
  arcane: { color: '#c98bf0', projectile: 'arcane', signature: 'runes' },
  fire: { color: '#ff9a3c', projectile: 'fire', signature: 'embers' },
  shadow: { color: '#9a63d8', projectile: 'shadow', signature: 'runes' },
  blade: { color: '#bfe0ff', projectile: 'blade', signature: 'slash' },
  poison: { color: '#8fdc6b', projectile: 'poison', signature: 'drops' },
  arrow: { color: '#e8c483', projectile: 'arrow', signature: 'slash' },
  steel: { color: '#d8c39a', projectile: 'blade', signature: 'slash' },
  holy: { color: '#ffe9a8', projectile: 'holy', signature: 'runes' },
  tide: { color: '#55b8ad', projectile: 'tide', signature: 'tide' },
  pearl: { color: '#d9e9df', projectile: 'pearl', signature: 'pearl' },
  eclipse: { color: '#d34b3f', projectile: 'eclipse', signature: 'eclipse' },
  time: { color: '#c6a76a', projectile: 'time', signature: 'time' },
  void: { color: '#8b61bc', projectile: 'void', signature: 'void' },
});

export function resolveFxProfile(event = {}) {
  const id = event.fxId ?? event.school ?? 'arcane';
  return { id, ...(FX_PROFILES[id] ?? FX_PROFILES.arcane) };
}

