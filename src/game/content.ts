export type EnemyAbility = 'piñata' | 'nestingDoll' | 'teeth' | 'bubbleBath' | 'alarm' | 'tapeRoller'
  | 'lawnMower' | 'overlordFridge' | 'piggyBank' | 'cosmicVacuum' | 'doomsdayClockworkGoliath' | 'abyssalJunkHydra'
  | 'dustyCushion' | 'cardboardBox' | 'plasticFlamingo' | 'windUpMouse' | 'rcDrone' | 'sizzlingMarble'
  | 'anvilWeight' | 'stuffedTeddy' | 'castIronSkillet' | 'magnetBot' | 'bubbleWrap' | 'jackInBox'
  | 'mirrorShard' | 'oilCan' | 'batteryPack' | 'lawnMowerMini' | 'microwaveMini' | 'toyTrain'
  | 'vacuumMini' | 'grandfatherClockBoss' | 'garbageCompactor' | 'arcadeCabinet' | 'coinGeist';

export interface EnemySpec {
  id: string;
  name: string;
  shortName: string;
  hp: number;
  speed: number;
  armor: number;
  hyperarmor: number;
  leak: number;
  bounty: number;
  color: number;
  miniboss?: boolean;
  boss?: boolean;
  ability?: EnemyAbility;
  description?: string;
}

export const ENEMIES: Record<string, EnemySpec> = {
  sock: { id: 'sock', name: 'The Lost Sock', shortName: 'Sock', hp: 15, speed: 3, armor: -2, hyperarmor: 0, leak: 2, bounty: 2, color: 0xe9e7da },
  donut: { id: 'donut', name: 'The Half-Eaten Donut', shortName: 'Donut', hp: 40, speed: 2, armor: 0, hyperarmor: 0, leak: 5, bounty: 5, color: 0xf28c9c },
  box: { id: 'box', name: 'The Cardboard Box', shortName: 'Box', hp: 90, speed: 1, armor: 1, hyperarmor: 5, leak: 10, bounty: 10, color: 0xc99d68 },
  bowling: { id: 'bowling', name: 'The Bowling Ball', shortName: 'Bowling Ball', hp: 180, speed: 0.75, armor: 3, hyperarmor: 10, leak: 15, bounty: 18, color: 0xb7c5d8 },
  scooter: { id: 'scooter', name: 'The Zooming Scooter Kid', shortName: 'Scooter', hp: 65, speed: 3, armor: 0, hyperarmor: -10, leak: 8, bounty: 12, color: 0xb9a1eb },
  ferret: { id: 'ferret', name: 'The Stray Ferret', shortName: 'Ferret', hp: 110, speed: 2, armor: -1, hyperarmor: 0, leak: 12, bounty: 16, color: 0xb87d63 },
  shoppingCart: { id: 'shoppingCart', name: 'The Shopping Cart Pileup', shortName: 'Cart Pileup', hp: 450, speed: 0.75, armor: 5, hyperarmor: 20, leak: 20, bounty: 35, color: 0xc0c8ce },
  recliner: { id: 'recliner', name: 'The Overstuffed Recliner', shortName: 'Recliner', hp: 750, speed: 0.5, armor: 8, hyperarmor: 30, leak: 30, bounty: 50, color: 0x9a5c52 },
  brickSafe: { id: 'brickSafe', name: 'The Brick Safe', shortName: 'Brick Safe', hp: 1200, speed: 0.5, armor: 12, hyperarmor: 40, leak: 40, bounty: 75, color: 0x66727c },
  vending: { id: 'vending', name: 'The Runaway Vending Machine', shortName: 'Vending', hp: 2500, speed: 0.75, armor: 10, hyperarmor: 25, leak: 50, bounty: 150, color: 0x69b7a3, miniboss: true },
  dumpster: { id: 'dumpster', name: 'The Unhinged Dumpster', shortName: 'Dumpster', hp: 4000, speed: 0.5, armor: 15, hyperarmor: 35, leak: 50, bounty: 250, color: 0x647749, miniboss: true },
  grandfatherClock: { id: 'grandfatherClock', name: 'The Grandfather Clock', shortName: 'Clock', hp: 3200, speed: 1, armor: 8, hyperarmor: 20, leak: 50, bounty: 200, color: 0x9b744a, miniboss: true },
  paradeBalloon: { id: 'paradeBalloon', name: 'The Giant Parade Balloon', shortName: 'Balloon', hp: 1800, speed: 2, armor: 2, hyperarmor: 10, leak: 50, bounty: 180, color: 0xff8cc5, miniboss: true },
  lawnMower: { id: 'lawnMower', name: 'The Supreme Lawn Mower', shortName: 'Lawn Mower', hp: 12000, speed: 0.75, armor: 15, hyperarmor: 30, leak: 100, bounty: 800, color: 0xe45449, boss: true, ability: 'lawnMower' },
  overlordFridge: { id: 'overlordFridge', name: 'The Overlord Fridge', shortName: 'Fridge', hp: 20000, speed: 0.5, armor: 20, hyperarmor: 45, leak: 100, bounty: 1200, color: 0x76c6dd, boss: true, ability: 'overlordFridge' },
  piggyBank: { id: 'piggyBank', name: 'The Mega Piggy Bank', shortName: 'Piggy Bank', hp: 15000, speed: 0.75, armor: 10, hyperarmor: 20, leak: 100, bounty: 2000, color: 0xf078ae, boss: true, ability: 'piggyBank' },
  cosmicVacuum: { id: 'cosmicVacuum', name: 'The Cosmic Vacuum Cleaner', shortName: 'Vacuum', hp: 28000, speed: 0.5, armor: 25, hyperarmor: 50, leak: 100, bounty: 2500, color: 0xa889ec, boss: true, ability: 'cosmicVacuum' },
  doomsdayClockworkGoliath: { id: 'doomsdayClockworkGoliath', name: 'The Doomsday Clockwork Goliath', shortName: 'Clockwork Goliath', hp: 60000, speed: 0.4, armor: 20, hyperarmor: 40, leak: 100, bounty: 5000, color: 0xd2a448, boss: true, ability: 'doomsdayClockworkGoliath' },
  abyssalJunkHydra: { id: 'abyssalJunkHydra', name: 'The Abyssal Junk-Hydra', shortName: 'Junk-Hydra', hp: 75000, speed: 0.35, armor: 15, hyperarmor: 35, leak: 100, bounty: 6000, color: 0x8154c6, boss: true, ability: 'abyssalJunkHydra' },
  pinata: { id: 'pinata', name: 'The Stun-Grenade Piñata', shortName: 'Piñata', hp: 220, speed: 1, armor: 0, hyperarmor: 0, leak: 15, bounty: 25, color: 0xff68a8, ability: 'piñata' },
  nestingDoll: { id: 'nestingDoll', name: 'The Matryoshka Nesting Doll', shortName: 'Nesting Doll', hp: 350, speed: 0.75, armor: 4, hyperarmor: 15, leak: 20, bounty: 40, color: 0xc3794e, ability: 'nestingDoll' },
  teeth: { id: 'teeth', name: 'The Clackin’ Teeth (Wind-Up Jaws)', shortName: 'Teeth', hp: 180, speed: 2, armor: 1, hyperarmor: -5, leak: 10, bounty: 20, color: 0xf4dc8a, ability: 'teeth' },
  bubbleBath: { id: 'bubbleBath', name: 'The Overflowing Bubble Bath', shortName: 'Bubble Bath', hp: 420, speed: 1, armor: -3, hyperarmor: 25, leak: 18, bounty: 30, color: 0x86d9e2, ability: 'bubbleBath' },
  alarm: { id: 'alarm', name: 'The Alarm Clock Parade', shortName: 'Alarm Parade', hp: 300, speed: 0.75, armor: 3, hyperarmor: 10, leak: 15, bounty: 28, color: 0xe88c59, ability: 'alarm' },
  tape: { id: 'tape', name: 'The Sticky Tape Roller', shortName: 'Tape Roller', hp: 550, speed: 0.75, armor: 5, hyperarmor: 20, leak: 25, bounty: 45, color: 0xf0ce48, ability: 'tapeRoller' },
  dustyCushion: { id: 'dustyCushion', name: 'Dusty Cushion', shortName: 'Dusty Cushion', hp: 40, speed: 1, armor: 0, hyperarmor: 0, leak: 1, bounty: 8, color: 0xb6a38e, ability: 'dustyCushion', description: 'Puffs dust on defeat, briefly blinding nearby towers.' },
  cardboardBox: { id: 'cardboardBox', name: 'Cardboard Box', shortName: 'Cardboard Box', hp: 65, speed: 0.8, armor: 2, hyperarmor: 5, leak: 1, bounty: 10, color: 0xc99d68, ability: 'cardboardBox', description: 'Armored cardboard resists physical hits until it is worn down.' },
  plasticFlamingo: { id: 'plasticFlamingo', name: 'Plastic Flamingo', shortName: 'Flamingo', hp: 50, speed: 1.1, armor: 0, hyperarmor: 0, leak: 1, bounty: 9, color: 0xf27da9, ability: 'plasticFlamingo', description: 'A lawn ornament that hops steadily along the road.' },
  windUpMouse: { id: 'windUpMouse', name: 'Wind-Up Mouse', shortName: 'Wind-Up Mouse', hp: 25, speed: 2.2, armor: 0, hyperarmor: 0, leak: 1, bounty: 12, color: 0xa6cdd2, ability: 'windUpMouse', description: 'Zips forward in erratic bursts.' },
  rcDrone: { id: 'rcDrone', name: 'RC Drone', shortName: 'RC Drone', hp: 35, speed: 2, armor: 0, hyperarmor: 0, leak: 1, bounty: 14, color: 0x76d5ef, ability: 'rcDrone', description: 'Flying unit that ignores floor traps.' },
  sizzlingMarble: { id: 'sizzlingMarble', name: 'Sizzling Marble', shortName: 'Sizzling Marble', hp: 30, speed: 2.4, armor: 1, hyperarmor: 0, leak: 1, bounty: 15, color: 0xff8b55, ability: 'sizzlingMarble', description: 'A hot marble that slows as its health drops.' },
  anvilWeight: { id: 'anvilWeight', name: 'Anvil Weight', shortName: 'Anvil Weight', hp: 350, speed: 0.5, armor: 12, hyperarmor: 30, leak: 4, bounty: 35, color: 0x737d87, ability: 'anvilWeight', description: 'Dense iron absorbs physical punishment.' },
  stuffedTeddy: { id: 'stuffedTeddy', name: 'Stuffed Teddy Bear', shortName: 'Stuffed Teddy', hp: 450, speed: 0.6, armor: 0, hyperarmor: 15, leak: 3, bounty: 40, color: 0xb77a65, ability: 'stuffedTeddy', description: 'Its stuffing reduces explosive damage.' },
  castIronSkillet: { id: 'castIronSkillet', name: 'Cast Iron Skillet', shortName: 'Cast Iron', hp: 280, speed: 0.7, armor: 8, hyperarmor: 20, leak: 3, bounty: 30, color: 0x596872, ability: 'castIronSkillet', description: 'Deflects physical attacks from its front.' },
  magnetBot: { id: 'magnetBot', name: 'Magnet Bot', shortName: 'Magnet Bot', hp: 180, speed: 0.9, armor: 4, hyperarmor: 10, leak: 2, bounty: 25, color: 0x6eb5bd, ability: 'magnetBot', description: 'Attracts nearby metal shots and absorbs them.' },
  bubbleWrap: { id: 'bubbleWrap', name: 'Bubble Wrap Roll', shortName: 'Bubble Wrap', hp: 120, speed: 1, armor: 0, hyperarmor: 0, leak: 2, bounty: 22, color: 0x8de7e7, ability: 'bubbleWrap', description: 'Five bubble layers each cancel one hit.' },
  jackInBox: { id: 'jackInBox', name: 'Jack-in-the-Box', shortName: 'Jack-in-the-Box', hp: 200, speed: 0.75, armor: 2, hyperarmor: 10, leak: 3, bounty: 28, color: 0xe7686d, ability: 'jackInBox', description: 'Jumps forward every five seconds.' },
  mirrorShard: { id: 'mirrorShard', name: 'Mirror Shard', shortName: 'Mirror Shard', hp: 110, speed: 1.2, armor: 0, hyperarmor: 0, leak: 2, bounty: 24, color: 0xb0e9ef, ability: 'mirrorShard', description: 'Reflects some beam damage as attack-speed interference.' },
  oilCan: { id: 'oilCan', name: 'Spilled Oil Can', shortName: 'Oil Can', hp: 160, speed: 0.85, armor: 0, hyperarmor: 5, leak: 2, bounty: 26, color: 0x3c3b32, ability: 'oilCan', description: 'Leaves oil that speeds up following enemies.' },
  batteryPack: { id: 'batteryPack', name: 'Battery Pack', shortName: 'Battery Pack', hp: 220, speed: 0.8, armor: 3, hyperarmor: 15, leak: 3, bounty: 30, color: 0xffd44f, ability: 'batteryPack', description: 'Disables the nearest tower when defeated.' },
  lawnMowerMini: { id: 'lawnMowerMini', name: 'The Lawn Mower', shortName: 'Lawn Mower', hp: 2500, speed: 0.65, armor: 10, hyperarmor: 25, leak: 10, bounty: 250, color: 0xe45449, miniboss: true, ability: 'lawnMowerMini', description: 'Destroys track traps and obscures nearby targeting.' },
  microwaveMini: { id: 'microwaveMini', name: 'Microwave Oven', shortName: 'Microwave Oven', hp: 3000, speed: 0.5, armor: 15, hyperarmor: 20, leak: 15, bounty: 300, color: 0x858c98, miniboss: true, ability: 'microwaveMini', description: 'Heat aura blocks nearby slows and freezes; releases marbles at half health.' },
  toyTrain: { id: 'toyTrain', name: 'Toy Train Engine', shortName: 'Toy Train', hp: 2200, speed: 0.9, armor: 6, hyperarmor: 15, leak: 12, bounty: 220, color: 0x55a8d7, miniboss: true, ability: 'toyTrain', description: 'Pulls cardboard cars and stuns towers on arrival.' },
  vacuumMini: { id: 'vacuumMini', name: 'Vacuum Cleaner', shortName: 'Vacuum Cleaner', hp: 3500, speed: 0.45, armor: 8, hyperarmor: 30, leak: 20, bounty: 350, color: 0x9478c6, miniboss: true, ability: 'vacuumMini', description: 'Sucks up light projectiles and releases cushions when defeated.' },
  grandfatherClockBoss: { id: 'grandfatherClockBoss', name: 'Grandfather Clock', shortName: 'Grandfather Clock', hp: 12000, speed: 0.4, armor: 18, hyperarmor: 35, leak: 50, bounty: 1200, color: 0x9b744a, boss: true, ability: 'grandfatherClockBoss', description: 'Reverses tower targeting and disables nearby support auras.' },
  garbageCompactor: { id: 'garbageCompactor', name: 'Garbage Compactor', shortName: 'Garbage Compactor', hp: 16000, speed: 0.35, armor: 25, hyperarmor: 45, leak: 100, bounty: 1500, color: 0x657764, boss: true, ability: 'garbageCompactor', description: 'Blocks frontal shots and turns defeated enemies into moving shields.' },
  arcadeCabinet: { id: 'arcadeCabinet', name: 'Arcade Cabinet', shortName: 'Arcade Cabinet', hp: 14000, speed: 0.45, armor: 12, hyperarmor: 40, leak: 75, bounty: 1350, color: 0xb753d8, boss: true, ability: 'arcadeCabinet', description: 'Glitches forward and disrupts target markers at low health.' },
  coinGeist: { id: 'coinGeist', name: 'Coin-Geist', shortName: 'Coin-Geist', hp: 1, speed: 4, armor: 0, hyperarmor: 0, leak: 1, bounty: 0, color: 0xffd15e, ability: 'coinGeist', description: 'Golden Curse phantom: fast, fragile, and leaks one base HP.' },
};

export type EnemyKey = keyof typeof ENEMIES;
export interface WaveGroup { enemy: EnemyKey; count: number }

/** Stage 1's approved 1-star base schedule, Wave 1 through Wave 15. */
export const STAGE_ONE_WAVES: WaveGroup[][] = [
  [{ enemy: 'sock', count: 8 }, { enemy: 'teeth', count: 4 }],
  [{ enemy: 'donut', count: 10 }, { enemy: 'bubbleBath', count: 4 }],
  [{ enemy: 'scooter', count: 8 }, { enemy: 'alarm', count: 6 }],
  [{ enemy: 'box', count: 10 }, { enemy: 'tape', count: 5 }, { enemy: 'ferret', count: 4 }],
  [{ enemy: 'donut', count: 6 }, { enemy: 'teeth', count: 6 }, { enemy: 'vending', count: 1 }],
  [{ enemy: 'bowling', count: 12 }, { enemy: 'shoppingCart', count: 6 }],
  [{ enemy: 'ferret', count: 10 }, { enemy: 'pinata', count: 8 }, { enemy: 'scooter', count: 4 }],
  [{ enemy: 'box', count: 8 }, { enemy: 'nestingDoll', count: 5 }, { enemy: 'bowling', count: 5 }],
  [{ enemy: 'bubbleBath', count: 8 }, { enemy: 'ferret', count: 8 }, { enemy: 'shoppingCart', count: 4 }],
  [{ enemy: 'bowling', count: 8 }, { enemy: 'pinata', count: 6 }, { enemy: 'dumpster', count: 1 }],
  [{ enemy: 'alarm', count: 10 }, { enemy: 'recliner', count: 6 }, { enemy: 'scooter', count: 6 }],
  [{ enemy: 'tape', count: 8 }, { enemy: 'brickSafe', count: 6 }, { enemy: 'donut', count: 6 }],
  [{ enemy: 'nestingDoll', count: 6 }, { enemy: 'shoppingCart', count: 6 }, { enemy: 'teeth', count: 8 }],
  [{ enemy: 'paradeBalloon', count: 5 }, { enemy: 'recliner', count: 6 }, { enemy: 'ferret', count: 10 }],
  [{ enemy: 'brickSafe', count: 4 }, { enemy: 'dumpster', count: 2 }, { enemy: 'tape', count: 4 }, { enemy: 'lawnMower', count: 1 }],
];

export const WAVE_EVENT_NAMES = ['Standard', 'Standard', 'Standard', 'Standard', 'Mini-Boss', 'Standard', 'Standard', 'Standard', 'Standard', 'Mini-Boss', 'Standard', 'Standard', 'Standard', 'Standard', 'Boss'];

export function normalizeStar(star: number): number { return Math.max(1, Math.min(3, Math.floor(Number(star) || 1))); }
export function starMultiplier(star: number): number { const level = normalizeStar(star); return level === 1 ? 1 : level === 2 ? 1.5 : 2; }
export function starScaledHp(baseHp: number, star: number): number { return Math.floor(baseHp * starMultiplier(star)); }
export function starScaledLeak(baseLeak: number, star: number): number { return Math.floor(baseLeak * starMultiplier(star)); }
export function starScaledBounty(baseBounty: number, star: number): number { return Math.floor(baseBounty * starMultiplier(star)); }
export function waveClearPayout(wave: number, star: number): number { return Math.min(3800, 300 + (2 * normalizeStar(star) * 5 * wave)); }
