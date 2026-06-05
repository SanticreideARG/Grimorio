# GRIMORIO — Esquemas de contenido (CONTENT_SCHEMA)

> Formas de datos que el motor espera. Sirve para que Claude Code (y vos) agreguen
> contenido sin ambigüedad. Notación tipo TypeScript-lite (orientativa, no obliga
> a usar TS). Todo `id` es string única en su categoría y coincide con el nombre
> del archivo de imagen (ver ASSETS.md).

## Héroe
```js
{
  id: "guerrera",
  name: "Brenna la Quebrantahuesos",
  role: "Tanque / DPS frontal",
  maxHp: 14, maxMana: 1,
  dice: 3,                       // tamaño base del pool de dados
  spells: ["golpe_escudo"],      // ids de spells
  passive: { id, text, hook },   // hook = evento donde se dispara (onTurnStart, onHit...)
  portrait: "heroes/guerrera.png"
}
```

## Enemigo
```js
{
  id: "esbirro", name: "Esbirro Carroñero",
  maxHp: 5, dmg: 2,
  behavior: "weakest" | "tank" | "curse" | "summon" | "swarm" | "boss",
  art: "enemies/esbirro.png",
  isElite?: boolean
}
```

## Jefe (extiende Enemigo)
```js
{
  ...Enemigo, isBoss: true,
  art: "bosses/gulrath.png",
  behaviorDeck: ["embestida","invocar","bramido", ...]  // cartas de comportamiento
}
```

## Carta de comportamiento (jefe)
```js
{ id, name, text, effect: Effect, weight?: number }
```

## Nodo del tablero
```js
{
  id: "c1n03",
  type: "start"|"combat"|"elite"|"event"|"rest"|"shop"|"boss",
  name: "Emboscada",
  pos: { x: 22, y: 60 },          // % sobre la imagen del mapa
  enemies?: ["esbirro","esbirro"],// si combat/elite/boss
  eventPool?: "eventos"           // mazo a usar si event (opcional)
}
```

## Capítulo
```js
{
  id: "cap1", title: "El Valle Quemado",
  map: "board/cap1.png",
  nodes: [ Nodo, ... ],
  boss: "gulrath",
  doomMax: 12,
  script: { intro, bossIntro, victory }
}
```

## Hechizo (Magia)
```js
{
  id, name, cost,                       // cost en maná
  type: "attack"|"attack_all"|"heal"|"buff_block"|"cleanse"|"summon"|"debuff",
  power?, effect?: Effect, desc,
  icon: "spells/bola_fuego.png"
}
```

## Ítem (equipo permanente)
```js
{ id, name, desc, mod: { dice?, maxHp?, maxMana?, ... }, icon: "items/daga_afilada.png" }
```

## Poción (consumible)
```js
{ id, name, type: "heal"|"mana"|"cleanse"|..., power?, desc, icon }
```

## Maldición
```js
{
  id, name, desc,
  hook: "onCombatEnd"|"onIncomingDamage"|"blocksSpells"|...,
  // 🔲 Q-MALDICION: opcional `transform` si las maldiciones acumuladas mutan al héroe
  transform?: { threshold: number, into: Effect }
}
```

## Mascota / Compañero
```js
{
  id, name, desc, level: 1,
  hook: "onCombatStart"|"diceBonus"|...,
  // 🔲 Q-MASCOTAS: opcional progresión/riesgo
  upgrades?: [ { level, desc, effect } ],
  canFall?: boolean
}
```

## Carta de evento
```js
{
  id, title, text, art: "events/altar.png",
  choices: [
    { label, requires?: Check, effect: Effect }   // requires opcional (chequeo de dados/atributo)
  ]
}
```

## Effect (objeto de efecto reutilizable)
```js
{
  item?: id, potion?: id, curse?: id, pet?: id,
  gold?: number, doom?: number,
  heal?: number, damage?: number,
  target?: "self"|"party"|"random"|"choose",
  rest?: boolean, spawn?: [enemyId]
}
```

## Tirada de dados (referencia del motor)
```
Cara de d6 → símbolos. Config en data: diceFaces: [{sword:1},{sword:1},{sword:2},{shield:1},{star:1},{}]
Resultado de pool → { sword, shield, star, faces[] }
```
