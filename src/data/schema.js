// schema.js — Typedefs JSDoc del contenido (espejo de docs/CONTENT_SCHEMA.md).
// No exporta lógica: documenta las formas de datos que el motor espera.
// Los `id` son únicos por categoría y coinciden con el nombre del asset.

/**
 * @typedef {Object} Hero
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {number} maxHp
 * @property {number} maxMana
 * @property {number} dice            tamaño base del pool de dados
 * @property {string[]} spells        ids de hechizos
 * @property {'front'|'back'|'any'} [row]   fila de combate (Q-COMBATE-POS)
 * @property {{id:string,text:string,hook:string}} [passive]
 * @property {string} portrait        ruta del retrato (heroes/<id>.png)
 */

/**
 * @typedef {Object} Enemy
 * @property {string} id
 * @property {string} name
 * @property {number} maxHp
 * @property {number} dmg
 * @property {'weakest'|'tank'|'curse'|'summon'|'swarm'|'boss'} behavior
 * @property {'front'|'back'} [row]
 * @property {boolean} [isElite]
 * @property {string} art             enemies/<id>.png
 */

/**
 * @typedef {Enemy & {isBoss:true, behaviorDeck:string[]}} Boss
 */

/**
 * @typedef {Object} BoardNode
 * @property {string} id              p.ej. "c1n03"
 * @property {'start'|'combat'|'elite'|'event'|'rest'|'shop'|'boss'} type
 * @property {string} name
 * @property {{x:number,y:number}} pos   % sobre la imagen del mapa
 * @property {string[]} [enemies]     si combat/elite/boss
 * @property {string} [eventPool]     mazo a usar si event
 */

/**
 * @typedef {Object} Chapter
 * @property {string} id
 * @property {string} title
 * @property {string} map             board/<id>.png (o .html)
 * @property {BoardNode[]} nodes
 * @property {string} boss            id del jefe
 * @property {number} doomMax
 * @property {{intro:string,bossIntro:string,victory:string}} script
 */

/**
 * @typedef {Object} Spell
 * @property {string} id
 * @property {string} name
 * @property {number} cost            maná
 * @property {'attack'|'attack_all'|'heal'|'buff_block'|'cleanse'|'summon'|'debuff'} type
 * @property {number} [power]
 * @property {Effect} [effect]
 * @property {string} desc
 * @property {string} icon
 */

/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {string} name
 * @property {string} desc
 * @property {{dice?:number,maxHp?:number,maxMana?:number}} mod
 * @property {number} [price]         coste en oro en la tienda (M4)
 * @property {string} icon
 */

/**
 * @typedef {Object} Potion
 * @property {string} id
 * @property {string} name
 * @property {'heal'|'mana'|'cleanse'} type
 * @property {number} [power]
 * @property {number} [price]         coste en oro en la tienda (M4)
 * @property {string} desc
 * @property {string} icon
 */

/**
 * @typedef {Object} Curse
 * @property {string} id
 * @property {string} name
 * @property {string} desc
 * @property {string} hook            onCombatEnd | onIncomingDamage | blocksSpells | ...
 * @property {number} [duration]      turnos que dura (Q-MALDICION: 1–3)
 */

/**
 * @typedef {Object} Pet
 * @property {string} id
 * @property {string} name
 * @property {string} desc
 * @property {string} hook            onCombatStart | diceBonus | ...
 * @property {false} [canFall]        Q-MASCOTAS: no caen en v1
 */

/**
 * @typedef {Object} Check
 * @property {'sword'|'shield'|'star'} symbol   símbolo a chequear
 * @property {number} threshold                 cantidad necesaria
 */

/**
 * @typedef {Object} EventChoice
 * @property {string} label
 * @property {Check} [requires]       chequeo opcional (tirada de dados)
 * @property {Effect} effect
 */

/**
 * @typedef {Object} EventCard
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {string} art
 * @property {EventChoice[]} choices
 */

/**
 * @typedef {Object} Effect
 * @property {string} [item]
 * @property {string} [potion]
 * @property {string} [curse]
 * @property {string} [pet]
 * @property {number} [gold]
 * @property {number} [doom]
 * @property {number} [heal]
 * @property {number} [damage]
 * @property {'self'|'party'|'random'|'choose'} [target]
 * @property {boolean} [rest]
 * @property {string[]} [spawn]
 * @property {Object<string,*>} [flags]   banderas narrativas a fijar
 */

export {};
