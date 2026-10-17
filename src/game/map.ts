export const BOARD_COLUMNS = 64;
export const BOARD_ROWS = 80;

export interface Tile { x: number; y: number }
export interface MapObstacle { x: number; y: number; width: number; height: number; kind: 'toy' | 'grill' | 'shelf' | 'book' | 'box' | 'table' | 'sand' | 'crate' | 'pins' }
export type MapId = 'simple-loop' | 'dual-u-turn' | 'open-rectangular' | 'short-s-bend' | 'zig-zag-cascade' | 'dual-spawn-convergence' | 'marathon-corridor' | 'split-fork' | 'gauntlet';
export type MapRouteVariant = 'main' | 'left' | 'right';

export interface MapSpec {
  id: MapId;
  number: number;
  name: string;
  category: 'Beginner' | 'Advanced' | 'Expert';
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

const ROUTES: Record<MapId, Tile[]> = {
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
};

export function getMap(id: MapId): MapSpec { return MAPS.find((map) => map.id === id)!; }

export function createMapRoute(id: MapId, variant: MapRouteVariant = 'main'): Tile[] {
  if (id === 'dual-spawn-convergence' && variant === 'right') {
    return routeFrom([{ x: 63, y: 20 }, { x: 32, y: 20 }, { x: 32, y: 79 }]);
  }
  if (id === 'split-fork') return [...SPLIT_ROUTES[variant === 'right' ? 'right' : 'left']];
  return [...ROUTES[id]];
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
