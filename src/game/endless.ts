import { type EnemyKey, type WaveGroup } from './content';

export type EndlessThreat = 'Basic' | 'Fast' | 'Heavy' | 'Unique' | 'Mini-Boss' | 'Boss';

const ENEMY_POINTS: Record<EndlessThreat, { points: number; enemies: EnemyKey[] }> = {
  Basic: { points: 5, enemies: ['sock', 'donut', 'box', 'bowling'] },
  Fast: { points: 10, enemies: ['scooter', 'ferret'] },
  Heavy: { points: 20, enemies: ['shoppingCart', 'recliner', 'brickSafe'] },
  Unique: { points: 15, enemies: ['teeth', 'alarm', 'pinata', 'nestingDoll', 'bubbleBath', 'tape'] },
  'Mini-Boss': { points: 100, enemies: ['vending', 'dumpster', 'paradeBalloon'] },
  Boss: { points: 300, enemies: ['lawnMower', 'overlordFridge', 'piggyBank', 'cosmicVacuum'] },
};

export function endlessThreatForEnemy(key: EnemyKey): EndlessThreat {
  for (const [threat, data] of Object.entries(ENEMY_POINTS) as Array<[EndlessThreat, (typeof ENEMY_POINTS)[EndlessThreat]]>) {
    if (data.enemies.includes(key)) return threat;
  }
  return 'Basic';
}

export function endlessWaveBudget(wave: number): number {
  const n = Math.max(0, Math.floor(wave) - 15);
  return 100 + 25 * n + 3 * n * n;
}

export function endlessHpMultiplier(wave: number): number {
  const n = Math.max(0, wave - 15);
  return (1 + 0.15 * n) * 1.05 ** n;
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
export function generateEndlessWave(wave: number, random: () => number = Math.random): WaveGroup[] {
  const budget = endlessWaveBudget(wave);
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
