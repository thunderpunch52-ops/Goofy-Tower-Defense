import { type EnemyKey, type EnemySpec, type WaveGroup } from './content';

export type EndlessThreat = 'Basic' | 'Fast' | 'Heavy' | 'Unique' | 'Mini-Boss' | 'Boss';
export type EndlessEliteId = 'midas' | 'hermes' | 'iron' | 'phantom' | 'siphon' | 'brute' | 'nullField' | 'splitEcho' | 'frostTempered' | 'voidBound';
export const ENDLESS_MEGA_BOSS_COST = 800;

export interface EndlessEliteSpec {
  id: EndlessEliteId;
  name: string;
  color: number;
  points: number;
  description: string;
}

export const ENDLESS_ELITES: EndlessEliteSpec[] = [
  { id: 'midas', name: 'Touched by Midas', color: 0xffd22e, points: 60, description: '+50% HP, +25% Armor, drops 3× bounty.' },
  { id: 'hermes', name: 'Blessed by Hermes', color: 0x25efff, points: 75, description: '−25% HP, 2× speed, ignores first slow or stun.' },
  { id: 'iron', name: 'Forged in Iron', color: 0xa9b2ba, points: 120, description: '+100% HP, +5 Armor, +20 Hyperarmor; shields nearby non-elites.' },
  { id: 'phantom', name: 'Phantom-Stitched', color: 0xb85cff, points: 80, description: 'Every 4s jumps 2 tiles forward and sheds damage-over-time.' },
  { id: 'siphon', name: 'Siphon-Cursed', color: 0xff36cf, points: 90, description: '+25% HP; hits slow the attacking tower for 1s.' },
  { id: 'brute', name: 'Blood-Pact Brute', color: 0xf04452, points: 110, description: '+50% HP; each 25% HP lost adds speed and leak damage.' },
  { id: 'nullField', name: 'Null-Field Conduit', color: 0xeaff28, points: 100, description: '+10 Hyperarmor; immune to stun, freeze, and knockback.' },
  { id: 'splitEcho', name: 'Split-Echo Entity', color: 0x22e58e, points: 130, description: '+75% HP; below half HP spawns a 1-HP echo.' },
  { id: 'frostTempered', name: 'Frost-Tempered', color: 0x145bd7, points: 85, description: '+40% HP, +10 Armor; immune to chill and freeze; slows nearby towers on defeat.' },
  { id: 'voidBound', name: 'Void-Bound', color: 0x551780, points: 105, description: '+30% HP, +50% speed; absorbs half of splash damage and heals nearby non-elites.' },
];

export function endlessEliteSpec(id: EndlessEliteId): EndlessEliteSpec {
  return ENDLESS_ELITES.find((elite) => elite.id === id)!;
}

export function endlessElitePoints(ids: EndlessEliteId[]): number {
  return ids.reduce((total, id) => total + endlessEliteSpec(id).points, 0);
}

export interface EndlessEliteStats {
  hpMultiplier: number;
  speedMultiplier: number;
  armor: number;
  hyperarmor: number;
  bountyMultiplier: number;
}

/** Stacks each purchased trait on one queued enemy without losing base stats. */
export function endlessEliteStats(base: Pick<EnemySpec, 'armor' | 'hyperarmor'>, ids: EndlessEliteId[]): EndlessEliteStats {
  const count = (id: EndlessEliteId) => ids.filter((elite) => elite === id).length;
  return {
    hpMultiplier: 1.5 ** count('midas') * 0.75 ** count('hermes') * 2 ** count('iron')
      * 1.25 ** count('siphon') * 1.5 ** count('brute') * 1.75 ** count('splitEcho')
      * 1.4 ** count('frostTempered') * 1.3 ** count('voidBound'),
    speedMultiplier: 2 ** count('hermes') * 1.5 ** count('voidBound'),
    armor: base.armor * 1.25 ** count('midas') + 5 * count('iron') + 10 * count('frostTempered'),
    hyperarmor: base.hyperarmor + 20 * count('iron') + 10 * count('nullField'),
    bountyMultiplier: 3 ** count('midas'),
  };
}

export function endlessBloodPactStages(hp: number, maxHp: number): number {
  return maxHp > 0 ? Math.max(0, Math.min(4, Math.floor((1 - hp / maxHp) * 4 + 1e-8))) : 0;
}

export function endlessHermesCrowdControlCharges(ids: EndlessEliteId[]): number { return ids.filter((id) => id === 'hermes').length; }
export function endlessSiphonSlowPerHit(ids: EndlessEliteId[]): number { return Math.min(0.8, ids.filter((id) => id === 'siphon').length * 0.2); }

export function endlessMegaBossPhase(hpRatio: number): 1 | 2 | 3 {
  return hpRatio <= 0.33 ? 3 : hpRatio <= 0.66 ? 2 : 1;
}

/** Keeps one attack from skipping an entire mega-boss phase transition. */
export function endlessMegaBossDamageLimit(hp: number, maxHp: number, phase: 1 | 2 | 3, damage: number): number {
  const threshold = phase === 1 ? 0.66 : phase === 2 ? 0.33 : 0;
  if (threshold === 0 || maxHp <= 0) return damage;
  const boundaryHp = Math.floor(maxHp * threshold);
  return Math.min(damage, Math.max(0, hp - boundaryHp));
}

export function endlessMegaBossShield(maxHp: number): number { return Math.floor(Math.max(0, maxHp) * 0.1); }

export function endlessWaveEnemyBudget(wave: number): number {
  // Keep the regular roster compact so the automatic wave sender can spend the
  // rest of the shared budget on per-enemy elites and occasional mega bosses.
  return Math.floor(endlessWaveBudget(wave) * 0.4);
}

export function endlessEnemyRosterCost(groups: WaveGroup[]): number {
  return groups.reduce((total, group) => total + endlessEnemyPointCost(group.enemy) * group.count, 0);
}

export function endlessEnemyPointCost(enemy: EnemyKey): number {
  return enemy === 'doomsdayClockworkGoliath' || enemy === 'abyssalJunkHydra'
    ? 800 : ENEMY_POINTS[endlessThreatForEnemy(enemy)].points;
}

const ENEMY_POINTS: Record<EndlessThreat, { points: number; enemies: EnemyKey[] }> = {
  Basic: { points: 5, enemies: ['sock', 'donut', 'box', 'bowling', 'dustyCushion', 'cardboardBox', 'plasticFlamingo'] },
  Fast: { points: 10, enemies: ['scooter', 'ferret', 'windUpMouse', 'rcDrone', 'sizzlingMarble'] },
  Heavy: { points: 20, enemies: ['shoppingCart', 'recliner', 'brickSafe', 'anvilWeight', 'stuffedTeddy', 'castIronSkillet'] },
  Unique: { points: 15, enemies: ['teeth', 'alarm', 'pinata', 'nestingDoll', 'bubbleBath', 'tape', 'magnetBot', 'bubbleWrap', 'jackInBox', 'mirrorShard', 'oilCan', 'batteryPack'] },
  'Mini-Boss': { points: 100, enemies: ['vending', 'dumpster', 'paradeBalloon', 'lawnMowerMini', 'microwaveMini', 'toyTrain', 'vacuumMini'] },
  Boss: { points: 300, enemies: ['lawnMower', 'overlordFridge', 'piggyBank', 'cosmicVacuum', 'grandfatherClockBoss', 'garbageCompactor', 'arcadeCabinet'] },
};

export function endlessThreatForEnemy(key: EnemyKey): EndlessThreat {
  for (const [threat, data] of Object.entries(ENEMY_POINTS) as Array<[EndlessThreat, (typeof ENEMY_POINTS)[EndlessThreat]]>) {
    if (data.enemies.includes(key)) return threat;
  }
  return 'Basic';
}

export function endlessWaveBudget(wave: number): number {
  const n = Math.max(0, Math.floor(wave) - 15);
  // Keep the wave sender's credit curve gradual so boss counts and elite
  // density do not jump sharply during the first endless milestones.
  return 100 + 15 * n + n * n;
}

export function endlessHpMultiplier(wave: number): number {
  const n = Math.max(0, wave - 15);
  return 1.06 ** n;
}

export function endlessLeakDamage(base: number, wave: number, threat: EndlessThreat): number {
  if (threat === 'Boss') return 100;
  if (threat === 'Mini-Boss') return 50;
  return Math.min(100, base + Math.floor(Math.max(0, wave - 15) / 3));
}

export function endlessBountyMultiplier(wave: number): number {
  return Math.max(0.2, 0.95 ** Math.max(0, wave - 15));
}

/** Stable, bounded composition builder that respects per-type and milestone caps. */
export function generateEndlessWave(wave: number, random: () => number = Math.random, budget = endlessWaveBudget(wave)): WaveGroup[] {
  const milestone = wave >= 20 && wave % 5 === 0;
  const counts = new Map<EnemyKey, number>();
  let spent = 0;
  const chosenKeys = new Map<EndlessThreat, EnemyKey>();
  const add = (key: EnemyKey, count: number) => {
    if (count <= 0) return;
    counts.set(key, (counts.get(key) ?? 0) + count);
    spent += ENEMY_POINTS[endlessThreatForEnemy(key)].points * count;
  };

  if (milestone) {
    const specialThreats: EndlessThreat[] = ['Boss', 'Mini-Boss'];
    const specialTarget = Math.ceil(budget * (0.4 + random() * 0.1));
    const threat = specialThreats[Math.floor(random() * specialThreats.length)]!;
    const data = ENEMY_POINTS[threat];
    const key = data.enemies[Math.floor(random() * data.enemies.length)]!;
    chosenKeys.set(threat, key);
    add(key, Math.min(Math.floor(budget / data.points), Math.ceil(specialTarget / data.points)));
  }

  const ordinary = (Object.keys(ENEMY_POINTS) as EndlessThreat[]).filter((threat) => !['Mini-Boss', 'Boss'].includes(threat));
  for (let i = ordinary.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [ordinary[i], ordinary[j]] = [ordinary[j]!, ordinary[i]!];
  }
  const selected = ordinary.slice(0, milestone ? 3 : 3 + Math.floor(random() * 3));
  for (const threat of selected) {
    const pool = ENEMY_POINTS[threat].enemies;
    chosenKeys.set(threat, pool[Math.floor(random() * pool.length)]!);
  }

  // Early non-milestone minibosses respect their count cap and use only a
  // small optional slice of the budget.
  if (!milestone) {
    const miniBossLimit = Math.floor((wave - 15) / 3);
    if (miniBossLimit > 0 && random() < 0.15 && spent < budget * 0.9) {
      const key = ENEMY_POINTS['Mini-Boss'].enemies[Math.floor(random() * ENEMY_POINTS['Mini-Boss'].enemies.length)]!;
      const count = Math.min(miniBossLimit, Math.floor((budget - spent) / 100), Math.max(1, Math.floor(budget * 0.1 / 100)));
      if (count > 0) { chosenKeys.set('Mini-Boss', key); add(key, count); }
    }
  }

  // Keep the ordinary roster at three to five distinct types, then add enemy
  // batches in one step so high-numbered waves do not require huge loops.
  if (spent < budget * 0.9) for (const threat of selected) {
    const data = ENEMY_POINTS[threat];
    if (spent + data.points > budget) continue;
    add(chosenKeys.get(threat)!, 1);
  }
  const ordinaryTarget = Math.ceil(budget * 0.9);
  const perTypeBudget = Math.floor(budget * 0.5);
  for (let pass = 0; spent < ordinaryTarget && pass < selected.length; pass += 1) {
    for (const threat of selected) {
      const data = ENEMY_POINTS[threat];
      const key = chosenKeys.get(threat)!;
      const already = counts.get(key) ?? 0;
      const cap = Math.floor(perTypeBudget / data.points);
      const roomByBudget = Math.floor((budget - spent) / data.points);
      const roomByType = cap - already;
      const needed = Math.ceil((ordinaryTarget - spent) / data.points);
      const batch = Math.min(roomByBudget, roomByType, needed);
      if (batch > 0) add(key, batch);
      if (spent >= ordinaryTarget) break;
    }
  }
  return [...counts].map(([enemy, count]) => ({ enemy, count }));
}
