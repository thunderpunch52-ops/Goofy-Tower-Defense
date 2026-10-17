import { ENEMIES, type EnemyKey } from '../game/content';
import { MAPS, type MapId } from '../game/map';
import { TOWERS } from '../game/towers';

export interface RegistryLike {
  get(key: string): unknown;
  set(key: string, value: unknown): unknown;
}

export interface TowerMastery {
  level: number;
  xp: number;
  pathRanks: [number, number, number];
  pendingChoices: number;
}

export const MAX_TOWER_LEVEL = 15;
const TOWER_MASTERY_SCHEMA = 2;
export function xpToEnterLevel(level: number): number {
  return 1500 + 1000 * (level - 1);
}

export function defaultMastery(): TowerMastery {
  return { level: 0, xp: 0, pathRanks: [2, 2, 2], pendingChoices: 0 };
}

export function initializeProgress(registry: RegistryLike): void {
  if (!registry.get('mapProgress')) {
    registry.set('mapProgress', { gems: 0, unlockedMaps: MAPS.filter((map) => map.startsUnlocked).map((map) => map.id) as MapId[] });
  }
  const storedMastery = registry.get('towerMastery') as Record<string, TowerMastery> | undefined;
  const mastery = storedMastery ?? {};
  if (storedMastery && Number(registry.get('towerMasterySchema') ?? 0) < TOWER_MASTERY_SCHEMA) {
    // Earlier saves counted the unearned starting state as level 1. Convert it
    // once so zero XP displays as 0/15 and existing earned choices are kept.
    for (const record of Object.values(mastery)) {
      record.level = Math.max(0, Math.min(MAX_TOWER_LEVEL, Math.floor(Number(record.level) || 1) - 1));
    }
  }
  for (const tower of TOWERS) mastery[tower.id] ??= defaultMastery();
  registry.set('towerMastery', mastery);
  registry.set('towerMasterySchema', TOWER_MASTERY_SCHEMA);
  if (registry.get('playerXP') === undefined) registry.set('playerXP', 0);
  if (registry.get('playerLevel') === undefined) registry.set('playerLevel', 1);
  if (registry.get('bestiaryUnlocks') === undefined) registry.set('bestiaryUnlocks', [] as EnemyKey[]);
  const savedSpeeds = registry.get('unlockedGameSpeeds');
  const unlockedSpeeds = new Set(Array.isArray(savedSpeeds) ? savedSpeeds.filter((speed) => speed === 3 || speed === 4) : []);
  if (!unlockedSpeeds.has(3)) unlockedSpeeds.delete(4);
  registry.set('unlockedGameSpeeds', [...unlockedSpeeds]);
}

export function towerMastery(registry: RegistryLike, towerId: string): TowerMastery {
  initializeProgress(registry);
  const records = registry.get('towerMastery') as Record<string, TowerMastery>;
  return records[towerId] ?? defaultMastery();
}

export function saveTowerMastery(registry: RegistryLike, towerId: string, record: TowerMastery): void {
  initializeProgress(registry);
  const records = registry.get('towerMastery') as Record<string, TowerMastery>;
  records[towerId] = record;
  registry.set('towerMastery', records);
}

export function grantTowerXp(registry: RegistryLike, towerId: string, amount: number): number {
  const record = towerMastery(registry, towerId);
  let xp = record.xp + Math.max(0, Math.floor(amount));
  let gainedLevels = 0;
  while (record.level < MAX_TOWER_LEVEL && xp >= xpToEnterLevel(record.level + 2)) {
    xp -= xpToEnterLevel(record.level + 2);
    record.level += 1;
    record.pendingChoices += 1;
    gainedLevels += 1;
  }
  record.xp = xp;
  saveTowerMastery(registry, towerId, record);
  return gainedLevels;
}

export function grantPlayerXp(registry: RegistryLike, amount: number): number {
  const xp = Math.max(0, Number(registry.get('playerXP') ?? 0) + Math.floor(amount));
  let remaining = xp;
  let level = 1;
  while (remaining >= xpToEnterLevel(level + 1)) {
    remaining -= xpToEnterLevel(level + 1);
    level += 1;
  }
  registry.set('playerXP', xp);
  registry.set('playerLevel', level);
  return level;
}

export function unlockBestiaryEntry(registry: RegistryLike, enemyId: EnemyKey): void {
  const unlocked = new Set((registry.get('bestiaryUnlocks') as EnemyKey[] | undefined) ?? []);
  unlocked.add(enemyId);
  registry.set('bestiaryUnlocks', [...unlocked]);
}

const CAMPAIGN_TOWER_UNLOCKS: Record<string, { stage: number; star: number }> = {
  lawnDartGnome: { stage: 1, star: 1 }, unstableToasterLauncher: { stage: 3, star: 1 },
  waterBalloonSlingshot: { stage: 4, star: 1 }, stickyBubblegumDispenser: { stage: 5, star: 1 },
  hotSauceSprinkler: { stage: 2, star: 2 }, leafBlowerGuy: { stage: 3, star: 2 },
  squeakyRubberDuckCannon: { stage: 5, star: 2 }, freezeRayIceCreamTruck: { stage: 2, star: 3 },
  giantMechTeddyBear: { stage: 5, star: 3 },
};
const LEVEL_TOWER_UNLOCKS: Record<string, number> = { anvilTrapdoor: 2, discoTurret: 5, catLaserPointer: 10, cosmicRoomba: 15 };

export function towerUnlocked(registry: RegistryLike, towerId: string): boolean {
  if (towerId === 'angryPigeon') return true;
  const importedUnlocks = registry.get('towerUnlocks') as string[] | undefined;
  if (importedUnlocks?.includes(towerId)) return true;
  const campaign = CAMPAIGN_TOWER_UNLOCKS[towerId];
  if (campaign) return Boolean(registry.get(`stage${campaign.stage}Star${campaign.star}Cleared`));
  const level = LEVEL_TOWER_UNLOCKS[towerId];
  return level !== undefined && Number(registry.get('playerLevel') ?? 1) >= level;
}

interface SavePayload {
  version: 1 | 2 | 3;
  mapProgress: { gems: number; unlockedMaps: MapId[] };
  towerUnlocks: string[];
  towerMastery: Record<string, TowerMastery>;
  campaignClears: string[];
  unlockedStars: number[];
  gemRewards: number[];
  playerXP: number;
  playerLevel: number;
  bestiaryUnlocks: EnemyKey[];
  unlockedGameSpeeds?: number[];
}

function payloadFromRegistry(registry: RegistryLike): SavePayload {
  initializeProgress(registry);
  const mapProgress = registry.get('mapProgress') as SavePayload['mapProgress'];
  const campaignClears: string[] = [];
  const gemRewards: number[] = [];
  for (let star = 1; star <= 3; star += 1) {
    if (registry.get(`campaignStar${star}Unlocked`) || star === 1) campaignClears.push(`star${star}:unlocked`);
    if (registry.get(`campaignStar${star}GemsAwarded`)) gemRewards.push(star);
    for (let stage = 1; stage <= 5; stage += 1) {
      if (registry.get(`stage${stage}Star${star}Cleared`)) campaignClears.push(`stage${stage}:star${star}`);
    }
  }
  return {
    version: 3,
    mapProgress: { gems: Math.max(0, Math.floor(mapProgress.gems)), unlockedMaps: [...mapProgress.unlockedMaps] },
    towerUnlocks: TOWERS.filter((tower) => towerUnlocked(registry, tower.id)).map((tower) => tower.id),
    towerMastery: structuredClone(registry.get('towerMastery') as SavePayload['towerMastery']),
    campaignClears,
    unlockedStars: campaignClears.filter((value) => value.startsWith('star')).map((value) => Number(value.slice(4, 5))),
    gemRewards,
    playerXP: Number(registry.get('playerXP') ?? 0),
    playerLevel: Number(registry.get('playerLevel') ?? 1),
    bestiaryUnlocks: [...(registry.get('bestiaryUnlocks') as EnemyKey[])],
    unlockedGameSpeeds: [...(registry.get('unlockedGameSpeeds') as number[])],
  };
}

export function exportProgressCode(registry: RegistryLike): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payloadFromRegistry(registry)));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return `TD1.${btoa(binary)}`;
}

export function importProgressCode(registry: RegistryLike, code: string): void {
  if (!code.startsWith('TD1.')) throw new Error('This save code version is not supported.');
  const binary = atob(code.slice(4).trim());
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const data = JSON.parse(new TextDecoder().decode(bytes)) as SavePayload;
  if ((data.version !== 1 && data.version !== 2 && data.version !== 3) || !data.mapProgress || !Array.isArray(data.mapProgress.unlockedMaps) || !Array.isArray(data.towerUnlocks)
    || !data.towerMastery || !Array.isArray(data.campaignClears) || !Array.isArray(data.gemRewards) || !Array.isArray(data.bestiaryUnlocks)) {
    throw new Error('The save code is incomplete or damaged.');
  }
  const validMaps = new Set(MAPS.map((map) => map.id));
  const mapIds = data.mapProgress.unlockedMaps.filter((id) => validMaps.has(id));
  const mapProgress = { gems: Math.max(0, Math.floor(Number(data.mapProgress.gems) || 0)), unlockedMaps: mapIds };
  registry.set('mapProgress', mapProgress);
  const validTowerIds = new Set<string>(TOWERS.map((tower) => tower.id));
  registry.set('towerUnlocks', [...new Set(data.towerUnlocks.filter((id) => validTowerIds.has(id)))]);
  const mastery: Record<string, TowerMastery> = {};
  for (const tower of TOWERS) {
    const saved = data.towerMastery[tower.id];
    const base = defaultMastery();
    if (saved) {
      const legacyLevel = PhaserLikeInt(saved.level, 1, MAX_TOWER_LEVEL);
      base.level = data.version === 1 ? legacyLevel - 1 : PhaserLikeInt(saved.level, 0, MAX_TOWER_LEVEL);
      base.xp = Math.max(0, Math.floor(Number(saved.xp) || 0));
      base.pathRanks = [0, 1, 2].map((index) => PhaserLikeInt(saved.pathRanks?.[index], 1, 7)) as [number, number, number];
      base.pendingChoices = Math.max(0, Math.floor(Number(saved.pendingChoices) || 0));
    }
    mastery[tower.id] = base;
  }
  registry.set('towerMastery', mastery);
  registry.set('towerMasterySchema', TOWER_MASTERY_SCHEMA);
  const clearSet = new Set(data.campaignClears);
  for (let star = 1; star <= 3; star += 1) {
    registry.set(`campaignStar${star}Unlocked`, star === 1 || clearSet.has(`star${star}:unlocked`));
    registry.set(`campaignStar${star}GemsAwarded`, data.gemRewards.includes(star));
    for (let stage = 1; stage <= 5; stage += 1) registry.set(`stage${stage}Star${star}Cleared`, clearSet.has(`stage${stage}:star${star}`));
  }
  registry.set('playerXP', 0);
  registry.set('playerLevel', 1);
  grantPlayerXp(registry, Math.max(0, Math.floor(Number(data.playerXP) || 0)));
  registry.set('bestiaryUnlocks', [...new Set(data.bestiaryUnlocks.filter((id) => id in ENEMIES))]);
  const savedSpeeds = Array.isArray(data.unlockedGameSpeeds) ? data.unlockedGameSpeeds : [];
  const unlockedSpeeds = new Set(savedSpeeds.filter((speed) => speed === 3 || speed === 4));
  if (!unlockedSpeeds.has(3)) unlockedSpeeds.delete(4);
  registry.set('unlockedGameSpeeds', [...unlockedSpeeds]);
  registry.set('runMode', 'campaign');
}

function PhaserLikeInt(value: unknown, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.floor(Number(value) || min)));
}

export function towerUnlockRequirement(towerId: string): string {
  const campaign = CAMPAIGN_TOWER_UNLOCKS[towerId];
  if (campaign) return `Clear Star ${campaign.star} · Stage ${campaign.stage}`;
  const level = LEVEL_TOWER_UNLOCKS[towerId];
  return level ? `Reach Player Level ${level}` : 'Unlocked from the start';
}
