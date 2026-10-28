export const BOARD_COLUMNS = 64;
export const BOARD_ROWS = 80;

export interface Tile { x: number; y: number }
export interface MapObstacle { x: number; y: number; width: number; height: number; kind: 'toy' | 'grill' | 'shelf' | 'book' | 'box' | 'table' | 'sand' | 'crate' | 'pins' }
export type MapId = 'simple-loop' | 'dual-u-turn' | 'open-rectangular' | 'short-s-bend' | 'zig-zag-cascade' | 'dual-spawn-convergence' | 'marathon-corridor' | 'split-fork' | 'gauntlet'
  | 'overflowing-silos' | 'obsidian-foundries' | 'chrono-stitched-ruin' | 'world-engine-bastion' | 'core-meltdown-vent'
  | 'bio-vascular-spire' | 'abyssal-trench' | 'alchemists-crucible';
export type MapRouteVariant = 'main' | 'left' | 'right';

export interface MapSpec {
  id: MapId;
  number: number;
  name: string;
  category: 'Beginner' | 'Advanced' | 'Expert' | 'Ascended';
  theme: string;
  ground: number;
  road: number;
  unlockCost: number;
  startsUnlocked: boolean;
  campaignStage?: number;
}

export const MAPS: MapSpec[] = [
  { id: 'simple-loop', number: 1, name: 'The Simple Loop', category: 'Beginner', theme: 'Living Room Rug Run', ground: 0x55433d, road: 0x9c7e65, unlockCost: 0, startsUnlocked: true, campaignStage: 1 },
  { id: 'dual-u-turn', number: 2, name: 'The Dual-U-Turn', category: 'Beginner', theme: 'Backyard Barbecue Brawl', ground: 0x42604a, road: 0xc9b987, unlockCost: 0, startsUnlocked: true, campaignStage: 3 },
  { id: 'open-rectangular', number: 3, name: 'The Open Rectangular Circuit', category: 'Beginner', theme: 'Supermarket Sweep-Up', ground: 0x47616a, road: 0xd8c95b, unlockCost: 5, startsUnlocked: false, campaignStage: 2 },
  { id: 'short-s-bend', number: 4, name: 'The Short S-Bend', category: 'Beginner', theme: 'Dorm Room Desk Disaster', ground: 0x584b5e, road: 0xb29a78, unlockCost: 5, startsUnlocked: false },
  { id: 'zig-zag-cascade', number: 5, name: 'The Zig-Zag Cascade', category: 'Advanced', theme: 'Attic Obstacle Course', ground: 0x66513d, road: 0xc59b61, unlockCost: 5, startsUnlocked: false, campaignStage: 4 },
  { id: 'dual-spawn-convergence', number: 6, name: 'Dual Spawn Convergence', category: 'Advanced', theme: 'Cafeteria Food Fight', ground: 0x3f5c6c, road: 0xb3cfcc, unlockCost: 5, startsUnlocked: false, campaignStage: 5 },
  { id: 'marathon-corridor', number: 7, name: 'The Marathon Corridor', category: 'Advanced', theme: 'Mini-Golf Madness', ground: 0x3f6655, road: 0xb2c76e, unlockCost: 5, startsUnlocked: false },
  { id: 'split-fork', number: 8, name: 'The Split Fork', category: 'Expert', theme: 'Construction Zone Chaos', ground: 0x625347, road: 0xd2ad73, unlockCost: 5, startsUnlocked: false },
  { id: 'gauntlet', number: 9, name: 'The Gauntlet', category: 'Expert', theme: 'The Slippery Bowling Alley', ground: 0x26394f, road: 0x8bd6dc, unlockCost: 5, startsUnlocked: false },
  { id: 'overflowing-silos', number: 10, name: 'The Overflowing Silos', category: 'Beginner', theme: 'A grain silo figure-eight', ground: 0x465541, road: 0xb7a477, unlockCost: 5, startsUnlocked: false },
  { id: 'obsidian-foundries', number: 11, name: 'The Obsidian Foundries', category: 'Advanced', theme: 'Twin furnace lanes', ground: 0x302d35, road: 0x9c8581, unlockCost: 5, startsUnlocked: false },
  { id: 'chrono-stitched-ruin', number: 12, name: 'The Chrono-Stitched Ruin', category: 'Expert', theme: 'A fractured temporal labyrinth', ground: 0x373653, road: 0x98a5bc, unlockCost: 5, startsUnlocked: false },
  { id: 'world-engine-bastion', number: 13, name: 'The World-Engine Bastion', category: 'Ascended', theme: 'Aegis-Prime orbital citadel', ground: 0x293d5a, road: 0xe6e9ec, unlockCost: 10, startsUnlocked: false },
  { id: 'core-meltdown-vent', number: 14, name: 'The Core Meltdown Vent', category: 'Ascended', theme: 'Prometheus caldera scaffolds', ground: 0x352725, road: 0xb18369, unlockCost: 10, startsUnlocked: false },
  { id: 'bio-vascular-spire', number: 15, name: 'The Bio-Vascular Spire', category: 'Ascended', theme: 'Genesis-Weaver bio-dome', ground: 0x203c35, road: 0x74b889, unlockCost: 10, startsUnlocked: false },
  { id: 'abyssal-trench', number: 16, name: 'The Abyssal Trench', category: 'Ascended', theme: 'Leviathan deep-sea gorge', ground: 0x182c3d, road: 0x5fa4b8, unlockCost: 10, startsUnlocked: false },
  { id: 'alchemists-crucible', number: 17, name: "The Alchemist's Crucible", category: 'Ascended', theme: 'Necro-Alchemist vault laboratory', ground: 0x403746, road: 0xd0b776, unlockCost: 10, startsUnlocked: false },
];

export const CAMPAIGN_MAPS: Record<number, MapId> = {
  1: 'simple-loop', 2: 'open-rectangular', 3: 'dual-u-turn', 4: 'zig-zag-cascade', 5: 'dual-spawn-convergence',
};

function routeFrom(points: Tile[]): Tile[] {
  const route: Tile[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const from = points[i]!;
    const to = points[i + 1];
    if (!route.length) route.push({ ...from });
    if (!to) break;
    const dx = Math.sign(to.x - from.x);
    const dy = Math.sign(to.y - from.y);
    if (dx !== 0 && dy !== 0) throw new Error('Map routes must use orthogonal segments.');
    let x = from.x;
    let y = from.y;
    while (x !== to.x || y !== to.y) {
      x += dx;
      y += dy;
      route.push({ x, y });
    }
  }
  return route;
}

const ROUTES: Partial<Record<MapId, Tile[]>> = {
  // The return lane is offset so its widened road stays distinct from the
  // outbound lane instead of merging into a broad blocked strip.
  'simple-loop': routeFrom([{ x: 32, y: 0 }, { x: 32, y: 71 }, { x: 45, y: 71 }, { x: 45, y: 9 }, { x: 36, y: 9 }, { x: 36, y: 79 }]),
  'dual-u-turn': routeFrom([{ x: 15, y: 0 }, { x: 15, y: 60 }, { x: 35, y: 60 }, { x: 35, y: 20 }, { x: 50, y: 20 }, { x: 50, y: 79 }]),
  'open-rectangular': routeFrom([{ x: 10, y: 0 }, { x: 55, y: 0 }, { x: 55, y: 70 }, { x: 10, y: 70 }, { x: 10, y: 79 }]),
  'short-s-bend': routeFrom([{ x: 0, y: 10 }, { x: 40, y: 10 }, { x: 40, y: 45 }, { x: 15, y: 45 }, { x: 15, y: 79 }]),
  'zig-zag-cascade': routeFrom([{ x: 32, y: 0 }, { x: 32, y: 20 }, { x: 55, y: 20 }, { x: 55, y: 40 }, { x: 10, y: 40 }, { x: 10, y: 60 }, { x: 32, y: 60 }, { x: 32, y: 79 }]),
  'dual-spawn-convergence': routeFrom([{ x: 0, y: 20 }, { x: 32, y: 20 }, { x: 32, y: 79 }]),
  'marathon-corridor': routeFrom([{ x: 5, y: 0 }, { x: 5, y: 15 }, { x: 55, y: 15 }, { x: 55, y: 30 }, { x: 5, y: 30 }, { x: 5, y: 45 }, { x: 55, y: 45 }, { x: 55, y: 60 }, { x: 5, y: 60 }, { x: 5, y: 79 }]),
  'gauntlet': routeFrom([{ x: 32, y: 0 }, { x: 32, y: 79 }]),
  // Map 8's left and right route variants are generated separately below.
  'split-fork': [],
};

const SPLIT_ROUTES: Record<'left' | 'right', Tile[]> = {
  left: routeFrom([{ x: 32, y: 0 }, { x: 32, y: 15 }, { x: 10, y: 15 }, { x: 10, y: 50 }, { x: 32, y: 50 }, { x: 32, y: 79 }]),
  right: routeFrom([{ x: 32, y: 0 }, { x: 32, y: 15 }, { x: 54, y: 15 }, { x: 54, y: 50 }, { x: 32, y: 50 }, { x: 32, y: 79 }]),
};

const MULTI_ROUTES: Partial<Record<MapId, Tile[][]>> = {
  'overflowing-silos': [routeFrom([{ x: 0, y: 40 }, { x: 16, y: 40 }, { x: 16, y: 20 }, { x: 32, y: 20 }, { x: 32, y: 60 }, { x: 48, y: 60 }, { x: 48, y: 40 }, { x: 62, y: 40 }])],
  'obsidian-foundries': [
    routeFrom([{ x: 20, y: 0 }, { x: 20, y: 48 }, { x: 30, y: 48 }, { x: 30, y: 51 }, { x: 31, y: 51 }, { x: 31, y: 78 }]),
    routeFrom([{ x: 42, y: 0 }, { x: 42, y: 48 }, { x: 32, y: 48 }, { x: 32, y: 51 }, { x: 31, y: 51 }, { x: 31, y: 78 }]),
  ],
  'chrono-stitched-ruin': [
    routeFrom([{ x: 31, y: 0 }, { x: 31, y: 10 }, { x: 4, y: 10 }, { x: 4, y: 70 }, { x: 58, y: 70 }, { x: 58, y: 36 }, { x: 6, y: 36 }, { x: 0, y: 36 }]),
    routeFrom([{ x: 31, y: 0 }, { x: 31, y: 10 }, { x: 4, y: 10 }, { x: 4, y: 70 }, { x: 58, y: 70 }, { x: 58, y: 36 }, { x: 62, y: 36 }]),
  ],
  'world-engine-bastion': [
    routeFrom([{ x: 0, y: 38 }, { x: 14, y: 38 }, { x: 14, y: 20 }, { x: 31, y: 20 }, { x: 31, y: 38 }]),
    routeFrom([{ x: 31, y: 0 }, { x: 31, y: 16 }, { x: 48, y: 16 }, { x: 48, y: 38 }, { x: 31, y: 38 }]),
    routeFrom([{ x: 62, y: 38 }, { x: 48, y: 38 }, { x: 48, y: 58 }, { x: 31, y: 58 }, { x: 31, y: 38 }]),
  ],
  'core-meltdown-vent': [routeFrom([{ x: 6, y: 0 }, { x: 6, y: 78 }]), routeFrom([{ x: 56, y: 0 }, { x: 56, y: 78 }])],
  'bio-vascular-spire': [
    routeFrom([{ x: 31, y: 0 }, { x: 31, y: 20 }, { x: 0, y: 20 }, { x: 0, y: 0 }]),
    routeFrom([{ x: 31, y: 0 }, { x: 31, y: 20 }, { x: 62, y: 20 }, { x: 62, y: 0 }]),
    routeFrom([{ x: 31, y: 0 }, { x: 31, y: 20 }, { x: 0, y: 20 }, { x: 0, y: 78 }]),
    routeFrom([{ x: 31, y: 0 }, { x: 31, y: 20 }, { x: 62, y: 20 }, { x: 62, y: 78 }]),
  ],
  'abyssal-trench': [routeFrom([{ x: 31, y: 0 }, { x: 31, y: 18 }, { x: 12, y: 18 }, { x: 12, y: 42 }, { x: 50, y: 42 }, { x: 50, y: 66 }, { x: 31, y: 66 }, { x: 31, y: 78 }])],
  'alchemists-crucible': [
    routeFrom([{ x: 0, y: 0 }, { x: 0, y: 24 }, { x: 20, y: 24 }, { x: 20, y: 54 }, { x: 20, y: 78 }]),
    routeFrom([{ x: 62, y: 0 }, { x: 62, y: 24 }, { x: 42, y: 24 }, { x: 42, y: 54 }, { x: 42, y: 78 }]),
    routeFrom([{ x: 0, y: 78 }, { x: 0, y: 54 }, { x: 20, y: 54 }, { x: 20, y: 78 }]),
    routeFrom([{ x: 62, y: 78 }, { x: 62, y: 54 }, { x: 42, y: 54 }, { x: 42, y: 78 }]),
  ],
};

// The props are deliberately sparse and sit in open build areas. Their tile
// footprints are also reserved by GameScene, so decorative set dressing has
// real placement impact without narrowing any route.
const MAP_OBSTACLES: Record<MapId, MapObstacle[]> = {
  'simple-loop': [
    { x: 5, y: 16, width: 4, height: 4, kind: 'toy' }, { x: 55, y: 18, width: 4, height: 3, kind: 'toy' },
    { x: 6, y: 40, width: 3, height: 4, kind: 'toy' }, { x: 55, y: 47, width: 4, height: 4, kind: 'toy' },
    { x: 16, y: 66, width: 4, height: 4, kind: 'toy' }, { x: 49, y: 68, width: 4, height: 4, kind: 'toy' },
  ],
  'dual-u-turn': [
    { x: 4, y: 12, width: 4, height: 3, kind: 'grill' }, { x: 21, y: 9, width: 4, height: 4, kind: 'table' },
    { x: 41, y: 8, width: 4, height: 4, kind: 'table' }, { x: 55, y: 34, width: 4, height: 4, kind: 'grill' },
    { x: 3, y: 67, width: 5, height: 4, kind: 'table' }, { x: 40, y: 68, width: 4, height: 4, kind: 'grill' },
  ],
  'open-rectangular': [
    { x: 2, y: 10, width: 4, height: 4, kind: 'shelf' }, { x: 20, y: 14, width: 4, height: 4, kind: 'shelf' },
    { x: 36, y: 16, width: 4, height: 4, kind: 'shelf' }, { x: 57, y: 29, width: 4, height: 4, kind: 'shelf' },
    { x: 22, y: 38, width: 4, height: 4, kind: 'shelf' }, { x: 3, y: 51, width: 4, height: 4, kind: 'shelf' },
    { x: 42, y: 53, width: 4, height: 4, kind: 'shelf' }, { x: 12, y: 74, width: 4, height: 4, kind: 'shelf' },
  ],
  'short-s-bend': [
    { x: 4, y: 17, width: 4, height: 4, kind: 'book' }, { x: 21, y: 17, width: 5, height: 4, kind: 'book' },
    { x: 47, y: 19, width: 4, height: 4, kind: 'book' }, { x: 49, y: 36, width: 4, height: 4, kind: 'book' },
    { x: 22, y: 33, width: 4, height: 4, kind: 'book' }, { x: 3, y: 51, width: 4, height: 4, kind: 'book' },
    { x: 22, y: 58, width: 4, height: 4, kind: 'book' }, { x: 47, y: 64, width: 4, height: 4, kind: 'book' },
  ],
  'zig-zag-cascade': [
    { x: 4, y: 5, width: 4, height: 4, kind: 'box' }, { x: 47, y: 5, width: 5, height: 4, kind: 'box' },
    { x: 4, y: 27, width: 4, height: 4, kind: 'box' }, { x: 59, y: 27, width: 4, height: 4, kind: 'box' },
    { x: 27, y: 47, width: 4, height: 4, kind: 'box' }, { x: 3, y: 65, width: 4, height: 4, kind: 'box' },
    { x: 48, y: 67, width: 4, height: 4, kind: 'box' },
  ],
  'dual-spawn-convergence': [
    { x: 5, y: 4, width: 4, height: 4, kind: 'table' }, { x: 14, y: 32, width: 4, height: 4, kind: 'table' },
    { x: 45, y: 32, width: 4, height: 4, kind: 'table' }, { x: 57, y: 5, width: 4, height: 4, kind: 'table' },
    { x: 5, y: 48, width: 4, height: 4, kind: 'table' }, { x: 17, y: 62, width: 4, height: 4, kind: 'table' },
    { x: 43, y: 62, width: 4, height: 4, kind: 'table' }, { x: 57, y: 72, width: 4, height: 4, kind: 'table' },
  ],
  'marathon-corridor': [
    { x: 12, y: 4, width: 5, height: 4, kind: 'sand' }, { x: 36, y: 5, width: 4, height: 4, kind: 'sand' },
    { x: 15, y: 21, width: 4, height: 4, kind: 'sand' }, { x: 39, y: 21, width: 4, height: 4, kind: 'sand' },
    { x: 12, y: 36, width: 4, height: 4, kind: 'sand' }, { x: 35, y: 36, width: 4, height: 4, kind: 'sand' },
    { x: 15, y: 51, width: 4, height: 4, kind: 'sand' }, { x: 39, y: 51, width: 4, height: 4, kind: 'sand' },
    { x: 12, y: 67, width: 4, height: 4, kind: 'sand' }, { x: 35, y: 68, width: 4, height: 4, kind: 'sand' },
  ],
  'split-fork': [
    { x: 4, y: 3, width: 4, height: 4, kind: 'crate' }, { x: 17, y: 4, width: 4, height: 4, kind: 'crate' },
    { x: 44, y: 4, width: 4, height: 4, kind: 'crate' }, { x: 57, y: 28, width: 4, height: 4, kind: 'crate' },
    { x: 5, y: 29, width: 4, height: 4, kind: 'crate' }, { x: 21, y: 31, width: 4, height: 4, kind: 'crate' },
    { x: 39, y: 31, width: 4, height: 4, kind: 'crate' }, { x: 5, y: 57, width: 4, height: 4, kind: 'crate' },
    { x: 18, y: 62, width: 4, height: 4, kind: 'crate' }, { x: 44, y: 63, width: 4, height: 4, kind: 'crate' },
    { x: 56, y: 59, width: 4, height: 4, kind: 'crate' },
  ],
  'gauntlet': [
    { x: 4, y: 4, width: 5, height: 5, kind: 'pins' }, { x: 13, y: 16, width: 4, height: 4, kind: 'pins' },
    { x: 22, y: 27, width: 4, height: 4, kind: 'pins' }, { x: 39, y: 7, width: 5, height: 4, kind: 'pins' },
    { x: 49, y: 20, width: 4, height: 4, kind: 'pins' }, { x: 40, y: 34, width: 4, height: 4, kind: 'pins' },
    { x: 8, y: 42, width: 4, height: 4, kind: 'pins' }, { x: 19, y: 54, width: 4, height: 4, kind: 'pins' },
    { x: 41, y: 62, width: 5, height: 4, kind: 'pins' }, { x: 11, y: 70, width: 4, height: 4, kind: 'pins' },
    { x: 51, y: 74, width: 4, height: 4, kind: 'pins' },
  ],
  'overflowing-silos': [{ x: 5, y: 5, width: 5, height: 5, kind: 'crate' }, { x: 52, y: 9, width: 6, height: 6, kind: 'crate' }, { x: 7, y: 63, width: 5, height: 5, kind: 'crate' }],
  'obsidian-foundries': [{ x: 5, y: 12, width: 8, height: 8, kind: 'grill' }, { x: 47, y: 23, width: 8, height: 8, kind: 'grill' }, { x: 3, y: 61, width: 8, height: 8, kind: 'crate' }],
  'chrono-stitched-ruin': [{ x: 12, y: 22, width: 6, height: 6, kind: 'book' }, { x: 39, y: 8, width: 7, height: 6, kind: 'pins' }, { x: 22, y: 53, width: 8, height: 7, kind: 'book' }],
  'world-engine-bastion': [{ x: 4, y: 6, width: 8, height: 8, kind: 'pins' }, { x: 51, y: 7, width: 8, height: 8, kind: 'pins' }, { x: 4, y: 58, width: 8, height: 8, kind: 'crate' }, { x: 53, y: 57, width: 8, height: 8, kind: 'crate' }],
  'core-meltdown-vent': [{ x: 17, y: 8, width: 13, height: 16, kind: 'grill' }, { x: 35, y: 46, width: 13, height: 16, kind: 'grill' }],
  'bio-vascular-spire': [{ x: 13, y: 34, width: 9, height: 9, kind: 'pins' }, { x: 42, y: 35, width: 9, height: 9, kind: 'pins' }, { x: 26, y: 56, width: 8, height: 8, kind: 'crate' }],
  'abyssal-trench': [{ x: 4, y: 6, width: 9, height: 10, kind: 'crate' }, { x: 43, y: 4, width: 10, height: 10, kind: 'crate' }, { x: 18, y: 56, width: 8, height: 8, kind: 'pins' }, { x: 54, y: 55, width: 7, height: 9, kind: 'crate' }],
  'alchemists-crucible': [{ x: 13, y: 5, width: 8, height: 8, kind: 'crate' }, { x: 42, y: 5, width: 8, height: 8, kind: 'crate' }, { x: 12, y: 34, width: 8, height: 8, kind: 'grill' }, { x: 43, y: 34, width: 8, height: 8, kind: 'grill' }],
};

export function getMap(id: MapId): MapSpec { return MAPS.find((map) => map.id === id)!; }

export function createMapRoute(id: MapId, variant: MapRouteVariant = 'main'): Tile[] {
  if (id === 'dual-spawn-convergence' && variant === 'right') {
    return routeFrom([{ x: 63, y: 20 }, { x: 32, y: 20 }, { x: 32, y: 79 }]);
  }
  if (id === 'split-fork') return [...SPLIT_ROUTES[variant === 'right' ? 'right' : 'left']];
  const routes = MULTI_ROUTES[id];
  if (routes) return [...routes[variant === 'right' ? Math.min(1, routes.length - 1) : 0]!];
  return [...ROUTES[id]!];
}

/** All independently spawned lanes for a map, with shared segments duplicated per route. */
export function createMapRoutes(id: MapId): Tile[][] {
  if (id === 'dual-spawn-convergence') return [createMapRoute(id, 'main'), createMapRoute(id, 'right')];
  if (id === 'split-fork') return [createMapRoute(id, 'left'), createMapRoute(id, 'right')];
  const routes = MULTI_ROUTES[id];
  return routes ? routes.map((route) => [...route]) : [createMapRoute(id)];
}

export function getMapObstacles(id: MapId): MapObstacle[] { return MAP_OBSTACLES[id].map((obstacle) => ({ ...obstacle })); }

export function createSimpleLoopRoute(): Tile[] { return createMapRoute('simple-loop'); }

/** Mark a two-tile-wide road around a one-tile route centerline. */
export function widenRouteTiles(route: Tile[]): Tile[] {
  const tiles = new Map<string, Tile>();
  const add = (tile: Tile) => {
    if (tile.x >= 0 && tile.x < BOARD_COLUMNS && tile.y >= 0 && tile.y < BOARD_ROWS) tiles.set(routeKey(tile), tile);
  };
  route.forEach((tile, index) => {
    add(tile);
    const neighbors = [route[index - 1], route[index + 1]].filter((neighbor): neighbor is Tile => Boolean(neighbor));
    const horizontal = neighbors.some((neighbor) => neighbor.y === tile.y);
    const vertical = neighbors.some((neighbor) => neighbor.x === tile.x);
    if (horizontal) add({ x: tile.x, y: tile.y < BOARD_ROWS - 1 ? tile.y + 1 : tile.y - 1 });
    if (vertical) add({ x: tile.x < BOARD_COLUMNS - 1 ? tile.x + 1 : tile.x - 1, y: tile.y });
    // A 2×2 road needs the inside corner tile where a horizontal and
    // vertical segment meet; without it, the widened legs leave a diagonal gap.
    if (horizontal && vertical) {
      const xOffset = tile.x < BOARD_COLUMNS - 1 ? 1 : -1;
      const yOffset = tile.y < BOARD_ROWS - 1 ? 1 : -1;
      add({ x: tile.x + xOffset, y: tile.y + yOffset });
    }
  });
  return [...tiles.values()];
}

export function routeKey(tile: Tile): string { return `${tile.x},${tile.y}`; }
