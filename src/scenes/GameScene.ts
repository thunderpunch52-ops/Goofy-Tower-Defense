import Phaser from 'phaser';
import { ENEMIES, STAGE_ONE_WAVES, WAVE_EVENT_NAMES, normalizeStar, starScaledBounty, starScaledHp, starScaledLeak, waveClearPayout, type EnemyKey, type EnemySpec, type WaveGroup } from '../game/content';
import { BOARD_COLUMNS, BOARD_ROWS, CAMPAIGN_MAPS, createMapRoute, getMap, getMapObstacles, MAPS, routeKey, widenRouteTiles, type MapId, type MapObstacle, type Tile } from '../game/map';
import { TOWERS, type TowerSpec, type UpgradeTier } from '../game/towers';
import { endlessBountyMultiplier, endlessHpMultiplier, endlessLeakDamage, endlessThreatForEnemy, generateEndlessWave, type EndlessThreat } from '../game/endless';
import { createRunSession } from '../state/runSession';
import { grantPlayerXp, grantTowerXp, initializeProgress, towerMastery, towerUnlocked, unlockBestiaryEntry } from '../state/progression';

const W = 1280;
const H = 720;
const COLORS = { ink: 0x17152f, panel: 0x292750, panelDeep: 0x201e40, cream: '#fff5d7', muted: '#c4c3e5', mint: 0x75efc1, gold: '#ffd15e', pink: 0xff6d9e, blue: 0x63dcff, road: 0x37484d, grid: 0x718080 };
// Use most of the center column for the map so tiles and placed towers are
// easier to distinguish and select at normal browser zoom.
const BOARD = { x: 422.4, y: 88, cell: 10 };
const PRIORITIES = ['First', 'Last', 'Weakest', 'Strongest'] as const;
type Priority = typeof PRIORITIES[number];
const RARITY_COLOR: Record<TowerSpec['rarity'], number> = { Common: 0x8fd3ae, Rare: 0x6fc8e8, Epic: 0xb98cf5, Legendary: 0xf4c86a };
const PHYSICAL_PROJECTILE_TOWER_IDS = new Set(['lawnDartGnome', 'leafBlowerGuy', 'waterBalloonSlingshot', 'stickyBubblegumDispenser', 'angryPigeon', 'squeakyRubberDuckCannon', 'unstableToasterLauncher']);

interface PlacedTower {
  tile: Tile; spec: TowerSpec; sprite: Phaser.GameObjects.Rectangle; art: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; spentCoins: number;
  lastTargetId?: number; cooldown: number; priority: Priority; chosenPath?: number;
  ranks: [number, number, number]; totalUpgrades: number; beamLockTime: number;
  damageMultiplier: number; rangeMultiplier: number; attackSpeedMultiplier: number; baseAttackSpeedMultiplier: number;
  blastMultiplier: number; slowBonus: number; slowDurationMultiplier: number; pushBonus: number;
  stunChance: number; supportPowerMultiplier: number; pigeonAuraBonus: number; coinBonusOnStick: number;
  burnDpsBonus: number; passiveSlow: number; auraSlow: number; nearbyFireRateBonus: number; trackingMultiplier: number;
  cuddleAuraRadiusMultiplier: number; cuddleAuraPowerMultiplier: number;
  guanoDropTimer: number;
  helperPigeons: Phaser.GameObjects.Arc[]; helperPigeonCooldowns: number[];
  pigeonAttackRampSeconds: number; pigeonRangeAuraMultiplier: number; armadaCooldown: number; armadaRemaining: number; armadaPulseTimer: number;
  acquiredUpgrades: UpgradeTier[]; shotCounter: number;
  passiveUpgradeTimers: Map<string, number>;
  criticalChance: number;
  disabledUntil: number;
  stunHitUntil: number;
  noSell: boolean;
  overchargedUntil: number;
}
interface ActiveEnemy {
  id: number; spec: EnemySpec; pathProgress: number; route: Tile[]; hp: number; maxHp: number; sprite: Phaser.GameObjects.Arc; art: Phaser.GameObjects.Graphics;
  waveNumber: number; endlessThreat?: EndlessThreat;
  hpBar: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text; alive: boolean;
  slowUntil: number; slowAmount: number; slowSource?: PlacedTower; reverseMomentumUntil: number;
  burnUntil: number; burnDps: number; burnTick: number; burnSource?: PlacedTower; stunUntil: number;
  freezeUntil: number; unfreezeSlowPending: boolean; unfreezeSlowSource?: PlacedTower; wetUntil: number;
  ccImmuneUntil: number; speedBoostUntil: number; abilityTimer: number; abilitySlowUntil: number; abilitySlowAmount: number; suctionUntil: number; triggeredThresholds: Set<number>;
  armorShred: number; guanoSlipUntil: number; guanoSlipCooldownUntil: number; guanoSlipFloor: number;
  guanoPoisonUntil: number; guanoPoisonTick: number; guanoPoisonStacks: number;
  hyperarmorShred: number; damageTakenMultiplier: number; damageTakenUntil: number;
  physicalDamageTakenMultiplier: number; physicalDamageTakenUntil: number;
}
interface SoapPuddle { x: number; y: number; expiresAt: number; sprite: Phaser.GameObjects.Rectangle }
interface GuanoPuddle { progress: number; route: Tile[]; expiresAt: number; sprite: Phaser.GameObjects.Arc; tower: PlacedTower }
interface PendingImpact { enemyId: number; tower: PlacedTower; damage: number; singleTargetHit: boolean; dueAt: number }
interface RouteArrow { route: Tile[]; progress: number; elapsed: number; graphic: Phaser.GameObjects.Graphics }
interface CampaignMutation { id: string; name: string; description: string; side: 'GOOD' | 'BAD' | 'HELL' | 'UNIQUE'; stackCap: number; stackable?: boolean }

const CAMPAIGN_MUTATIONS: CampaignMutation[] = [
  { id: 'rapidFire', name: 'Rapid Fire', description: 'All towers gain 10% attack speed per stack, up to 150%.', side: 'GOOD', stackCap: 15 },
  { id: 'extendedReach', name: 'Extended Reach', description: 'All towers gain 15% attack and effect range per stack, up to 150%.', side: 'GOOD', stackCap: 10 },
  { id: 'keenAim', name: 'Keen Aim', description: 'Physical damage gains 10 percentage points of critical chance per stack, up to 50 points.', side: 'GOOD', stackCap: 5 },
  { id: 'bountySurge', name: 'Bounty Surge', description: 'Enemy bounties and wave payouts gain 20% per stack, up to 150%.', side: 'GOOD', stackCap: 8 },
  { id: 'lingeringEffects', name: 'Lingering Effects', description: 'Burn, slow, and bleed durations increase 15% per stack, up to 150%.', side: 'GOOD', stackCap: 10 },
  { id: 'discountPath', name: 'Discount Path', description: 'In-run upgrade prices fall 10% per stack, up to 50%.', side: 'GOOD', stackCap: 5 },
  { id: 'narrowedSights', name: 'Narrowed Sights', description: 'All towers lose 5% attack and effect range per stack, up to 30%.', side: 'BAD', stackCap: 6 },
  { id: 'sluggishMechanisms', name: 'Sluggish Mechanisms', description: 'All towers lose 8% attack speed per stack, up to 50%.', side: 'BAD', stackCap: 7 },
  { id: 'dulledImpact', name: 'Dulled Impact', description: 'All towers lose 10% outgoing base attack damage per stack, up to 50%.', side: 'BAD', stackCap: 5 },
  { id: 'priceHike', name: 'Price Hike', description: 'In-run upgrade prices rise 10% per stack, up to 100%.', side: 'BAD', stackCap: 10 },
  { id: 'weakeningSlow', name: 'Weakening Slow', description: 'Tower-applied slow strength falls by 15 percentage points per stack, up to 75 points.', side: 'BAD', stackCap: 5 },
  { id: 'bluntedCriticals', name: 'Blunted Criticals', description: 'Critical damage multiplier falls by 0.10× per stack, up to 0.40×.', side: 'BAD', stackCap: 4 },
  { id: 'crowdedWaves', name: 'Crowded Waves', description: 'Enemies spawn up to 100% faster; their movement speed is unchanged.', side: 'BAD', stackCap: 10 },
  { id: 'leanBounties', name: 'Lean Bounties', description: 'Enemy defeat bounties fall 20% per stack, up to 80%.', side: 'BAD', stackCap: 4 },
  { id: 'systemSlowdown', name: 'System Slowdown', description: 'All towers attack 40% slower.', side: 'HELL', stackCap: 1, stackable: false },
  { id: 'titanBlood', name: 'Titan Blood', description: 'Every enemy has 50% more HP.', side: 'HELL', stackCap: 1, stackable: false },
  { id: 'shortLeash', name: 'Short Leash', description: 'All towers have 50% less base attack and effect range.', side: 'HELL', stackCap: 1, stackable: false },
  { id: 'breachCrisis', name: 'Breach Crisis', description: 'Enemy escape damage is doubled.', side: 'HELL', stackCap: 1, stackable: false },
  { id: 'unsteadyAim', name: 'Unsteady Aim', description: 'Each tower attack has a 10% chance to miss.', side: 'UNIQUE', stackCap: 1, stackable: false },
  { id: 'luckyShot', name: 'Lucky Shot', description: 'Landed attacks have a 1% chance to instantly defeat a non-Boss target.', side: 'UNIQUE', stackCap: 1, stackable: false },
  { id: 'randomTowerSwap', name: 'Random Tower Swap', description: 'Every 30 seconds, swap two placed towers when both footprints fit.', side: 'UNIQUE', stackCap: 1, stackable: false },
  { id: 'glassCannons', name: 'Glass Cannons', description: 'Towers deal 50% more damage; base damage taken is doubled.', side: 'UNIQUE', stackCap: 1, stackable: false },
  { id: 'overchargedSells', name: 'Overcharged Sells', description: 'Towers cannot be sold. A newly placed tower attacks twice as fast for 5 seconds.', side: 'UNIQUE', stackCap: 1, stackable: false },
  { id: 'criticalOverload', name: 'Critical Overload', description: 'Critical hits deal 3× damage; noncritical attacks deal half damage.', side: 'UNIQUE', stackCap: 1, stackable: false },
  { id: 'sharedMisery', name: 'Shared Misery', description: 'Each enemy escape stuns every tower for 2 seconds.', side: 'UNIQUE', stackCap: 1, stackable: false },
  { id: 'phantomBounties', name: 'Phantom Bounties', description: 'Enemy bounties have a 25% chance to double, 25% chance to vanish, and 50% chance to stay normal.', side: 'UNIQUE', stackCap: 1, stackable: false },
  { id: 'reverseMomentum', name: 'Reverse Momentum', description: 'When a tower-applied slow expires, the enemy moves 10% faster for 1 second.', side: 'UNIQUE', stackCap: 1, stackable: false },
  { id: 'echoProjectiles', name: 'Echo Projectiles', description: 'Every tenth original attack repeats as an exact copy.', side: 'UNIQUE', stackCap: 1, stackable: false },
  { id: 'mutationRoulette', name: 'Mutation Roulette', description: 'On acquisition, remove one stack or effect from another random active modifier.', side: 'UNIQUE', stackCap: 1, stackable: false },
];

export class GameScene extends Phaser.Scene {
  private mapId: MapId = CAMPAIGN_MAPS[1]!;
  private campaignStage = 1;
  private mapPreview = false;
  private endlessMode = false;
  private endlessMysteryEnabled = false;
  private endlessModifiersEnabled = false;
  private mysteryTowerMode = false;
  private mysteryTowerCost = 0;
  private mysteryTowerRefund = false;
  private mysteryTowerOffer?: TowerSpec;
  private route: Tile[] = [];
  private visualRoutes: Tile[][] = [];
  private roadTiles = new Set<string>();
  private obstacleTiles = new Set<string>();
  private mapObstacles: MapObstacle[] = [];
  private waveSpawnIndex = 0;
  private run = createRunSession();
  private readonly towers: PlacedTower[] = [];
  private readonly enemies: ActiveEnemy[] = [];
  private readonly soapPuddles: SoapPuddle[] = [];
  private readonly guanoPuddles: GuanoPuddle[] = [];
  private readonly pendingImpacts: PendingImpact[] = [];
  private readonly routeArrows: RouteArrow[] = [];
  private readonly towerObjects = new Map<string, PlacedTower>();
  private wave = 0;
  private star = 1;
  private baseHealth = 100;
  private coins = 450;
  private defaultPriority: Priority = 'First';
  private rosterIndex = TOWERS.findIndex((tower) => tower.id === 'angryPigeon');
  private pendingUpgrade?: { tower: PlacedTower; pathIndex: number };
  private upgradeDetailsOpen = false;
  private placing = false;
  private selectedTower?: PlacedTower;
  private selectedEnemy?: ActiveEnemy;
  private paused = false;
  private speed = 1;
  private countdown = 3;
  private betweenWaveTimer = 0;
  private lastWavePayout = 0;
  private waveGroups: WaveGroup[] = [];
  private groupIndex = 0;
  private groupRemaining = 0;
  private groupDelayStarted = false;
  private spawnTimer = 0;
  private skipCooldown = 0;
  private firstClear = false;
  private campaignGemReward = 0;
  private mutationStacks: Record<string, number> = {};
  private mutationChoiceHistory: string[] = [];
  private stackableMutationCount = 0;
  private nonstackableMutationCount = 0;
  private stackableSinceForced = 0;
  private nonstackableSinceForced = 0;
  private randomSwapTimer = 30;
  private towerStunUntil = 0;
  private modifierChoiceOpen = false;
  private modifierOverlayObjects: Phaser.GameObjects.GameObject[] = [];
  private mutationTabButton?: Phaser.GameObjects.Rectangle;
  private mutationTabLabel?: Phaser.GameObjects.Text;
  private mysteryBoxUsed = false;
  private mysteryPlacing = false;
  private mysteryBoxButton?: Phaser.GameObjects.Rectangle;
  private mysteryBoxTitle?: Phaser.GameObjects.Text;
  private mysteryBoxMeta?: Phaser.GameObjects.Text;
  private simTime = 0;
  private phase: 'countdown' | 'wave' | 'between-waves' | 'victory' | 'defeat' = 'countdown';
  private nextEnemyId = 1;
  private gridFeedback = '';
  private towerButton?: Phaser.GameObjects.Rectangle;
  private statusLabel?: Phaser.GameObjects.Text;
  private waveLabel?: Phaser.GameObjects.Text;
  private healthLabel?: Phaser.GameObjects.Text;
  private coinLabel?: Phaser.GameObjects.Text;
  private enemyCountLabel?: Phaser.GameObjects.Text;
  private selectionLabel?: Phaser.GameObjects.Text;
  private priorityButtonLabel?: Phaser.GameObjects.Text;
  private pauseLabel?: Phaser.GameObjects.Text;
  private speedLabel?: Phaser.GameObjects.Text;
  private speed3Button?: Phaser.GameObjects.Rectangle;
  private speed3Label?: Phaser.GameObjects.Text;
  private speed4Button?: Phaser.GameObjects.Rectangle;
  private speed4Label?: Phaser.GameObjects.Text;
  private cancelPlacementButton?: Phaser.GameObjects.Rectangle;
  private cancelPlacementLabel?: Phaser.GameObjects.Text;
  private deleteTowerButton?: Phaser.GameObjects.Rectangle;
  private deleteTowerLabel?: Phaser.GameObjects.Text;
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  private skipButton?: Phaser.GameObjects.Rectangle;
  private skipButtonLabel?: Phaser.GameObjects.Text;
  private modifierStatusLabel?: Phaser.GameObjects.Text;
  private enemyInspectorLabel?: Phaser.GameObjects.Text;
  private inspectorGraphics?: Phaser.GameObjects.Graphics;
  private towerStatsLabel?: Phaser.GameObjects.Text;
  private rosterNameLabel?: Phaser.GameObjects.Text;
  private bottomBarTitle?: Phaser.GameObjects.Text;
  private towerGridOverlay?: Phaser.GameObjects.Rectangle;
  private towerGridTitle?: Phaser.GameObjects.Text;
  private towerGridClose?: Phaser.GameObjects.Rectangle;
  private towerGridCloseLabel?: Phaser.GameObjects.Text;
  private towerGridHint?: Phaser.GameObjects.Text;
  private towerGridCards: Array<{ button: Phaser.GameObjects.Rectangle; icon: Phaser.GameObjects.Arc; title: Phaser.GameObjects.Text; meta: Phaser.GameObjects.Text; lock: Phaser.GameObjects.Graphics; lockText: Phaser.GameObjects.Text }> = [];
  private upgradeConfirmButton?: Phaser.GameObjects.Rectangle;
  private upgradeConfirmLabel?: Phaser.GameObjects.Text;
  private upgradeDenyButton?: Phaser.GameObjects.Rectangle;
  private upgradeDenyLabel?: Phaser.GameObjects.Text;
  private upgradeNameButton?: Phaser.GameObjects.Rectangle;
  private upgradeNameLabel?: Phaser.GameObjects.Text;
  private upgradeButtons: Phaser.GameObjects.Rectangle[] = [];
  private upgradeLabels: Phaser.GameObjects.Text[] = [];
  private hudGraphics?: Phaser.GameObjects.Graphics;
  private boardLayer?: Phaser.GameObjects.Container;
  private boardZoom = 0.7;
  private zoomLabel?: Phaser.GameObjects.Text;
  private waveTotalHp = 0;
  private waveEnemyCount = 0;
  private waveDamageByTower = new Map<PlacedTower, number>();
  private waveBuffTargets = new Map<PlacedTower, Set<PlacedTower>>();
  private waveDebuffTargets = new Map<PlacedTower, Set<number>>();
  private runMasteryXp = new Map<string, number>();

  constructor() { super('Game'); }

  create(): void {
    initializeProgress(this.registry);
    this.mapPreview = this.registry.get('runMode') === 'map-preview';
    this.endlessMode = this.registry.get('runMode') === 'endless';
    this.endlessMysteryEnabled = this.endlessMode && Boolean(this.registry.get('endlessMysteryEnabled'));
    this.endlessModifiersEnabled = this.endlessMode && Boolean(this.registry.get('endlessModifiersEnabled'));
    this.resetRunState();
    const requestedMap = this.registry.get('selectedMapId') as MapId | undefined;
    this.campaignStage = Phaser.Math.Clamp(Math.floor(Number(this.registry.get('campaignStage') ?? 1)), 1, 5);
    this.mapId = (this.mapPreview || this.endlessMode) && MAPS.some((map) => map.id === requestedMap) ? requestedMap! : CAMPAIGN_MAPS[this.campaignStage]!;
    this.visualRoutes = this.mapId === 'dual-spawn-convergence' || this.mapId === 'split-fork'
      ? [createMapRoute(this.mapId, 'left'), createMapRoute(this.mapId, 'right')]
      : [createMapRoute(this.mapId)];
    this.route = this.visualRoutes[0]!;
    this.roadTiles = new Set(this.visualRoutes.flatMap((route) => widenRouteTiles(route).map(routeKey)));
    this.prepareMapObstacles();
    this.cameras.main.setBackgroundColor(COLORS.ink);
    this.drawFrame();
    this.createBoardLayer();
    this.drawBoard();
    this.centerBoardAtDefaultZoom();
    this.drawPanels();
    this.cursorKeys = this.input.keyboard?.createCursorKeys();
    this.beginWave(1);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.disposeScene());
  }

  private resetRunState(): void {
    this.run = createRunSession();
    this.towers.length = 0;
    this.enemies.length = 0;
    this.soapPuddles.splice(0).forEach((puddle) => puddle.sprite.destroy());
    this.pendingImpacts.length = 0;
    this.routeArrows.length = 0;
    this.mutationStacks = {};
    this.mutationChoiceHistory = [];
    this.stackableMutationCount = 0;
    this.nonstackableMutationCount = 0;
    this.stackableSinceForced = 0;
    this.nonstackableSinceForced = 0;
    this.randomSwapTimer = 30;
    this.towerStunUntil = 0;
    this.modifierChoiceOpen = false;
    this.modifierOverlayObjects.length = 0;
    this.mysteryBoxUsed = false;
    this.waveTotalHp = 0;
    this.waveEnemyCount = 0;
    this.waveDamageByTower.clear();
    this.waveBuffTargets.clear();
    this.waveDebuffTargets.clear();
    this.runMasteryXp.clear();
    this.mysteryPlacing = false;
    this.mysteryTowerMode = false;
    this.mysteryTowerCost = 0;
    this.mysteryTowerRefund = false;
    this.mysteryTowerOffer = undefined;
    this.towerObjects.clear();
    this.wave = 0;
    this.waveSpawnIndex = 0;
    this.star = normalizeStar(Number(this.registry.get('selectedStar') ?? 1));
    this.baseHealth = 100;
    this.coins = 450;
    this.defaultPriority = 'First';
    this.placing = false;
    this.selectedTower = undefined;
    this.selectedEnemy = undefined;
    this.paused = false;
    this.speed = 1;
    this.countdown = 3;
    this.betweenWaveTimer = 0;
    this.lastWavePayout = 0;
    this.waveGroups = [];
    this.groupIndex = 0;
    this.groupRemaining = 0;
    this.groupDelayStarted = false;
    this.spawnTimer = 0;
    this.skipCooldown = 0;
    this.firstClear = false;
    this.campaignGemReward = 0;
    this.simTime = 0;
    this.rosterIndex = TOWERS.findIndex((tower) => tower.id === 'angryPigeon');
    this.pendingUpgrade = undefined;
    this.upgradeDetailsOpen = false;
    this.upgradeButtons.length = 0;
    this.upgradeLabels.length = 0;
    this.towerButton = undefined;
    this.speedLabel = undefined;
    this.speed3Button = undefined;
    this.speed3Label = undefined;
    this.speed4Button = undefined;
    this.speed4Label = undefined;
    this.statusLabel = undefined;
    this.waveLabel = undefined;
    this.healthLabel = undefined;
    this.coinLabel = undefined;
    this.enemyCountLabel = undefined;
    this.selectionLabel = undefined;
    this.towerStatsLabel = undefined;
    this.priorityButtonLabel = undefined;
    this.rosterNameLabel = undefined;
    this.bottomBarTitle = undefined;
    this.towerGridOverlay = undefined;
    this.towerGridTitle = undefined;
    this.towerGridClose = undefined;
    this.towerGridCloseLabel = undefined;
    this.towerGridHint = undefined;
    this.mysteryBoxButton = undefined;
    this.mysteryBoxTitle = undefined;
    this.mysteryBoxMeta = undefined;
    this.towerGridCards.length = 0;
    this.boardLayer = undefined;
    this.boardZoom = 0.7;
    this.zoomLabel = undefined;
    this.cancelPlacementButton = undefined;
    this.cancelPlacementLabel = undefined;
    this.deleteTowerButton = undefined;
    this.deleteTowerLabel = undefined;
    this.cursorKeys = undefined;
    this.upgradeConfirmButton = undefined;
    this.upgradeConfirmLabel = undefined;
    this.upgradeDenyButton = undefined;
    this.upgradeDenyLabel = undefined;
    this.upgradeNameButton = undefined;
    this.upgradeNameLabel = undefined;
    this.enemyInspectorLabel = undefined;
    this.inspectorGraphics = undefined;
    this.skipButton = undefined;
    this.skipButtonLabel = undefined;
    this.modifierStatusLabel = undefined;
    this.mutationTabButton = undefined;
    this.mutationTabLabel = undefined;
    this.phase = 'countdown';
    this.nextEnemyId = 1;
    this.gridFeedback = '';
  }

  update(_time: number, deltaMs: number): void {
    this.stepRouteArrows(Math.min(deltaMs / 1000, 0.1));
    this.panBoardWithKeys(deltaMs / 1000);
    if (this.paused || this.modifierChoiceOpen || this.phase === 'victory' || this.phase === 'defeat') return;
    let remaining = Math.min(deltaMs / 1000, 0.1) * this.speed;
    while (remaining > 0) {
      const step = Math.min(remaining, 1 / 60);
      remaining -= step;
      this.step(step);
    }
    this.updateHUD();
  }

  private get currentTowerSpec(): TowerSpec { return TOWERS[this.rosterIndex]!; }
  private get placementCost(): number { return this.mysteryPlacing ? 0 : this.currentTowerSpec.cost; }

  private panBoardWithKeys(deltaSeconds: number): void {
    if (!this.boardLayer || !this.cursorKeys) return;
    const amount = 420 * Math.min(deltaSeconds, 0.05);
    let dx = 0; let dy = 0;
    if (this.cursorKeys.left.isDown) dx += amount;
    if (this.cursorKeys.right.isDown) dx -= amount;
    if (this.cursorKeys.up.isDown) dy += amount;
    if (this.cursorKeys.down.isDown) dy -= amount;
    if (!dx && !dy) return;
    this.boardLayer.x += dx;
    this.boardLayer.y += dy;
    this.clampBoardPosition();
  }

  private clampBoardPosition(): void {
    const layer = this.boardLayer;
    if (!layer) return;
    const left = BOARD.x * this.boardZoom;
    const right = (BOARD.x + BOARD_COLUMNS * BOARD.cell) * this.boardZoom;
    const top = BOARD.y * this.boardZoom;
    const bottom = (BOARD.y + BOARD_ROWS * BOARD.cell) * this.boardZoom;
    const horizontal = right - left < 484
      ? { min: 640 - (left + right) / 2, max: 640 - (left + right) / 2 }
      : { min: 882 - right, max: 398 - left };
    const vertical = bottom - top < 550
      ? { min: 357 - (top + bottom) / 2, max: 357 - (top + bottom) / 2 }
      : { min: 632 - bottom, max: 82 - top };
    layer.x = Phaser.Math.Clamp(layer.x, horizontal.min, horizontal.max);
    layer.y = Phaser.Math.Clamp(layer.y, vertical.min, vertical.max);
  }

  private centerBoardAtDefaultZoom(): void {
    if (!this.boardLayer) return;
    this.boardZoom = 0.7;
    this.boardLayer.setScale(this.boardZoom);
    this.boardLayer.setPosition(
      640 - (BOARD.x + BOARD_COLUMNS * BOARD.cell / 2) * this.boardZoom,
      357 - (BOARD.y + BOARD_ROWS * BOARD.cell / 2) * this.boardZoom,
    );
    this.clampBoardPosition();
  }

  private toggleFreeSpeed(): void {
    this.speed = this.speed === 1 ? 2 : 1;
    this.gridFeedback = '';
    this.updateHUD();
  }

  private selectOrUnlockBoostSpeed(targetSpeed: 3 | 4): void {
    const unlocked = new Set((this.registry.get('unlockedGameSpeeds') as number[] | undefined) ?? []);
    if (targetSpeed === 4 && !unlocked.has(3)) {
      this.gridFeedback = 'UNLOCK 3× SPEED FIRST';
      this.updateHUD();
      return;
    }
    if (!unlocked.has(targetSpeed)) {
      const progress = this.registry.get('mapProgress') as { gems: number; unlockedMaps: MapId[] };
      if (progress.gems < 30) {
        this.gridFeedback = `NEED 30 GEMS TO UNLOCK ${targetSpeed}× SPEED`;
        this.updateHUD();
        return;
      }
      progress.gems -= 30;
      unlocked.add(targetSpeed);
      this.registry.set('mapProgress', progress);
      this.registry.set('unlockedGameSpeeds', [...unlocked]);
      this.gridFeedback = `${targetSpeed}× SPEED UNLOCKED · 30 GEMS SPENT`;
    } else {
      this.gridFeedback = '';
    }
    this.speed = targetSpeed;
    this.updateHUD();
  }

  private get totalWaves(): number {
    if (this.endlessMode) return Number.POSITIVE_INFINITY;
    if (this.mapPreview) return STAGE_ONE_WAVES.length;
    if (this.campaignStage <= 3) return this.campaignStage * 5;
    if (this.campaignStage === 4 && this.star < 3) return 10;
    return 15;
  }

  private startPlacingTower(): void {
    if (this.phase === 'victory' || this.phase === 'defeat') return;
    const spec = this.currentTowerSpec;
    if (this.coins < this.placementCost) {
      this.gridFeedback = `NOT ENOUGH COINS · $${this.placementCost} NEEDED`;
      this.updateHUD();
      return;
    }
    this.placing = true;
    this.selectedTower = undefined;
    this.selectedEnemy = undefined;
    this.pendingUpgrade = undefined;
    this.upgradeDetailsOpen = false;
    this.gridFeedback = this.mysteryPlacing ? 'PLACE MYSTERY BOX · FREE · TOWER REVEALED ON PLACEMENT' : `PLACE ${spec.name.toUpperCase()} · ${spec.footprint}×${spec.footprint}`;
    this.updateHUD();
  }

  private cancelPlacement(): void {
    if (!this.placing) return;
    this.placing = false;
    this.placing = false;
    if (this.mysteryPlacing && this.mysteryTowerRefund) {
      this.coins += this.mysteryTowerCost;
      this.mysteryTowerRefund = false;
      this.gridFeedback = `MYSTERY TOWER REFUNDED · $${this.mysteryTowerCost}`;
    } else this.gridFeedback = 'PLACEMENT CANCELLED';
    this.mysteryPlacing = false;
    this.mysteryTowerMode = false;
    this.hudGraphics?.clear();
    this.updateHUD();
  }

  private deleteSelectedTower(): void {
    const tower = this.selectedTower;
    if (!tower) return;
    if (tower.noSell || this.mutationStack('overchargedSells') > 0) { this.gridFeedback = 'THIS TOWER CANNOT BE SOLD'; this.updateHUD(); return; }
    const refund = Math.ceil(tower.spentCoins * 0.5);
    this.coins += refund;
    this.run.coins = this.coins;
    for (const dx of Array.from({ length: tower.spec.footprint }, (_, index) => index)) {
      for (const dy of Array.from({ length: tower.spec.footprint }, (_, index) => index)) {
        this.towerObjects.delete(routeKey({ x: tower.tile.x + dx, y: tower.tile.y + dy }));
      }
    }
    const index = this.towers.indexOf(tower);
    if (index >= 0) this.towers.splice(index, 1);
    this.pendingImpacts.splice(0, this.pendingImpacts.length, ...this.pendingImpacts.filter((impact) => impact.tower !== tower));
    for (const enemy of this.enemies) if (enemy.burnSource === tower) enemy.burnSource = undefined;
    this.waveDamageByTower.delete(tower);
    this.waveBuffTargets.delete(tower);
    this.waveDebuffTargets.delete(tower);
    this.selectedTower = undefined;
    this.pendingUpgrade = undefined;
    this.upgradeDetailsOpen = false;
    tower.sprite.destroy(); tower.art.destroy();
    tower.label.destroy();
    tower.helperPigeons.forEach((bird) => bird.destroy());
    tower.helperPigeons.length = 0;
    tower.helperPigeonCooldowns.length = 0;
    for (let puddleIndex = this.guanoPuddles.length - 1; puddleIndex >= 0; puddleIndex -= 1) {
      const puddle = this.guanoPuddles[puddleIndex]!;
      if (puddle.tower !== tower) continue;
      puddle.sprite.destroy();
      this.guanoPuddles.splice(puddleIndex, 1);
    }
    this.gridFeedback = `TOWER SOLD · +$${refund} REFUND`;
    this.updateHUD();
  }

  private drawFrame(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.panelDeep, 1).lineStyle(2, 0x57558d, 1).fillRoundedRect(20, 20, W - 40, H - 40, 22).strokeRoundedRect(20, 20, W - 40, H - 40, 22);
    g.fillStyle(COLORS.panel, 1).fillRoundedRect(38, 42, 340, 638, 16);
    g.fillStyle(COLORS.panel, 1).fillRoundedRect(902, 42, 340, 638, 16);
    g.fillStyle(COLORS.ink, 1).lineStyle(2, COLORS.blue, 0.85).fillRoundedRect(390, 42, 500, 638, 16).strokeRoundedRect(390, 42, 500, 638, 16);
    g.fillStyle(COLORS.pink, 0.95).fillRoundedRect(38, 54, 7, 112, 4);
    g.fillStyle(COLORS.mint, 0.95).fillRoundedRect(1235, 54, 7, 112, 4);
    g.fillStyle(0xffd15e, 0.9).fillRoundedRect(400, 48, 80, 4, 2);
    g.fillStyle(0xffffff, 0.12);
    [[54, 64], [365, 657], [917, 65], [1225, 654], [402, 664], [874, 54]].forEach(([x, y]) => g.fillCircle(x!, y!, 3));
    this.add.text(68, 54, this.mapPreview ? 'MAP PREVIEW   ·   STAGE 1 WAVES' : this.endlessMode ? `ENDLESS   /   ${this.star} STAR` : `STAGE ${this.campaignStage}   /   ${this.star} STAR`, { fontFamily: 'Arial', fontSize: '13px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 2 });
    this.add.text(68, 77, getMap(this.mapId).name, { fontFamily: 'Arial', fontSize: '21px', color: COLORS.cream, fontStyle: 'bold', wordWrap: { width: 300 } });
    this.add.text(1068, 58, 'GOOFY TOWER SHOP', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 1 });
  }

  private createBoardLayer(): void {
    this.boardLayer = this.add.container(0, 0).setDepth(0);
    const maskShape = this.make.graphics({}, false);
    maskShape.fillStyle(0xffffff).fillRect(398, 82, 484, 550);
    this.boardLayer.setMask(maskShape.createGeometryMask());
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      if (pointer.x >= 398 && pointer.x <= 882 && pointer.y >= 82 && pointer.y <= 632) {
        this.setBoardZoom(this.boardZoom + (dy < 0 ? 0.1 : -0.1), pointer.x, pointer.y);
      }
    });
  }

  private addToBoard<T extends Phaser.GameObjects.GameObject>(object: T): T {
    if (object instanceof Phaser.GameObjects.Text) object.setResolution(2.2);
    this.boardLayer?.add(object);
    return object;
  }

  private setBoardZoom(zoom: number, anchorX = 640, anchorY = 360): void {
    const layer = this.boardLayer;
    if (!layer) return;
    const nextZoom = Phaser.Math.Clamp(Math.round(zoom * 10) / 10, 0.5, 2.2);
    const localX = (anchorX - layer.x) / this.boardZoom;
    const localY = (anchorY - layer.y) / this.boardZoom;
    this.boardZoom = nextZoom;
    layer.setScale(nextZoom).setPosition(anchorX - localX * nextZoom, anchorY - localY * nextZoom);
    this.clampBoardPosition();
    this.zoomLabel?.setText(`${Math.round(nextZoom * 100)}%`);
  }

  private boardPoint(pointer: Phaser.Input.Pointer): { x: number; y: number } {
    const layer = this.boardLayer;
    return layer
      ? { x: (pointer.x - layer.x) / this.boardZoom, y: (pointer.y - layer.y) / this.boardZoom }
      : { x: pointer.x, y: pointer.y };
  }

  private drawBoard(): void {
    const boardWidth = BOARD_COLUMNS * BOARD.cell;
    const boardHeight = BOARD_ROWS * BOARD.cell;
    const graphics = this.addToBoard(this.add.graphics());
    graphics.fillStyle(0x172831, 1).fillRoundedRect(398, 82, 484, 598, 11);
    const map = getMap(this.mapId);
    graphics.fillStyle(map.ground, 1).fillRect(BOARD.x, BOARD.y, boardWidth, boardHeight);
    this.drawMapSurface(graphics);
    // Keep the grid on the ground only. Drawing it after the road makes
    // every tile seam look like a break in the widened route.
    graphics.lineStyle(1, COLORS.grid, 0.18);
    for (let x = 0; x <= BOARD_COLUMNS; x += 1) graphics.lineBetween(BOARD.x + x * BOARD.cell, BOARD.y, BOARD.x + x * BOARD.cell, BOARD.y + boardHeight);
    for (let y = 0; y <= BOARD_ROWS; y += 1) graphics.lineBetween(BOARD.x, BOARD.y + y * BOARD.cell, BOARD.x + boardWidth, BOARD.y + y * BOARD.cell);
    graphics.fillStyle(map.road, 1);
    for (const key of this.roadTiles) {
      const [x, y] = key.split(',').map(Number);
      graphics.fillRect(BOARD.x + x! * BOARD.cell, BOARD.y + y! * BOARD.cell, BOARD.cell, BOARD.cell);
    }
    this.drawMapObstacles(graphics);
    this.createRouteArrows();
    const start = this.route[0]!;
    const end = this.route[this.route.length - 1]!;
    if (this.mapId === 'dual-spawn-convergence') {
      for (const route of this.visualRoutes) this.addToBoard(this.add.circle(this.tileCenter(route[0]!).x, this.tileCenter(route[0]!).y, BOARD.cell * 0.52, 0xa9e7c2, 0.95));
    } else this.addToBoard(this.add.circle(this.tileCenter(start).x, this.tileCenter(start).y, BOARD.cell * 0.52, 0xa9e7c2, 0.95));
    this.addToBoard(this.add.circle(this.tileCenter(end).x, this.tileCenter(end).y, BOARD.cell * 0.52, 0xef7e70, 0.95));
    const hitArea = this.addToBoard(this.add.rectangle(BOARD.x + boardWidth / 2, BOARD.y + boardHeight / 2, boardWidth, boardHeight, 0x000000, 0)
      .setInteractive({ useHandCursor: true }));
    hitArea.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const point = this.boardPoint(pointer);
      const x = Math.floor((point.x - BOARD.x) / BOARD.cell);
      const y = Math.floor((point.y - BOARD.y) / BOARD.cell);
      const tile = { x, y };
      if (x < 0 || x >= BOARD_COLUMNS || y < 0 || y >= BOARD_ROWS) return;
      if (this.placing) {
        this.gridFeedback = this.isBuildable(tile) && this.coins >= this.placementCost
          ? `OPEN TILE (${x}, ${y}) · CLICK TO PLACE`
          : this.coins < this.placementCost ? `NEED $${this.placementCost}` : `BLOCKED TILE (${x}, ${y})`;
        this.drawPlacementPreview(tile);
      } else {
        const tower = this.towerObjects.get(routeKey(tile));
        this.gridFeedback = tower ? `${tower.spec.name.toUpperCase()} · CLICK TO INSPECT` : 'SELECT A TOWER TO PLACE';
      }
      this.updateHUD();
    });
    hitArea.on('pointerout', () => { this.gridFeedback = ''; this.updateHUD(); });
    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const point = this.boardPoint(pointer);
      const tile = { x: Math.floor((point.x - BOARD.x) / BOARD.cell), y: Math.floor((point.y - BOARD.y) / BOARD.cell) };
      if (tile.x < 0 || tile.x >= BOARD_COLUMNS || tile.y < 0 || tile.y >= BOARD_ROWS) return;
      if (this.placing) this.placeTower(tile);
      else if (!this.selectEnemyAt(point.x, point.y)) this.selectTower(tile);
    });
    this.hudGraphics = this.addToBoard(this.add.graphics().setDepth(5));
  }

  private prepareMapObstacles(): void {
    this.obstacleTiles.clear();
    this.mapObstacles = getMapObstacles(this.mapId).filter((obstacle) => {
      const keys: string[] = [];
      for (let x = obstacle.x; x < obstacle.x + obstacle.width; x += 1) {
        for (let y = obstacle.y; y < obstacle.y + obstacle.height; y += 1) {
          const key = routeKey({ x, y });
          if (x < 0 || x >= BOARD_COLUMNS || y < 0 || y >= BOARD_ROWS || this.roadTiles.has(key) || this.obstacleTiles.has(key)) return false;
          keys.push(key);
        }
      }
      keys.forEach((key) => this.obstacleTiles.add(key));
      return true;
    });
  }

  private drawMapObstacles(graphics: Phaser.GameObjects.Graphics): void {
    const palette: Record<MapObstacle['kind'], { body: number; trim: number; accent: number }> = {
      toy: { body: 0x67517a, trim: 0xf7b0c7, accent: 0x63dcff },
      grill: { body: 0x414950, trim: 0xe1a26d, accent: 0xf2745f },
      shelf: { body: 0x75603d, trim: 0xffdf84, accent: 0x73d9a0 },
      book: { body: 0x4f3f65, trim: 0xcaa9ee, accent: 0xf3c86a },
      box: { body: 0x80603d, trim: 0xe7c18c, accent: 0x9a7650 },
      table: { body: 0x65503f, trim: 0xf1d5a0, accent: 0xff6d9e },
      sand: { body: 0x8c8152, trim: 0xe5d389, accent: 0x75efc1 },
      crate: { body: 0x795437, trim: 0xe1b66f, accent: 0xffd15e },
      pins: { body: 0x344d62, trim: 0x8bd6dc, accent: 0xff6d9e },
    };
    for (const obstacle of this.mapObstacles) {
      const x = BOARD.x + obstacle.x * BOARD.cell + 1;
      const y = BOARD.y + obstacle.y * BOARD.cell + 1;
      const width = obstacle.width * BOARD.cell - 2;
      const height = obstacle.height * BOARD.cell - 2;
      const colors = palette[obstacle.kind];
      const cx = x + width / 2;
      const cy = y + height / 2;
      graphics.fillStyle(0x101820, 0.45).fillRoundedRect(x + 2, y + 3, width, height, 3);
      graphics.fillStyle(colors.body, 1).fillRoundedRect(x, y, width, height, 3);
      graphics.lineStyle(1.2, colors.trim, 0.95).strokeRoundedRect(x, y, width, height, 3);
      if (obstacle.kind === 'shelf') {
        for (let row = 1; row <= 2; row += 1) {
          const yy = y + height * row / 3;
          graphics.lineStyle(1.1, colors.trim, 0.85).lineBetween(x + 3, yy, x + width - 3, yy);
          for (let col = 0; col < 3; col += 1) graphics.fillStyle(col % 2 ? colors.accent : 0xff6d9e, 0.9)
            .fillRoundedRect(x + 4 + col * (width - 10) / 3, yy - 4, Math.max(3, (width - 14) / 4), 3.5, 1);
        }
      } else if (obstacle.kind === 'grill') {
        graphics.fillStyle(colors.accent, 0.8).fillRoundedRect(x + 4, y + 3, width - 8, 4, 2);
        for (let row = 0; row < 3; row += 1) graphics.lineStyle(0.8, colors.trim, 0.8)
          .lineBetween(x + 4, cy - 4 + row * 4, x + width - 4, cy - 4 + row * 4);
      } else if (obstacle.kind === 'table') {
        graphics.fillStyle(colors.accent, 0.9).fillCircle(cx, cy, Math.min(width, height) * 0.17);
        graphics.fillStyle(colors.trim, 0.9).fillCircle(cx, cy, Math.min(width, height) * 0.08);
        for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) graphics.fillStyle(0x29243a, 0.7)
          .fillRoundedRect(cx + dx * width * 0.34 - 2, cy + dy * height * 0.34 - 2, 4, 4, 1);
      } else if (obstacle.kind === 'toy' || obstacle.kind === 'pins') {
        const radius = Math.min(width, height) * 0.13;
        for (let i = 0; i < 3; i += 1) {
          const px = x + width * (0.27 + i * 0.23);
          const py = cy + (i % 2 ? -1 : 1) * height * 0.1;
          graphics.fillStyle(i === 1 ? colors.accent : colors.trim, 1).fillCircle(px, py, radius);
          graphics.lineStyle(0.7, 0xffffff, 0.7).strokeCircle(px, py, radius);
        }
      } else if (obstacle.kind === 'sand') {
        graphics.fillStyle(colors.trim, 0.45).fillEllipse(cx, cy, width * 0.7, height * 0.58);
        graphics.lineStyle(1, colors.accent, 0.8).lineBetween(cx, y + 3, cx, cy);
        graphics.fillStyle(colors.accent, 0.9).fillTriangle(cx, y + 4, cx + 6, y + 7, cx, y + 10);
      } else {
        graphics.lineStyle(1.2, colors.trim, 0.75).lineBetween(x + 3, y + 3, x + width - 3, y + height - 3);
        graphics.lineStyle(1.2, colors.trim, 0.75).lineBetween(x + width - 3, y + 3, x + 3, y + height - 3);
        graphics.fillStyle(colors.accent, 0.8).fillRect(cx - 2, y + 2, 4, height - 4);
      }
    }
  }

  private drawMapSurface(graphics: Phaser.GameObjects.Graphics): void {
    const cell = BOARD.cell;
    const tileX = (col: number) => BOARD.x + col * cell;
    const tileY = (row: number) => BOARD.y + row * cell;
    const open = (col: number, row: number) => !this.roadTiles.has(routeKey({ x: col, y: row }));
    const mark = (col: number, row: number, color: number, alpha: number, w = 2.2, h = 2.2, ox = 2, oy = 2) => {
      if (!open(col, row)) return;
      graphics.fillStyle(color, alpha).fillRoundedRect(tileX(col) + ox, tileY(row) + oy, w, h, 0.8);
    };
    const line = (x1: number, y1: number, x2: number, y2: number, color: number, alpha: number, width = 0.65) => {
      graphics.lineStyle(width, color, alpha).lineBetween(x1, y1, x2, y2);
    };

    // A faint tile-level grain keeps the large board from reading as a flat
    // color field. The themed treatments below remain decorative only.
    for (let row = 1; row < BOARD_ROWS; row += 5) {
      for (let col = (row % 2) * 2 + 1; col < BOARD_COLUMNS; col += 5) {
        if (!open(col, row)) continue;
        const grain = ((col * 17 + row * 31) % 3) === 0 ? 0xf7e8c4 : 0x15152e;
        mark(col, row, grain, 0.12, 1.5, 1.1, 2.6, 2.8);
      }
    }

    switch (this.mapId) {
      case 'simple-loop': { // High-pile living-room rug fibers and dropped toys.
        for (let row = 2; row < BOARD_ROWS; row += 3) {
          for (let col = (row % 3) + 1; col < BOARD_COLUMNS; col += 4) {
            if (!open(col, row)) continue;
            const x = tileX(col) + 1.4;
            const y = tileY(row) + 2.2;
            line(x, y, x + 2.1, y - 0.7, 0xf0c69b, 0.22, 0.7);
          }
        }
        [[5, 16, 0xff6d9e], [55, 26, 0x63dcff], [7, 58, 0xffd15e], [57, 67, 0x75efc1]].forEach(([x, y, color]) => {
          mark(x!, y!, color!, 0.3, 4.1, 2.7, 1.3, 2.1);
        });
        break;
      }
      case 'dual-u-turn': { // Patio pavers and two little picnic-blanket patches.
        for (let row = 0; row <= BOARD_ROWS; row += 4) line(BOARD.x, tileY(row), BOARD.x + BOARD_COLUMNS * cell, tileY(row), 0xe8d4a1, 0.13);
        for (let col = 0; col <= BOARD_COLUMNS; col += 4) line(tileX(col), BOARD.y, tileX(col), BOARD.y + BOARD_ROWS * cell, 0x1b382f, 0.16);
        for (const [left, top] of [[3, 39], [40, 28]] as const) {
          for (let row = top; row < top + 8; row++) for (let col = left; col < left + 9; col++) {
            if (!open(col, row) && ((col + row) % 2 === 0)) continue;
            if ((col + row) % 2 === 0) graphics.fillStyle(0xfff0c5, 0.11).fillRect(tileX(col), tileY(row), cell, cell);
          }
          graphics.lineStyle(1, 0xf8e7b4, 0.28).strokeRect(tileX(left), tileY(top), cell * 9, cell * 8);
        }
        break;
      }
      case 'open-rectangular': { // Grocery aisle shelf ends, cereal and cans.
        for (const col of [2, 6, 58, 62]) {
          line(tileX(col), BOARD.y + cell * 3, tileX(col), BOARD.y + cell * 76, 0xf7da70, 0.28, 1.3);
          for (let row = 5; row < BOARD_ROWS - 4; row += 7) {
            const colors = [0xff6d9e, 0x63dcff, 0xffd15e, 0x75efc1];
            mark(col, row, colors[Math.floor(row / 7) % colors.length]!, 0.48, 3.2, 3.2, 1.8, 1.8);
          }
        }
        for (let row = 12; row < 68; row += 12) line(tileX(1), tileY(row), tileX(8), tileY(row), 0xf8e6aa, 0.16, 1.1);
        break;
      }
      case 'short-s-bend': { // Ruled notebook paper, margin and pencil-lead flecks.
        for (let row = 3; row < BOARD_ROWS; row += 5) line(BOARD.x, tileY(row), BOARD.x + BOARD_COLUMNS * cell, tileY(row), 0x84c9ed, 0.18, 0.6);
        line(tileX(5), BOARD.y, tileX(5), BOARD.y + BOARD_ROWS * cell, 0xef7e9c, 0.24, 1);
        line(tileX(59), BOARD.y, tileX(59), BOARD.y + BOARD_ROWS * cell, 0xef7e9c, 0.18, 1);
        for (let row = 5; row < BOARD_ROWS; row += 11) {
          mark(54, row, 0xf4c86a, 0.35, 4.4, 1.2, 1.1, 2.8);
          mark(57, row + 2, 0x63dcff, 0.28, 3.6, 2, 1.5, 2.3);
        }
        break;
      }
      case 'zig-zag-cascade': { // Attic floorboards, dusty boxes and old CRTs.
        for (let row = 0; row <= BOARD_ROWS; row += 4) line(BOARD.x, tileY(row), BOARD.x + BOARD_COLUMNS * cell, tileY(row), 0xf0cb91, 0.16, 1);
        for (let row = 2; row < BOARD_ROWS; row += 4) {
          for (let col = 3 + (row % 2) * 4; col < BOARD_COLUMNS; col += 8) mark(col, row, 0x35251d, 0.15, 0.8, 0.8, 2.6, 3.1);
        }
        [[3, 27], [58, 24], [3, 53], [58, 64]].forEach(([col, row], i) => {
          graphics.fillStyle(i % 2 ? 0x313744 : 0x8c6240, 0.48).fillRoundedRect(tileX(col!), tileY(row!), cell * 3.3, cell * 2.6, 2);
          graphics.lineStyle(0.8, 0xd7b27a, 0.4).strokeRoundedRect(tileX(col!), tileY(row!), cell * 3.3, cell * 2.6, 2);
          if (i % 2) graphics.fillStyle(0x63dcff, 0.3).fillRect(tileX(col!) + 4, tileY(row!) + 3, cell * 1.8, cell * 1.2);
        });
        break;
      }
      case 'dual-spawn-convergence': { // Cafeteria tablecloths, trays and juice boxes.
        for (let top = 3; top < BOARD_ROWS - 8; top += 14) {
          for (let left = 3; left < BOARD_COLUMNS - 8; left += 13) {
            const centerCol = left + 5;
            const centerRow = top + 5;
            if (!open(centerCol, centerRow)) continue;
            graphics.fillStyle(0xc7e0dc, 0.08).fillRoundedRect(tileX(left), tileY(top), cell * 10, cell * 9, 4);
            graphics.lineStyle(0.8, 0xe7f2df, 0.18).strokeRoundedRect(tileX(left), tileY(top), cell * 10, cell * 9, 4);
            mark(centerCol, centerRow, 0xffd15e, 0.32, 4.2, 2.8, 1.2, 2);
            mark(centerCol + 2, centerRow + 1, 0xff6d9e, 0.32, 2.2, 3.1, 2.2, 1.7);
          }
        }
        break;
      }
      case 'marathon-corridor': { // Mini-golf turf, sand traps and windmill props.
        for (let row = 1; row < BOARD_ROWS; row += 3) {
          for (let col = (row % 2) + 1; col < BOARD_COLUMNS; col += 3) mark(col, row, 0xb8ec91, 0.21, 1.2, 1.2, 2.8, 2.8);
        }
        [[17, 8], [43, 23], [19, 37], [43, 52], [20, 69]].forEach(([col, row], i) => {
          const cx = tileX(col!) + cell * 1.4;
          const cy = tileY(row!) + cell * 1.4;
          graphics.fillStyle(i % 2 ? 0xdcb86a : 0xe9d58b, 0.25).fillCircle(cx, cy, cell * 1.8);
          graphics.lineStyle(1, 0xffefb0, 0.34).strokeCircle(cx, cy, cell * 1.8);
        });
        for (const [col, row] of [[8, 8], [50, 7], [8, 53], [51, 68]] as const) {
          const cx = tileX(col) + cell * 1.5;
          const cy = tileY(row) + cell * 1.5;
          line(cx - 4, cy, cx + 4, cy, 0xfff3ca, 0.32, 1.2);
          line(cx, cy - 4, cx, cy + 4, 0xfff3ca, 0.32, 1.2);
          graphics.fillStyle(0xffd15e, 0.38).fillCircle(cx, cy, 1.2);
        }
        break;
      }
      case 'split-fork': { // Renovation plywood seams, caution tape and tool crates.
        for (let row = 0; row <= BOARD_ROWS; row += 6) line(BOARD.x, tileY(row), BOARD.x + BOARD_COLUMNS * cell, tileY(row), 0xf1c28d, 0.16, 1);
        for (let col = 0; col <= BOARD_COLUMNS; col += 8) line(tileX(col), BOARD.y, tileX(col), BOARD.y + BOARD_ROWS * cell, 0x211d1d, 0.12, 0.7);
        for (let x = 0; x < BOARD_COLUMNS; x += 2) {
          graphics.fillStyle(x % 4 === 0 ? 0xffd15e : 0x202030, 0.36).fillRect(tileX(x), BOARD.y + 1, cell, 1.7);
          graphics.fillStyle(x % 4 === 0 ? 0xffd15e : 0x202030, 0.36).fillRect(tileX(x), BOARD.y + BOARD_ROWS * cell - 2.7, cell, 1.7);
        }
        [[4, 5], [56, 6], [4, 69], [56, 70], [4, 34], [56, 35]].forEach(([col, row], i) => {
          graphics.fillStyle(i % 2 ? 0x637b82 : 0xa56b3d, 0.42).fillRoundedRect(tileX(col!), tileY(row!), cell * 3.1, cell * 2.5, 2);
          graphics.lineStyle(0.8, 0xf1c28d, 0.33).strokeRoundedRect(tileX(col!), tileY(row!), cell * 3.1, cell * 2.5, 2);
        });
        break;
      }
      case 'gauntlet': { // Bowling lane boards, gutter guards and pin markers.
        for (let col = 0; col <= BOARD_COLUMNS; col += 3) line(tileX(col), BOARD.y, tileX(col), BOARD.y + BOARD_ROWS * cell, 0xf3f0ff, 0.1, 0.65);
        for (const col of [29, 35]) {
          line(tileX(col), BOARD.y, tileX(col), BOARD.y + BOARD_ROWS * cell, 0x77e7f0, 0.45, 1.7);
          line(tileX(col) + 1.5, BOARD.y, tileX(col) + 1.5, BOARD.y + BOARD_ROWS * cell, 0x0d2538, 0.35, 0.7);
        }
        for (const col of [28, 36]) {
          graphics.fillStyle(0x63dcff, 0.55).fillCircle(tileX(col) + cell / 2, tileY(73) + cell / 2, 2.1);
          graphics.fillStyle(0xfff5d7, 0.8).fillCircle(tileX(col) + cell / 2, tileY(75) + cell / 2, 1.5);
          graphics.fillStyle(0xff6d9e, 0.65).fillCircle(tileX(col) + cell / 2, tileY(77) + cell / 2, 1.4);
        }
        break;
      }
    }
  }

  private drawPlacementPreview(tile: Tile): void {
    if (!this.hudGraphics) return;
    this.hudGraphics.clear();
    const spec = this.currentTowerSpec;
    const valid = this.isBuildable(tile, spec) && this.coins >= this.placementCost;
    this.hudGraphics.fillStyle(valid ? COLORS.mint : 0xef7e70, 0.72);
    this.hudGraphics.fillRect(BOARD.x + tile.x * BOARD.cell, BOARD.y + tile.y * BOARD.cell, BOARD.cell * spec.footprint, BOARD.cell * spec.footprint);
    const center = this.towerCenter(tile, spec);
    this.hudGraphics.lineStyle(1, valid ? COLORS.mint : 0xef7e70, 0.5).strokeCircle(center.x, center.y, BOARD.cell * spec.range);
  }

  private drawPanels(): void {
    this.add.text(418, 55, 'MAP ZOOM', { fontFamily: 'Arial', fontSize: '13px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 1 });
    const zoomOut = this.add.rectangle(736, 62, 36, 32, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    this.add.text(736, 62, '−', { fontFamily: 'Arial', fontSize: '16px', color: COLORS.cream, fontStyle: 'bold' }).setOrigin(0.5);
    zoomOut.on('pointerdown', () => this.setBoardZoom(this.boardZoom - 0.1));
    this.zoomLabel = this.add.text(786, 62, '70%', { fontFamily: 'Arial', fontSize: '14px', color: COLORS.cream, fontStyle: 'bold' }).setOrigin(0.5);
    const zoomIn = this.add.rectangle(836, 62, 36, 32, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    this.add.text(836, 62, '+', { fontFamily: 'Arial', fontSize: '16px', color: COLORS.cream, fontStyle: 'bold' }).setOrigin(0.5);
    zoomIn.on('pointerdown', () => this.setBoardZoom(this.boardZoom + 0.1));
    const zoomReset = this.add.rectangle(870, 62, 30, 32, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    this.add.text(870, 62, '↺', { fontFamily: 'Arial', fontSize: '15px', color: COLORS.cream, fontStyle: 'bold' }).setOrigin(0.5);
    zoomReset.on('pointerdown', () => {
      this.centerBoardAtDefaultZoom();
      this.zoomLabel?.setText('70%');
    });

    const leftX = 68;
    this.add.text(leftX, 125, 'WAVE', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 2 });
    this.waveLabel = this.add.text(leftX, 147, '1 / 15', { fontFamily: 'Arial', fontSize: '31px', color: COLORS.cream, fontStyle: 'bold' });
    this.add.text(leftX, 203, 'BASE HEALTH', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 2 });
    this.healthLabel = this.add.text(leftX, 225, '100 / 100', { fontFamily: 'Arial', fontSize: '24px', color: '#f6f1df', fontStyle: 'bold' });
    this.add.text(leftX, 272, 'COINS', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 2 });
    this.coinLabel = this.add.text(leftX, 294, '$450', { fontFamily: 'Arial', fontSize: '24px', color: '#f4c86a', fontStyle: 'bold' });

    const mutationRun = !this.mapPreview && ((this.endlessMode && this.endlessModifiersEnabled) || (!this.endlessMode && this.campaignStage === 5));
    if (mutationRun) {
      this.mutationTabButton = this.add.rectangle(18, 430, 32, 132, 0x3c3262).setStrokeStyle(1.5, 0xb98cf5)
        .setDepth(12).setInteractive({ useHandCursor: true });
      this.mutationTabLabel = this.add.text(18, 430, 'MUTATIONS', { fontFamily: 'Arial', fontSize: '11px', color: '#f6f1df', fontStyle: 'bold', letterSpacing: 1 })
        .setOrigin(0.5).setRotation(-Math.PI / 2).setDepth(13).setInteractive({ useHandCursor: true });
      this.mutationTabButton.on('pointerdown', () => this.showActiveModifiers());
      this.mutationTabLabel.on('pointerdown', () => this.showActiveModifiers());
    }

    this.add.text(leftX, 355, 'TOWER DETAILS', { fontFamily: 'Arial', fontSize: '14px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 2 });
    this.selectionLabel = this.add.text(leftX, 381, 'No tower selected', { fontFamily: 'Arial', fontSize: '18px', color: COLORS.cream, fontStyle: 'bold', wordWrap: { width: 280 } });
    this.towerStatsLabel = this.add.text(leftX, 408, 'Choose a tower to see its stats.', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.muted, lineSpacing: 2, wordWrap: { width: 280 } });
    this.add.text(leftX, 485, 'TARGET PRIORITY', { fontFamily: 'Arial', fontSize: '13px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 2 });
    const priority = this.add.rectangle(202, 520, 268, 38, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    this.priorityButtonLabel = this.add.text(202, 520, 'FIRST   ▾', { fontFamily: 'Arial', fontSize: '14px', color: COLORS.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5);
    priority.on('pointerdown', () => {
      const current = this.selectedTower?.priority ?? this.defaultPriority;
      const index = PRIORITIES.indexOf(current);
      const next = PRIORITIES[(index + 1) % PRIORITIES.length]!;
      if (this.selectedTower) this.selectedTower.priority = next;
      else this.defaultPriority = next;
      this.updateHUD();
    });
    priority.on('pointerover', () => priority.setFillStyle(0x2d4b58));
    priority.on('pointerout', () => priority.setFillStyle(COLORS.panelDeep));
    this.add.text(leftX, 550, 'TOWER UPGRADES', { fontFamily: 'Arial', fontSize: '13px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 1 });
    const pathColors = [0x6fc8e8, 0xc58bf0, 0xf4c86a];
    for (let pathIndex = 0; pathIndex < 3; pathIndex += 1) {
      const x = 110 + pathIndex * 98;
      const button = this.add.rectangle(x, 584, 86, 36, 0x182733).setStrokeStyle(1, pathColors[pathIndex]!).setInteractive({ useHandCursor: true });
      const label = this.add.text(x, 584, `PATH ${pathIndex + 1}`, { fontFamily: 'Arial', fontSize: '11px', color: COLORS.cream, fontStyle: 'bold', align: 'center', wordWrap: { width: 80 } }).setOrigin(0.5);
      button.on('pointerdown', () => this.selectUpgrade(pathIndex));
      this.upgradeButtons.push(button);
      this.upgradeLabels.push(label);
    }
    this.upgradeNameButton = this.add.rectangle(208, 632, 278, 38, 0x263b4a).setStrokeStyle(1, 0xf4c86a).setInteractive({ useHandCursor: true });
    this.upgradeNameLabel = this.add.text(208, 632, 'SELECT A TOWER PATH', { fontFamily: 'Arial', fontSize: '11px', color: COLORS.cream, fontStyle: 'bold', align: 'center', wordWrap: { width: 260 } }).setOrigin(0.5);
    this.upgradeNameButton.on('pointerdown', () => this.showUpgradeDetails());
    this.upgradeNameLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.showUpgradeDetails());

    this.inspectorGraphics = this.add.graphics();
    this.bottomBarTitle = this.add.text(425, 656, 'ENEMY INSPECTOR', { fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#63dcff', fontStyle: 'bold', letterSpacing: 1, fixedWidth: 270, maxLines: 1 });
    this.enemyInspectorLabel = this.add.text(420, 676, 'Click an enemy on the board to inspect its stats.', {
      fontFamily: 'Arial', fontSize: '11px', color: COLORS.cream, lineSpacing: 1, wordWrap: { width: 270 },
    });
    this.upgradeDenyButton = this.add.rectangle(738, 678, 72, 34, 0x493044).setStrokeStyle(1, 0xef7e9c).setVisible(false);
    this.upgradeDenyLabel = this.add.text(738, 678, 'DENY', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.cream, fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setVisible(false);
    this.upgradeDenyButton.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.denyUpgrade());
    this.upgradeDenyLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.denyUpgrade());
    this.upgradeConfirmButton = this.add.rectangle(825, 678, 84, 34, 0x354b5d).setStrokeStyle(1, 0xf4c86a).setVisible(false);
    this.upgradeConfirmLabel = this.add.text(825, 678, 'CONFIRM', { fontFamily: 'Arial', fontSize: '11px', color: COLORS.cream, fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setVisible(false);
    this.upgradeConfirmButton.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      if (this.pendingUpgrade) this.buyUpgrade(this.pendingUpgrade.pathIndex);
    });

    const buy = this.add.rectangle(1072, 145, 272, 72, 0x202c46).setStrokeStyle(1, 0x6fc8e8).setInteractive({ useHandCursor: true });
    this.towerButton = buy;
    this.rosterNameLabel = this.add.text(1072, 145, 'OPEN GRID', { fontFamily: 'Arial', fontSize: '16px', color: COLORS.cream, fontStyle: 'bold', align: 'center', letterSpacing: 2 }).setOrigin(0.5);
    buy.on('pointerdown', () => this.setTowerGridOpen(true));
    buy.on('pointerover', () => buy.setFillStyle(0x31466a));
    buy.on('pointerout', () => buy.setFillStyle(0x202c46));

    this.cancelPlacementButton = this.add.rectangle(1072, 218, 272, 34, 0x493044).setStrokeStyle(1, 0xef7e9c).setInteractive({ useHandCursor: true }).setVisible(false);
    this.cancelPlacementLabel = this.add.text(1072, 218, 'CANCEL PLACEMENT', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setVisible(false);
    this.cancelPlacementButton.on('pointerdown', () => this.cancelPlacement());
    this.cancelPlacementLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.cancelPlacement());
    this.deleteTowerButton = this.add.rectangle(1072, 218, 272, 34, 0x493044).setStrokeStyle(1, 0xef7e9c).setInteractive({ useHandCursor: true }).setVisible(false);
    this.deleteTowerLabel = this.add.text(1072, 218, 'SELL TOWER', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setVisible(false);
    this.deleteTowerButton.on('pointerdown', () => this.deleteSelectedTower());
    this.deleteTowerLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.deleteSelectedTower());

    this.createTowerGrid();

    this.add.text(926, 259, 'RUN CONTROL', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 2 });
    const pause = this.add.rectangle(989, 303, 94, 39, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    this.pauseLabel = this.add.text(989, 303, 'PAUSE', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5);
    pause.on('pointerdown', () => { this.paused = !this.paused; this.pauseLabel?.setText(this.paused ? 'RESUME' : 'PAUSE'); this.updateHUD(); });
    const speed = this.add.rectangle(1155, 303, 94, 39, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    this.speedLabel = this.add.text(1155, 303, '1× SPEED', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5);
    speed.on('pointerdown', () => this.toggleFreeSpeed());
    this.speed3Button = this.add.rectangle(989, 347, 126, 28, 0x182733).setStrokeStyle(1, 0xf4c86a).setInteractive({ useHandCursor: true });
    this.speed3Label = this.add.text(989, 347, 'UNLOCK 3× · 30G', { fontFamily: 'Arial', fontSize: '10px', color: COLORS.cream, fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
    this.speed3Button.on('pointerdown', () => this.selectOrUnlockBoostSpeed(3));
    this.speed3Label.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.selectOrUnlockBoostSpeed(3));
    this.speed4Button = this.add.rectangle(1155, 347, 126, 28, 0x182733).setStrokeStyle(1, 0xf4c86a).setInteractive({ useHandCursor: true });
    this.speed4Label = this.add.text(1155, 347, 'UNLOCK 4× · 30G', { fontFamily: 'Arial', fontSize: '10px', color: COLORS.cream, fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
    this.speed4Button.on('pointerdown', () => this.selectOrUnlockBoostSpeed(4));
    this.speed4Label.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.selectOrUnlockBoostSpeed(4));
    this.add.text(926, 369, 'MAP KEY', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 2 });
    this.add.circle(940, 405, 5, COLORS.mint); this.add.text(955, 397, 'Spawn', { fontFamily: 'Arial', fontSize: '13px', color: COLORS.cream });
    this.add.circle(1052, 405, 5, 0xef7e70); this.add.text(1067, 397, 'Base', { fontFamily: 'Arial', fontSize: '13px', color: COLORS.cream });
    this.add.rectangle(1150, 405, 15, 6, COLORS.road); this.add.text(1165, 397, 'Road', { fontFamily: 'Arial', fontSize: '13px', color: COLORS.cream });

    this.skipButton = this.add.rectangle(1072, 454, 272, 38, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    this.skipButtonLabel = this.add.text(1072, 454, 'SKIP WAVE', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5);
    this.skipButton.on('pointerdown', () => this.skipWave());
    this.statusLabel = this.add.text(1072, 485, 'Preparing first wave…', { fontFamily: 'Arial', fontSize: '17px', color: '#a9e7c2', fontStyle: 'bold', align: 'center', wordWrap: { width: 272 } }).setOrigin(0.5, 0);
    this.add.text(1072, 530, 'ENEMIES', { fontFamily: 'Arial', fontSize: '11px', color: COLORS.muted, fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5, 0);
    this.enemyCountLabel = this.add.text(1072, 549, '0 alive · 0 queued', { fontFamily: 'Arial', fontSize: '13px', color: COLORS.cream, align: 'center' }).setOrigin(0.5, 0);
    this.add.text(1072, 576, 'Available after all enemies spawn.\nDisabled while a boss is alive.', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.muted, align: 'center', lineSpacing: 6, wordWrap: { width: 258 } }).setOrigin(0.5, 0);
    this.modifierStatusLabel = this.add.text(1072, 610, '', { fontFamily: 'Arial', fontSize: '11px', color: '#f4c86a', align: 'center', wordWrap: { width: 260 } }).setOrigin(0.5, 0);
    if (this.campaignStage !== 5 && !this.endlessMode || this.mapPreview) this.modifierStatusLabel.setVisible(false);
    this.modifierStatusLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.showActiveModifiers());
    const lobby = this.add.rectangle(1072, 666, 272, 36, 0x182733).setStrokeStyle(1, 0x607c82).setInteractive({ useHandCursor: true });
    this.add.text(1072, 666, 'RETURN TO LOBBY', { fontFamily: 'Arial', fontSize: '14px', color: COLORS.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5);
    lobby.on('pointerdown', () => this.scene.start('Lobby'));
    this.updateHUD();
  }

  private createTowerGrid(): void {
    this.towerGridOverlay = this.add.rectangle(640, 381, 484, 598, 0x0b131d, 0.96)
      .setStrokeStyle(2, 0x6fc8e8).setDepth(30).setInteractive().setVisible(false);
    this.towerGridTitle = this.add.text(640, 105, 'TOWER COLLECTION', { fontFamily: 'Arial', fontSize: '17px', color: '#f6f1df', fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5).setDepth(31).setVisible(false);
    this.towerGridClose = this.add.rectangle(856, 106, 28, 28, 0x493044).setStrokeStyle(1, 0xef7e9c).setDepth(32).setInteractive({ useHandCursor: true }).setVisible(false);
    this.towerGridCloseLabel = this.add.text(856, 106, '×', { fontFamily: 'Arial', fontSize: '20px', color: '#f6f1df', fontStyle: 'bold' }).setOrigin(0.5).setDepth(33).setVisible(false);
    this.towerGridClose.on('pointerdown', () => this.setTowerGridOpen(false));
    this.towerGridCloseLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.setTowerGridOpen(false));
    this.towerGridHint = this.add.text(640, 530, 'Choose an unlocked tower · locked towers show their unlock requirement', {
      fontFamily: 'Arial', fontSize: '10px', color: '#b8c6ff', align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setDepth(34).setVisible(false);

    TOWERS.forEach((spec, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 487 + col * 151;
      const y = 158 + row * 73;
      const button = this.add.rectangle(x, y, 143, 66, 0x263447).setStrokeStyle(1.5, RARITY_COLOR[spec.rarity], 0.9)
        .setDepth(32).setInteractive({ useHandCursor: true }).setVisible(false);
      const icon = this.add.circle(x - 57, y - 14, 9, spec.color).setDepth(33).setVisible(false);
      const title = this.add.text(x + 3, y - 16, spec.name, { fontFamily: 'Arial', fontSize: '11px', color: '#f6f1df', fontStyle: 'bold', align: 'center', wordWrap: { width: 118 } })
        .setOrigin(0.5).setDepth(33).setVisible(false);
      const meta = this.add.text(x, y + 15, `$${spec.cost}  ·  ${spec.rarity.toUpperCase()}  ·  ${spec.footprint}×${spec.footprint}`, {
        fontFamily: 'Arial', fontSize: '10px', color: `#${RARITY_COLOR[spec.rarity].toString(16).padStart(6, '0')}`, fontStyle: 'bold', align: 'center',
      }).setOrigin(0.5).setDepth(33).setVisible(false);
      const lock = this.add.graphics().setDepth(34).setVisible(false);
      const lockText = this.add.text(x, y + 1, 'LOCKED', { fontFamily: 'Arial', fontSize: '10px', color: '#fff1f4', fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(35).setVisible(false);
      button.on('pointerover', () => button.setFillStyle(0x3c4d67));
      button.on('pointerout', () => button.setFillStyle(0x263447));
      button.on('pointerdown', () => {
        const unlock = this.towerUnlockState(spec);
        if (!unlock.unlocked) {
          this.towerGridHint?.setText(`🔒 ${spec.name}: ${unlock.requirement}`);
          return;
        }
        this.mysteryPlacing = false;
        this.rosterIndex = index;
        this.setTowerGridOpen(false);
        this.startPlacingTower();
      });
      this.towerGridCards.push({ button, icon, title, meta, lock, lockText });
    });

    this.mysteryBoxButton = this.add.rectangle(789, 450, 143, 66, 0x44375c).setStrokeStyle(1.5, 0xf4c86a, 0.95)
      .setDepth(32).setInteractive({ useHandCursor: true }).setVisible(false);
    this.mysteryBoxTitle = this.add.text(789, 438, 'MYSTERY BOX', { fontFamily: 'Arial', fontSize: '10px', color: '#f6f1df', fontStyle: 'bold', align: 'center' })
      .setOrigin(0.5).setDepth(33).setVisible(false);
    this.mysteryBoxMeta = this.add.text(789, 460, 'FREE · REVEALS ON PLACEMENT', { fontFamily: 'Arial', fontSize: '7px', color: '#f4c86a', fontStyle: 'bold', align: 'center', wordWrap: { width: 130 } })
      .setOrigin(0.5).setDepth(33).setVisible(false);
    this.mysteryBoxButton.on('pointerdown', () => this.selectMysteryTower());
  }

  private selectMysteryTower(): void {
    const mysteryOnlyRun = this.isMysteryOnlyRun();
    const freeFirstMysteryBox = mysteryOnlyRun && !this.mysteryBoxUsed;
    if (!mysteryOnlyRun) return;
    if (!this.mysteryTowerOffer) {
      if (freeFirstMysteryBox && !this.endlessMode) {
        const eligible = TOWERS.filter((tower) => (tower.rarity === 'Common' || tower.rarity === 'Rare') && tower.attackType !== 'supportLaser');
        this.mysteryTowerOffer = eligible[Math.floor(Math.random() * eligible.length)]!;
        this.mysteryTowerCost = 0;
      } else {
        const roll = () => 1 + Math.floor(Math.random() * 100);
        const rarity = roll() <= 5 ? 'Legendary' : roll() <= 16 ? 'Epic' : roll() <= 31 ? 'Rare' : 'Common';
        const pool = TOWERS.filter((tower) => tower.rarity === rarity);
        this.mysteryTowerOffer = pool[Math.floor(Math.random() * pool.length)]!;
        this.mysteryTowerCost = freeFirstMysteryBox ? 0 : rarity === 'Common' ? 400 : rarity === 'Rare' ? 900 : rarity === 'Epic' ? 2000 : 3100;
      }
      if (!freeFirstMysteryBox) {
        const rarity = this.mysteryTowerOffer.rarity.toUpperCase();
        this.mysteryBoxTitle?.setText(`${rarity} MYSTERY`);
        this.mysteryBoxMeta?.setText(`REVEALED · $${this.mysteryTowerCost} · CLICK TO BUY`);
        this.towerGridHint?.setText('Rarity and price revealed · tower identity stays hidden until placement');
        this.gridFeedback = `${rarity} MYSTERY TOWER · $${this.mysteryTowerCost} · CLICK AGAIN TO BUY`;
        this.updateHUD();
        return;
      }
    }
    if (this.coins < this.mysteryTowerCost) { this.gridFeedback = `NOT ENOUGH COINS · $${this.mysteryTowerCost} NEEDED`; this.updateHUD(); return; }
    this.coins -= this.mysteryTowerCost;
    this.run.coins = this.coins;
    this.mysteryTowerRefund = this.mysteryTowerCost > 0;
    this.mysteryTowerMode = true;
    this.rosterIndex = TOWERS.findIndex((tower) => tower.id === this.mysteryTowerOffer!.id);
    this.mysteryPlacing = true;
    this.setTowerGridOpen(false);
    this.startPlacingTower();
    this.gridFeedback = `PLACE ${this.mysteryTowerOffer.rarity.toUpperCase()} MYSTERY TOWER · $${this.mysteryTowerCost} PAID`;
    this.updateHUD();
  }

  private towerUnlockState(spec: TowerSpec): { unlocked: boolean; requirement: string } {
    if (towerUnlocked(this.registry, spec.id)) return { unlocked: true, requirement: 'Unlocked' };
    const campaign: Record<string, string> = {
      lawnDartGnome: 'Clear Star 1 · Stage 1', unstableToasterLauncher: 'Clear Star 1 · Stage 3',
      waterBalloonSlingshot: 'Clear Star 1 · Stage 4', stickyBubblegumDispenser: 'Clear Star 1 · Stage 5',
      hotSauceSprinkler: 'Clear Star 2 · Stage 2', leafBlowerGuy: 'Clear Star 2 · Stage 3',
      squeakyRubberDuckCannon: 'Clear Star 2 · Stage 5', freezeRayIceCreamTruck: 'Clear Star 3 · Stage 2',
      giantMechTeddyBear: 'Clear Star 3 · Stage 5', anvilTrapdoor: 'Reach Player Level 2',
      discoTurret: 'Reach Player Level 5', catLaserPointer: 'Reach Player Level 10', cosmicRoomba: 'Reach Player Level 15',
    };
    return { unlocked: false, requirement: campaign[spec.id] ?? 'Progression unlock' };
  }

  private isMysteryOnlyRun(): boolean {
    return !this.mapPreview && (
      (this.endlessMode && this.endlessMysteryEnabled)
      || (!this.endlessMode && this.campaignStage === 4)
    );
  }

  private setTowerGridOpen(open: boolean): void {
    this.towerGridOverlay?.setVisible(open);
    this.towerGridTitle?.setVisible(open);
    this.towerGridClose?.setVisible(open);
    this.towerGridCloseLabel?.setVisible(open);
    this.towerGridHint?.setVisible(open);
    const showMystery = open && this.isMysteryOnlyRun();
    this.mysteryBoxButton?.setVisible(showMystery);
    this.mysteryBoxTitle?.setVisible(showMystery);
    this.mysteryBoxMeta?.setVisible(showMystery);
    this.mysteryBoxTitle?.setText(this.mysteryTowerOffer ? `${this.mysteryTowerOffer.rarity.toUpperCase()} MYSTERY` : 'MYSTERY TOWER');
    const stageFourFreeAvailable = !this.endlessMode && this.campaignStage === 4 && !this.mysteryBoxUsed;
    this.mysteryBoxMeta?.setText(this.mysteryTowerOffer ? `${this.mysteryTowerCost ? `$${this.mysteryTowerCost} · ` : 'FREE · '}CLICK TO ${this.mysteryTowerCost ? 'BUY' : 'PLACE'}` : stageFourFreeAvailable ? 'FREE · LOW/MID ATTACK TOWER' : 'REVEALS RARITY · CLICK');
    this.mysteryBoxButton?.setInteractive({ useHandCursor: true }).setAlpha(1);
    const mysteryOnly = this.isMysteryOnlyRun();
    for (const [index, card] of this.towerGridCards.entries()) {
      const spec = TOWERS[index]!;
      const locked = !this.towerUnlockState(spec).unlocked;
      card.button.setVisible(open && !mysteryOnly);
      card.icon.setVisible(open && !mysteryOnly);
      card.title.setVisible(open && !mysteryOnly);
      card.meta.setVisible(open && !mysteryOnly);
      card.lock.setVisible(open && !mysteryOnly && locked);
      card.lockText.setVisible(open && !mysteryOnly && locked);
      card.lock.clear();
      if (open && locked) {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = 487 + col * 151;
        const y = 158 + row * 73;
        card.lock.fillStyle(0x101820, 0.68).fillRoundedRect(x - 71, y - 33, 142, 65, 8);
        card.lock.lineStyle(2, 0xef7e9c, 0.95).strokeRoundedRect(x - 71, y - 33, 142, 65, 8);
        card.lock.lineStyle(2.4, 0xfff1f4, 1).strokeCircle(x, y - 3, 7);
        card.lock.fillStyle(0xfff1f4, 1).fillRoundedRect(x - 8, y - 3, 16, 13, 2);
      }
    }
    if (open) this.towerGridHint?.setText(mysteryOnly ? 'Mystery mode · only the mystery tower is available. Cancel before placement for a full refund.' : 'Choose an unlocked tower · locked towers show their unlock requirement');
    this.updateHUD();
  }

  private step(dt: number): void {
    this.simTime += dt;
    this.stepRandomTowerSwap(dt);
    this.skipCooldown = Math.max(0, this.skipCooldown - dt);
    this.stepPendingImpacts();
    if (this.phase === 'countdown') {
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.phase = 'wave';
        this.run.phase = 'active';
        this.spawnNextEnemy();
      }
    } else if (this.phase === 'wave') {
      this.stepSpawning(dt);
      this.stepEnemies(dt);
      this.stepTowers(dt);
      this.run.baseHealth = this.baseHealth;
      this.run.coins = this.coins;
      if (this.baseHealth <= 0) this.endRun(false);
      else if (!this.hasPendingSpawns() && !this.hasLivingEnemies()) this.completeWave();
    } else if (this.phase === 'between-waves') {
      this.betweenWaveTimer -= dt;
      if (this.betweenWaveTimer <= 0) this.beginWave(this.wave + 1);
    }
  }

  private stepRandomTowerSwap(dt: number): void {
    if (!this.mutationStack('randomTowerSwap') || this.phase === 'defeat' || this.phase === 'victory') return;
    this.randomSwapTimer -= dt;
    if (this.randomSwapTimer > 0) return;
    this.randomSwapTimer += 30;
    const validAt = (tower: PlacedTower, tile: Tile, pair: PlacedTower[]) => {
      for (let dx = 0; dx < tower.spec.footprint; dx += 1) for (let dy = 0; dy < tower.spec.footprint; dy += 1) {
        const cell = { x: tile.x + dx, y: tile.y + dy };
        const key = routeKey(cell);
        if (cell.x < 0 || cell.x >= BOARD_COLUMNS || cell.y < 0 || cell.y >= BOARD_ROWS || this.roadTiles.has(key) || this.obstacleTiles.has(key)) return false;
        const occupant = this.towerObjects.get(key);
        if (occupant && !pair.includes(occupant)) return false;
      }
      return true;
    };
    const pairs: Array<[PlacedTower, PlacedTower]> = [];
    for (let i = 0; i < this.towers.length; i += 1) for (let j = i + 1; j < this.towers.length; j += 1) {
      const a = this.towers[i]!; const b = this.towers[j]!;
      if (validAt(a, b.tile, [a, b]) && validAt(b, a.tile, [a, b])) pairs.push([a, b]);
    }
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    if (!pair) return;
    const [a, b] = pair; const tileA = a.tile; const tileB = b.tile;
    for (const tower of pair) for (let x = 0; x < tower.spec.footprint; x += 1) for (let y = 0; y < tower.spec.footprint; y += 1) this.towerObjects.delete(routeKey({ x: tower.tile.x + x, y: tower.tile.y + y }));
    a.tile = tileB; b.tile = tileA;
    for (const tower of pair) {
      for (let x = 0; x < tower.spec.footprint; x += 1) for (let y = 0; y < tower.spec.footprint; y += 1) this.towerObjects.set(routeKey({ x: tower.tile.x + x, y: tower.tile.y + y }), tower);
      const center = this.towerCenter(tower.tile, tower.spec);
      tower.sprite.setPosition(center.x, center.y); tower.art.setPosition(center.x, center.y); tower.label.setPosition(center.x, center.y);
    }
    this.gridFeedback = 'MYSTERY SWAP · TWO TOWERS CHANGED PLACES';
  }

  private beginWave(number: number): void {
    this.wave = number;
    this.waveSpawnIndex = 0;
    this.run.wave = number;
    this.waveGroups = number <= STAGE_ONE_WAVES.length ? STAGE_ONE_WAVES[number - 1]! : generateEndlessWave(number);
    this.groupIndex = 0;
    this.groupRemaining = 0;
    this.groupDelayStarted = false;
    this.spawnTimer = 0;
    this.countdown = number === 1 ? 3 : 0;
    this.phase = 'countdown';
    this.run.phase = 'preparation';
    this.run.baseHealth = this.baseHealth;
    this.run.coins = this.coins;
    this.gridFeedback = '';
    this.waveTotalHp = this.enemies.reduce((total, enemy) => total + (enemy.alive ? enemy.hp : 0), 0);
    this.waveEnemyCount = this.enemies.filter((enemy) => enemy.alive).length;
    this.waveDamageByTower.clear();
    this.waveBuffTargets.clear();
    this.waveDebuffTargets.clear();
    const endlessModifierWave = this.endlessMode && this.endlessModifiersEnabled && number >= 5 && number % 5 === 0 && number % 20 !== 0;
    const stageFiveModifierWave = !this.endlessMode && !this.mapPreview && this.campaignStage === 5 && [5, 10, 15].includes(number);
    if (endlessModifierWave || stageFiveModifierWave) this.showModifierChoice();
  }

  private stepSpawning(dt: number): void {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    if (this.groupRemaining <= 0) {
      if (this.groupIndex >= this.waveGroups.length) return;
      if (this.groupIndex > 0 && !this.groupDelayStarted) {
        const prev = this.waveGroups[this.groupIndex - 1]!;
        const next = this.waveGroups[this.groupIndex]!;
        const prevSpec = ENEMIES[prev.enemy]!;
        const nextSpec = ENEMIES[next.enemy]!;
        this.spawnTimer = prevSpec.miniboss || nextSpec.miniboss
          ? 5
          : Math.max(this.spawnDelayFor(prevSpec), this.spawnDelayFor(nextSpec));
        this.groupDelayStarted = true;
        return;
      }
      this.groupDelayStarted = false;
      this.groupRemaining = this.waveGroups[this.groupIndex]!.count;
      this.groupIndex += 1;
    }
    this.spawnNextEnemy();
  }

  private spawnNextEnemy(): void {
    if (this.groupRemaining <= 0) {
      if (this.groupIndex >= this.waveGroups.length) return;
      this.groupRemaining = this.waveGroups[this.groupIndex]!.count;
      this.groupIndex += 1;
    }
    const group = this.waveGroups[this.groupIndex - 1]!;
    this.createEnemy(group.enemy, 0);
    this.groupRemaining -= 1;
    const spec = ENEMIES[group.enemy]!;
    this.spawnTimer = this.groupRemaining > 0 ? Math.max(spec.miniboss ? 5 : 0, this.spawnDelayFor(spec)) : 0;
  }

  private createEnemy(enemyKey: EnemyKey, pathProgress: number, inheritedRoute?: Tile[]): ActiveEnemy {
    const baseSpec = ENEMIES[enemyKey]!;
    const endlessThreat = endlessThreatForEnemy(enemyKey);
    const spec = this.endlessMode && this.wave > 15
      ? { ...baseSpec, hp: Math.floor(baseSpec.hp * endlessHpMultiplier(this.wave)), leak: endlessLeakDamage(baseSpec.leak, this.wave, endlessThreat) }
      : baseSpec;
    const titanMultiplier = this.mutationStack('titanBlood') > 0 ? 1.5 : 1;
    const hp = Math.floor(starScaledHp(spec.hp, this.star) * titanMultiplier);
    const route = inheritedRoute ?? this.routeForNextEnemy();
    const start = this.positionOnRoute(pathProgress, route);
    // Phaser's circle API takes a radius. The old scale used almost one whole
    // tile as the radius, so each enemy occupied nearly two tiles and crowded
    // out its neighbors on the newly widened roads.
    const size = (spec.boss ? 11 : spec.miniboss ? 9 : hp > 500 ? 8 : hp > 250 ? 7.5 : 6.2) * BOARD.cell / 13.6;
    const sprite = this.addToBoard(this.add.circle(start.x, start.y, size, spec.color, 1).setStrokeStyle(2, 0x101820, 1).setDepth(4));
    const art = this.drawEnemyDesign(spec, size);
    art.setPosition(start.x, start.y);
    const hpBar = this.addToBoard(this.add.rectangle(start.x, start.y - size - 2.5, size * 2, 2.4, spec.boss ? 0xff6b78 : spec.miniboss ? 0xf4c86a : 0x7ce0a0).setOrigin(0.5).setDepth(4));
    const marker = spec.boss ? 'B' : spec.miniboss ? 'M' : spec.shortName.slice(0, 1).toUpperCase();
    const labelSize = (spec.boss ? 10 : spec.miniboss ? 9 : 7) * BOARD.cell / 13.6;
    const label = this.addToBoard(this.add.text(start.x, start.y, marker, { fontFamily: 'Arial', fontSize: `${labelSize}px`, color: '#101820', fontStyle: 'bold' }).setOrigin(0.5).setDepth(5));
    label.setVisible(false);
    const enemy: ActiveEnemy = {
      id: this.nextEnemyId++, spec, pathProgress, route, hp, maxHp: hp, waveNumber: this.wave, endlessThreat, sprite, art, hpBar, label, alive: true,
      slowUntil: 0, slowAmount: 0, reverseMomentumUntil: 0, burnUntil: 0, burnDps: 0, burnTick: 0, stunUntil: 0,
      freezeUntil: 0, unfreezeSlowPending: false, wetUntil: 0,
      ccImmuneUntil: 0, speedBoostUntil: 0, suctionUntil: 0,
      abilityTimer: this.simTime + (spec.ability === 'cosmicVacuum' ? 8 : spec.ability === 'lawnMower' ? 5 : Number.POSITIVE_INFINITY), abilitySlowUntil: 0, abilitySlowAmount: 0,
      triggeredThresholds: new Set(), armorShred: 0, guanoSlipUntil: 0, guanoSlipCooldownUntil: 0, guanoSlipFloor: 0,
      guanoPoisonUntil: 0, guanoPoisonTick: 0, guanoPoisonStacks: 0,
      hyperarmorShred: 0, damageTakenMultiplier: 1, damageTakenUntil: 0, physicalDamageTakenMultiplier: 1, physicalDamageTakenUntil: 0,
    };
    this.enemies.push(enemy);
    this.waveTotalHp += hp;
    this.waveEnemyCount += 1;
    this.positionEnemy(enemy);
    return enemy;
  }

  private routeForNextEnemy(): Tile[] {
    const index = this.waveSpawnIndex++;
    if (this.mapId === 'dual-spawn-convergence') return createMapRoute(this.mapId, index % 2 === 0 ? 'main' : 'right');
    if (this.mapId === 'split-fork') {
      const evenWaveTakesLeft = this.wave % 2 === 0;
      const evenIndexTakesLeft = index % 2 === 0;
      return createMapRoute(this.mapId, evenWaveTakesLeft === evenIndexTakesLeft ? 'left' : 'right');
    }
    return this.route;
  }

  private spawnDelayFor(spec: EnemySpec): number {
    return (0.3 + 0.6 / spec.speed) / this.enemySpawnRateMultiplier();
  }

  private stepEnemies(dt: number): void {
    this.stepSoapPuddles();
    this.stepGuanoPuddles();
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      this.stepEnemyAbility(enemy, dt);
      if (this.simTime <= enemy.burnUntil && enemy.burnDps > 0) {
        enemy.burnTick += dt;
        while (enemy.burnTick >= 1) {
          enemy.burnTick -= 1;
          this.damageEnemy(enemy, undefined, enemy.burnDps, false, false, enemy.burnSource);
          if (!enemy.alive) break;
        }
      }
      if (enemy.alive && this.simTime < enemy.guanoPoisonUntil && enemy.guanoPoisonStacks > 0) {
        enemy.guanoPoisonTick += dt;
        while (enemy.guanoPoisonTick >= 1) {
          enemy.guanoPoisonTick -= 1;
          this.damageEnemy(enemy, undefined, 10 * enemy.guanoPoisonStacks);
          if (!enemy.alive) break;
        }
      } else if (this.simTime >= enemy.guanoPoisonUntil) {
        enemy.guanoPoisonStacks = 0;
        enemy.guanoPoisonTick = 0;
      }
      if (enemy.unfreezeSlowPending && this.simTime >= Math.max(enemy.freezeUntil, enemy.stunUntil)) {
        enemy.unfreezeSlowPending = false;
        enemy.freezeUntil = 0;
        this.applySlow(enemy, 0.5, 4, enemy.unfreezeSlowSource);
        enemy.unfreezeSlowSource = undefined;
      } else if (this.simTime >= enemy.freezeUntil) enemy.freezeUntil = 0;
      if (!enemy.alive || this.simTime < enemy.stunUntil) continue;
      const slowActive = this.simTime < enemy.slowUntil;
      if (!slowActive && enemy.slowAmount > 0) {
        if (this.mutationStack('reverseMomentum') > 0 && enemy.slowSource) enemy.reverseMomentumUntil = Math.max(enemy.reverseMomentumUntil, this.simTime + 1);
        enemy.slowAmount = 0;
        enemy.slowSource = undefined;
      }
      const slow = slowActive ? enemy.slowAmount : 0;
      const speedBoost = (this.simTime < enemy.speedBoostUntil ? 0.5 : 0) + (this.simTime < enemy.reverseMomentumUntil ? 0.1 : 0);
      const movement = enemy.spec.speed * (1 - slow) * (1 + speedBoost) * dt;
      if (this.simTime < enemy.guanoSlipUntil) {
        // Guano can make an enemy stumble backward briefly, but the stumble is
        // bounded so a puddle near the route entrance can never trap it there.
        enemy.pathProgress = Math.max(enemy.guanoSlipFloor, enemy.pathProgress - movement);
      } else {
        enemy.pathProgress += movement;
      }
      enemy.pathProgress = Math.max(0, enemy.pathProgress);
      if (enemy.pathProgress >= enemy.route.length) {
      const leakMultiplier = (this.mutationStack('breachCrisis') > 0 ? 2 : 1) * (this.mutationStack('glassCannons') > 0 ? 2 : 1);
      this.baseHealth = Math.max(0, this.baseHealth - Math.floor(starScaledLeak(enemy.spec.leak, this.star) * leakMultiplier));
      if (this.mutationStack('sharedMisery')) this.towerStunUntil = Math.max(this.towerStunUntil, this.simTime + 2);
        this.removeEnemy(enemy);
      } else this.positionEnemy(enemy);
    }
  }

  private stepEnemyAbility(enemy: ActiveEnemy, dt: number): void {
    const ability = enemy.spec.ability;
    if (this.simTime < enemy.abilitySlowUntil) enemy.abilityTimer += dt * enemy.abilitySlowAmount;
    if (!ability || this.simTime < enemy.abilityTimer) return;
    if (ability === 'lawnMower') {
      this.disableTowersAround(enemy.sprite.x, enemy.sprite.y, 4, 3);
      enemy.abilityTimer += 5;
    } else if (ability === 'cosmicVacuum') {
      this.disableTowersAround(enemy.sprite.x, enemy.sprite.y, 6, 2.5);
      enemy.suctionUntil = this.simTime + 0.095;
      for (const impact of this.pendingImpacts) {
        const target = this.enemies.find((candidate) => candidate.id === impact.enemyId && candidate.alive);
        if (target && Phaser.Math.Distance.Between(target.sprite.x, target.sprite.y, enemy.sprite.x, enemy.sprite.y) <= 6 * BOARD.cell) impact.enemyId = enemy.id;
      }
      enemy.abilityTimer += 8;
    }
  }

  private stepPendingImpacts(): void {
    for (let index = this.pendingImpacts.length - 1; index >= 0; index -= 1) {
      const impact = this.pendingImpacts[index]!;
      if (this.simTime < impact.dueAt) continue;
      this.pendingImpacts.splice(index, 1);
      const target = this.enemies.find((enemy) => enemy.id === impact.enemyId && enemy.alive);
      if (target) this.damageEnemy(target, impact.tower, impact.damage, impact.singleTargetHit, true);
    }
  }

  private projectileSlowedByTape(tower: PlacedTower, target: ActiveEnemy): boolean {
    if (!PHYSICAL_PROJECTILE_TOWER_IDS.has(tower.spec.id)) return false;
    const origin = this.towerCenter(tower.tile, tower.spec);
    const dx = target.sprite.x - origin.x;
    const dy = target.sprite.y - origin.y;
    const lengthSq = dx * dx + dy * dy;
    return this.enemies.some((enemy) => {
      if (!enemy.alive || enemy.spec.ability !== 'tapeRoller') return false;
      const amount = lengthSq === 0 ? 0 : Phaser.Math.Clamp(((enemy.sprite.x - origin.x) * dx + (enemy.sprite.y - origin.y) * dy) / lengthSq, 0, 1);
      const nearX = origin.x + amount * dx;
      const nearY = origin.y + amount * dy;
      return Phaser.Math.Distance.Between(nearX, nearY, enemy.sprite.x, enemy.sprite.y) <= 2.5 * BOARD.cell;
    });
  }

  private processEnemyThresholds(enemy: ActiveEnemy): void {
    const ability = enemy.spec.ability;
    const thresholds = ability === 'overlordFridge' ? [90, 80, 70, 60, 50, 40, 30, 20, 10]
      : ability === 'piggyBank' ? [80, 60, 40, 20] : [];
    for (const threshold of thresholds) {
      if (enemy.triggeredThresholds.has(threshold) || enemy.hp > enemy.maxHp * threshold / 100) continue;
      enemy.triggeredThresholds.add(threshold);
      if (ability === 'overlordFridge') this.freezeTowersAhead(enemy, 4);
      else this.disableTowersAround(enemy.sprite.x, enemy.sprite.y, 2.5, 3);
    }
  }

  private triggerEnemyDefeatAbility(enemy: ActiveEnemy): void {
    const ability = enemy.spec.ability;
    if (ability === 'piñata') this.disableTowersAround(enemy.sprite.x, enemy.sprite.y, 3, 3);
    if (ability === 'nestingDoll') {
      for (let i = 0; i < 5; i += 1) this.createEnemy('sock', enemy.pathProgress, enemy.route);
    }
    if (ability === 'teeth') {
      // Hot-sauce patches are represented by active burn effects in this prototype.
      for (const nearby of this.enemies) {
        if (nearby.alive && Phaser.Math.Distance.Between(nearby.sprite.x, nearby.sprite.y, enemy.sprite.x, enemy.sprite.y) <= 2 * BOARD.cell) {
          nearby.burnDps = 0;
          nearby.burnUntil = 0;
          nearby.slowAmount = 0;
          nearby.slowUntil = 0;
        }
      }
    }
    if (ability === 'alarm') {
      for (const nearby of this.enemies) {
        if (!nearby.alive || Phaser.Math.Distance.Between(nearby.sprite.x, nearby.sprite.y, enemy.sprite.x, enemy.sprite.y) > 4 * BOARD.cell) continue;
        nearby.slowUntil = 0;
        nearby.slowAmount = 0;
        nearby.stunUntil = 0;
        nearby.ccImmuneUntil = Math.max(nearby.ccImmuneUntil, this.simTime + 2);
      }
    }
  }

  private disableTowersAround(x: number, y: number, radiusTiles: number, seconds: number): PlacedTower[] {
    const radiusPx = radiusTiles * BOARD.cell;
    const affected: PlacedTower[] = [];
    for (const tower of this.towers) {
      const center = this.towerCenter(tower.tile, tower.spec);
      if (Phaser.Math.Distance.Between(x, y, center.x, center.y) <= radiusPx) {
        tower.disabledUntil = Math.max(tower.disabledUntil, this.simTime + seconds);
        tower.stunHitUntil = Math.max(tower.stunHitUntil, this.simTime + 1.1);
        affected.push(tower);
      }
    }
    this.showTowerStunWave(x, y, radiusTiles);
    return affected;
  }

  private showTowerStunWave(x: number, y: number, radiusTiles: number): void {
    const ring = this.addToBoard(this.add.circle(x, y, 1, 0xff6d9e, 0.1).setStrokeStyle(2.5, 0xff6d9e, 0.95).setDepth(7));
    this.tweens.add({
      targets: ring, radius: radiusTiles * BOARD.cell, alpha: 0, duration: 550, ease: 'Sine.Out',
      onComplete: () => ring.destroy(),
    });
  }

  private freezeTowersAhead(enemy: ActiveEnemy, seconds: number): void {
    const index = Math.min(Math.floor(enemy.pathProgress), enemy.route.length - 2);
    const here = enemy.route[index]!;
    const next = enemy.route[index + 1]!;
    const fx = next.x - here.x;
    const fy = next.y - here.y;
    const originX = (enemy.sprite.x - BOARD.x) / BOARD.cell;
    const originY = (enemy.sprite.y - BOARD.y) / BOARD.cell;
    for (const tower of this.towers) {
      const center = this.towerCenter(tower.tile, tower.spec);
      const dx = (center.x - BOARD.x) / BOARD.cell - originX;
      const dy = (center.y - BOARD.y) / BOARD.cell - originY;
      const ahead = dx * fx + dy * fy;
      const lateral = Math.abs(dx * -fy + dy * fx);
      if (ahead > 0 && ahead <= 4 && lateral <= 1.5) {
        tower.disabledUntil = Math.max(tower.disabledUntil, this.simTime + seconds);
        tower.stunHitUntil = Math.max(tower.stunHitUntil, this.simTime + 1.1);
      }
    }
  }

  private spawnSoapPuddle(progress: number, route: Tile[]): void {
    const at = this.positionOnRoute(progress, route);
    const sprite = this.addToBoard(this.add.rectangle(at.x, at.y, BOARD.cell * 2, BOARD.cell * 2, 0x7ceaf4, 0.6)
      .setStrokeStyle(1, 0xf3ffff, 0.9).setDepth(3));
    this.soapPuddles.push({ x: at.x, y: at.y, expiresAt: this.simTime + 3, sprite });
  }

  private stepSoapPuddles(): void {
    for (let index = this.soapPuddles.length - 1; index >= 0; index -= 1) {
      const puddle = this.soapPuddles[index]!;
      if (this.simTime >= puddle.expiresAt) {
        puddle.sprite.destroy();
        this.soapPuddles.splice(index, 1);
        continue;
      }
      for (const enemy of this.enemies) {
        if (enemy.alive && Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, puddle.x, puddle.y) <= 2.5 * BOARD.cell) {
          enemy.speedBoostUntil = Math.max(enemy.speedBoostUntil, this.simTime + 2);
        }
      }
    }
  }

  /** Guano tiers create visible track hazards which shred armor and carry their later effects. */
  private stepPigeonGuano(tower: PlacedTower, dt: number): void {
    tower.guanoDropTimer -= dt;
    const ultimate = tower.ranks[2]! >= 7;
    const interval = ultimate ? 1.25 : 6;
    if (tower.guanoDropTimer > 0) return;
    tower.guanoDropTimer = interval;
    const range = tower.spec.range * tower.rangeMultiplier * this.globalRangeMultiplier();
    const center = this.towerGridCenter(tower);
    const target = this.chooseTarget(this.enemies.filter((enemy) => enemy.alive
      && this.distanceToPathTiles(center, enemy.pathProgress, enemy.route) <= range), tower.priority);
    if (!target) return;
    // Drop at the target's current position so a puddle cannot be laid beyond
    // the Pigeon's range simply because the enemy is near the range boundary.
    const progress = Math.min(target.route.length - 0.1, target.pathProgress);
    if (this.distanceToPathTiles(center, progress, target.route) > range) return;
    const at = this.positionOnRoute(progress, target.route);
    const puddle = this.addToBoard(this.add.circle(at.x, at.y, (ultimate ? 2.4 : 1.55) * BOARD.cell, ultimate ? 0x9de64d : 0x9acb45, 0.74)
      .setStrokeStyle(2, 0xefff9b, 0.95).setDepth(3));
    this.guanoPuddles.push({ progress, route: target.route, expiresAt: this.simTime + (ultimate ? 4 : 7), sprite: puddle, tower });
  }

  private stepGuanoPuddles(): void {
    for (let index = this.guanoPuddles.length - 1; index >= 0; index -= 1) {
      const puddle = this.guanoPuddles[index]!;
      if (this.simTime >= puddle.expiresAt) {
        puddle.sprite.destroy();
        this.guanoPuddles.splice(index, 1);
        continue;
      }
      for (const enemy of this.enemies) {
        const source = puddle.tower;
        const range = source.spec.range * source.rangeMultiplier * this.globalRangeMultiplier();
        if (!enemy.alive || enemy.route !== puddle.route || Math.abs(enemy.pathProgress - puddle.progress) > 1.1
          || this.distanceToPathTiles(this.towerGridCenter(source), enemy.pathProgress, enemy.route) > range) continue;
        if (source.disabledUntil > this.simTime) continue;
        const rank = source.ranks[2]!;
        enemy.armorShred = Math.max(enemy.armorShred, rank >= 7 ? 1 : rank >= 5 ? 0.5 : 0.25);
        if (rank >= 4 && this.simTime >= enemy.guanoSlipCooldownUntil) {
          // Trigger once per enemy, rather than renewing the reverse timer on
          // every frame spent inside this puddle.
          enemy.guanoSlipFloor = Math.max(0, enemy.pathProgress - 0.75);
          enemy.guanoSlipUntil = this.simTime + 0.8;
          enemy.guanoSlipCooldownUntil = this.simTime + 5;
        }
        if (rank >= 6) {
          enemy.guanoPoisonStacks = Math.min(3, enemy.guanoPoisonStacks + 1);
          enemy.guanoPoisonUntil = Math.max(enemy.guanoPoisonUntil, this.simTime + 3);
        }
      }
    }
  }

  private stepPigeonHelpers(dt: number): void {
    for (const tower of this.towers) {
      if (tower.spec.id !== 'angryPigeon') continue;
      const flockRank = tower.ranks[1]!;
      tower.armadaCooldown = Math.max(0, tower.armadaCooldown - dt);
      if (flockRank >= 7 && tower.armadaCooldown <= 0 && tower.armadaRemaining <= 0) {
        tower.armadaCooldown = 85;
        tower.armadaRemaining = 6;
        tower.armadaPulseTimer = 0;
      }
      if (tower.armadaRemaining > 0) {
        tower.armadaRemaining = Math.max(0, tower.armadaRemaining - dt);
        tower.armadaPulseTimer -= dt;
        while (tower.armadaPulseTimer <= 0 && tower.armadaRemaining > 0) {
          for (const enemy of this.enemies) if (enemy.alive) this.damageEnemy(enemy, tower, 60 * tower.damageMultiplier, true);
          tower.armadaPulseTimer += 1;
        }
      }
      const desired = flockRank >= 5 ? 4 : flockRank >= 3 ? 2 : 0;
      while (tower.helperPigeons.length < desired) {
        const bird = this.addToBoard(this.add.circle(0, 0, 3.2, 0xfff3c6, 1).setStrokeStyle(1.5, 0x6e522c, 1).setDepth(5));
        tower.helperPigeons.push(bird);
        tower.helperPigeonCooldowns.push(Math.random() * 0.4);
      }
      while (tower.helperPigeons.length > desired) {
        tower.helperPigeons.pop()?.destroy();
        tower.helperPigeonCooldowns.pop();
      }
      const center = this.towerCenter(tower.tile, tower.spec);
      for (let index = 0; index < tower.helperPigeons.length; index += 1) {
        const bird = tower.helperPigeons[index]!;
        const phase = this.simTime * 3 + index * Math.PI;
        bird.setPosition(center.x + Math.cos(phase) * 7, center.y + Math.sin(phase) * 6 - 5);
        if (tower.disabledUntil > this.simTime || this.towerStunUntil > this.simTime) continue;
        tower.helperPigeonCooldowns[index] = Math.max(0, tower.helperPigeonCooldowns[index]! - dt * this.globalAttackSpeedMultiplier());
        if (tower.helperPigeonCooldowns[index]! > 0) continue;
        const target = this.chooseTarget(this.enemies.filter((enemy) => enemy.alive
          && this.distanceToPathTiles(this.towerGridCenter(tower), enemy.pathProgress, enemy.route) <= 3), tower.priority);
        if (!target) continue;
        this.damageEnemy(target, tower, tower.spec.damage * tower.damageMultiplier * (flockRank >= 6 ? 1.5 : 1), true);
        tower.helperPigeonCooldowns[index] = 1;
      }
    }
  }

  private stepTowers(dt: number): void {
    const globalSpeed = this.globalAttackSpeedMultiplier();
    for (const tower of this.towers) {
      tower.attackSpeedMultiplier = tower.baseAttackSpeedMultiplier;
      tower.pigeonRangeAuraMultiplier = 1;
      const disabled = tower.disabledUntil > this.simTime || this.towerStunUntil > this.simTime;
      tower.sprite.setAlpha(disabled ? 0.38 : 1);
      tower.sprite.setStrokeStyle(this.simTime < tower.stunHitUntil ? 3 : 1.5, this.simTime < tower.stunHitUntil ? 0xff6d9e : 0x10232c, 1);
      tower.art.setAlpha(disabled ? 0.4 : 1);
      tower.label.setAlpha(disabled ? 0.45 : 1);
      this.stepPassiveUpgradeEffects(tower, dt);
    }
    for (const tower of this.towers) this.applyTowerAuras(tower);
    this.stepPigeonHelpers(dt);
    for (const tower of this.towers) {
      if (tower.disabledUntil > this.simTime || this.towerStunUntil > this.simTime) continue;
      if (tower.spec.id === 'angryPigeon' && tower.ranks[2]! >= 3) this.stepPigeonGuano(tower, dt);
      tower.cooldown -= dt * globalSpeed;
      const candidates = this.enemies.filter((enemy) => enemy.alive && this.distanceToPathTiles(this.towerGridCenter(tower), enemy.pathProgress, enemy.route) <= tower.spec.range * tower.rangeMultiplier * tower.pigeonRangeAuraMultiplier * this.globalRangeMultiplier());
      if (tower.spec.attackType === 'beam') {
        const target = this.chooseTarget(candidates, tower.priority);
        if (!target) { tower.lastTargetId = undefined; tower.beamLockTime = 0; continue; }
        if (tower.lastTargetId !== target.id) tower.beamLockTime = 0;
        tower.lastTargetId = target.id;
        tower.beamLockTime += dt;
        if (tower.cooldown > 0) continue;
        const dps = Math.min(200, 10 + (tower.beamLockTime * tower.trackingMultiplier / 5) * 190);
        this.damageEnemy(target, tower, (dps / tower.spec.attackRate) * tower.damageMultiplier, true);
        tower.cooldown = 1 / (tower.spec.attackRate * tower.attackSpeedMultiplier * globalSpeed);
        this.drawShot(tower, target);
        continue;
      }
      if (tower.spec.attackType === 'burnAura') {
        if (tower.cooldown > 0 || candidates.length === 0) continue;
        for (const enemy of candidates) {
          this.damageEnemy(enemy, tower, tower.spec.damage * tower.damageMultiplier);
          if (5 * tower.damageMultiplier >= enemy.burnDps) enemy.burnSource = tower;
          enemy.burnDps = Math.max(enemy.burnDps, 5 * tower.damageMultiplier);
          enemy.burnUntil = Math.max(enemy.burnUntil, this.simTime + 5 * this.statusDurationMultiplier());
        if (tower.slowBonus > 0) this.applySlow(enemy, tower.slowBonus, 0.5 * tower.slowDurationMultiplier, tower);
          this.drawShot(tower, enemy);
        }
        tower.cooldown = 1 / (tower.spec.attackRate * tower.attackSpeedMultiplier * globalSpeed);
        continue;
      }
      if (tower.spec.attackType === 'roomba') {
        const target = this.chooseTarget(candidates, tower.priority);
        if (!target || tower.cooldown > 0) continue;
        this.damageEnemy(target, tower, tower.spec.damage * tower.damageMultiplier, true);
        this.drawShot(tower, target);
        tower.cooldown = 1 / (tower.spec.attackRate * tower.attackSpeedMultiplier * globalSpeed);
        continue;
      }
      if (tower.spec.attackType === 'teddy') {
        const melee = candidates.filter((enemy) => this.distanceToPathTiles(this.towerGridCenter(tower), enemy.pathProgress, enemy.route) <= 6);
        const rockets = candidates.filter((enemy) => this.distanceToPathTiles(this.towerGridCenter(tower), enemy.pathProgress, enemy.route) > 6);
        if (tower.cooldown > 0) continue;
        if (melee.length > 0) {
          for (const enemy of melee) {
            this.damageEnemy(enemy, tower, 250 * tower.damageMultiplier);
            this.applyStun(enemy, 0.8);
          }
          tower.cooldown = 3 / (tower.attackSpeedMultiplier * globalSpeed);
        } else {
          const targets = [...rockets].sort((a, b) => b.pathProgress - a.pathProgress).slice(0, 2);
          if (!targets.length) continue;
          for (const enemy of targets) { this.damageEnemy(enemy, tower, 120 * tower.damageMultiplier, true); this.drawShot(tower, enemy); }
          tower.cooldown = 1.5 / (tower.attackSpeedMultiplier * globalSpeed);
        }
        continue;
      }
      const target = this.chooseTarget(candidates, tower.priority);
      if (!target || tower.cooldown > 0) continue;
      if (tower.spec.id === 'angryPigeon') {
        const rank = tower.ranks[0]!;
        if (rank >= 4) {
          if (tower.lastTargetId !== target.id) tower.pigeonAttackRampSeconds = 0;
          else tower.pigeonAttackRampSeconds += dt;
        } else tower.pigeonAttackRampSeconds = 0;
        const sustained = rank >= 5 ? 4 : rank >= 3 ? 2 : 1;
        const cap = rank >= 5 ? 6 : rank >= 4 ? 3 : sustained;
        tower.attackSpeedMultiplier *= Math.min(cap, sustained + tower.pigeonAttackRampSeconds * 0.25);
      }
      this.attackTarget(tower, target, candidates);
      if (tower.spec.id === 'angryPigeon') tower.lastTargetId = target.id;
      const interval = tower.spec.attackType === 'trap' ? 8 : 1 / tower.spec.attackRate;
      tower.cooldown = interval / (tower.attackSpeedMultiplier * globalSpeed);
    }
  }

  private attackTarget(tower: PlacedTower, target: ActiveEnemy, candidates: ActiveEnemy[]): void {
    // Count attacks once, even when one shot hits several enemies.
    tower.shotCounter += 1;
    const damage = tower.spec.damage * tower.damageMultiplier;
    if (tower.spec.attackType === 'splash' || tower.spec.attackType === 'freeze') {
      const radius = (tower.spec.attackType === 'freeze' ? 2 : 1.5) * tower.blastMultiplier * this.globalRangeMultiplier();
      const area = candidates.filter((enemy) => Math.abs(enemy.pathProgress - target.pathProgress) <= radius);
      for (const enemy of area) {
        this.damageEnemy(enemy, tower, damage, enemy === target);
        if (tower.spec.attackType === 'freeze') this.applySlow(enemy, 0.75, 1.5 * tower.slowDurationMultiplier, tower);
        this.drawShot(tower, enemy);
      }
      return;
    }
    if (tower.spec.attackType === 'chain' || tower.spec.attackType === 'pierce') {
      const sorted = [...candidates].sort((a, b) => Math.abs(a.pathProgress - target.pathProgress) - Math.abs(b.pathProgress - target.pathProgress));
      const targets = sorted.slice(0, this.upgradeTargetCap(tower, 3));
      targets.forEach((enemy, index) => {
        this.damageEnemy(enemy, tower, damage * (tower.spec.attackType === 'chain' ? 0.8 ** index : 1));
        this.drawShot(tower, enemy);
      });
      return;
    }
    this.damageEnemy(target, tower, damage, true);
    this.drawShot(tower, target);
    const targetCap = this.upgradeTargetCap(tower, 1);
    if (targetCap > 1) {
      const extraTargets = candidates.filter((enemy) => enemy !== target && enemy.alive)
        .sort((a, b) => Math.abs(a.pathProgress - target.pathProgress) - Math.abs(b.pathProgress - target.pathProgress))
        .slice(0, targetCap - 1);
      for (const enemy of extraTargets) this.damageEnemy(enemy, tower, damage, true);
    }
    if (tower.acquiredUpgrades.some((upgrade) => /area damage|shockwave|splash damage|explosion|blast/i.test(upgrade.description))) {
      for (const enemy of candidates) {
        if (enemy === target || !enemy.alive || Math.abs(enemy.pathProgress - target.pathProgress) > 1.5 * tower.blastMultiplier) continue;
        this.damageEnemy(enemy, tower, damage * 0.5);
      }
    }
    if (tower.spec.id === 'angryPigeon' && tower.ranks[0]! >= 6) {
      const radius = tower.ranks[0]! >= 7 ? 3.5 : 1.25;
      const shockDamage = tower.ranks[0]! >= 7 ? damage * 2 : damage * 0.5;
      for (const nearby of candidates) {
        if (nearby === target || Math.abs(nearby.pathProgress - target.pathProgress) > radius) continue;
        this.damageEnemy(nearby, tower, shockDamage);
      }
    }
    if (tower.spec.attackType === 'push' && !target.spec.miniboss && !target.spec.boss) target.pathProgress = Math.max(0, target.pathProgress - (1.5 * (1 + tower.pushBonus)));
    if (tower.spec.attackType === 'push' && tower.burnDpsBonus > 0) {
      if (tower.burnDpsBonus >= target.burnDps) target.burnSource = tower;
      target.burnDps = Math.max(target.burnDps, tower.burnDpsBonus);
      target.burnUntil = Math.max(target.burnUntil, this.simTime + 3 * this.statusDurationMultiplier());
    }
    if (tower.spec.attackType === 'sticky') {
      this.applySlow(target, Math.min(0.85, 0.25 + tower.slowBonus), 3 * tower.slowDurationMultiplier, tower);
      if (tower.coinBonusOnStick > 0) { this.coins += tower.coinBonusOnStick; this.run.coins = this.coins; }
    }
    if (tower.stunChance > 0 && Math.random() < tower.stunChance) this.applyStun(target, 0.5);
  }

  private upgradeTargetCap(tower: PlacedTower, base: number): number {
    let cap = base;
    for (const { description } of tower.acquiredUpgrades) {
      const text = description.toLowerCase();
      const explicit = Number(text.match(/(?:up to|hit)\s+(\d+)\s+(?:additional\s+)?targets?/)?.[1] ?? 0);
      const simultaneous = Number(text.match(/(\d+)\s+(?:darts?|balloons?|slices?|beams?|targets?)\s+(?:at once|simultaneously)/)?.[1] ?? 0);
      const pierce = Number(text.match(/(?:pierce\s+through|through|pierce)\s+(\d+)\s+(?:targets?|enemies)/)?.[1] ?? 0);
      const additional = Number(text.match(/(\d+)\s+additional\s+(?:targets?|enemies)/)?.[1] ?? 0);
      const cardinalBeams = /four cardinal directions/.test(text) ? 4 : 0;
      const beams = Number(text.match(/(\d+)\s+(?:high-powered\s+)?(?:rainbow\s+)?lasers?/)?.[1] ?? 0);
      cap = Math.max(cap, explicit, simultaneous, pierce, additional ? additional + 1 : 0, cardinalBeams, beams);
    }
    return Math.min(16, cap);
  }

  private stepPassiveUpgradeEffects(tower: PlacedTower, dt: number): void {
    if (tower.disabledUntil > this.simTime) return;
    if (tower.spec.id === 'freezeRayIceCreamTruck' && tower.ranks[1]! >= 7) this.stepPermafrostMortar(tower, dt);
    for (const upgrade of tower.acquiredUpgrades) {
      const text = upgrade.description.toLowerCase();
      if (text.includes('freezes heavy bosses')) continue;
      if (upgrade.name === 'Permafrost Mortar') continue;
      if (/visual only|\+\s*\d+(?:\.\d+)?%\s*(?:damage|range|attack speed|fire rate|blast|slow|duration)/.test(text)) continue;
      if (!/(?:passiv(?:ely|e)|periodically|continuous(?:ly)?|automatically|every\s+\d+\s+seconds?)/.test(text)) continue;
      if (!/(?:damage|attack|fire|drop|launch|blast|stun|slow|armor|push|backward|pigeon|rocket|beam|shockwave|wave|freeze|burn|bleed|trap|splash|spawn|summon|minion|pet|pounce|detonate|crush|sweep|vortex|pull|vacuum|swallow|consume|slam|speed reduction)/.test(text)) continue;
      const key = `${upgrade.rank}:${upgrade.name}`;
      let timer = (tower.passiveUpgradeTimers.get(key) ?? 0) - dt;
      if (timer > 0) { tower.passiveUpgradeTimers.set(key, timer); continue; }
      const cooldown = Number(text.match(/cooldown:\s*(\d+(?:\.\d+)?)/)?.[1] ?? 0);
      const interval = cooldown || Number(text.match(/every\s+(\d+(?:\.\d+)?)\s+seconds?/)?.[1] ?? 1.5);
      tower.passiveUpgradeTimers.set(key, interval);
      // Only keep effects global when their upgrade explicitly says the
      // screen/map/path is the target. Phrases such as "all enemies" alone
      // should not silently bypass the tower's normal range.
      const globalEffect = /on screen|entire path|whole path|map-clearing|map clearing|infinite range|anywhere on the map/i.test(text);
      const targets = this.enemies.filter((enemy) => enemy.alive && (globalEffect
        || this.distanceToPathTiles(this.towerGridCenter(tower), enemy.pathProgress, enemy.route) <= tower.spec.range * tower.rangeMultiplier * this.globalRangeMultiplier()));
      for (const enemy of targets) {
        if ((text.includes('slowed targets') || text.includes('slowed enemies')) && enemy.slowUntil <= this.simTime) continue;
        if (text.includes('frozen targets') && enemy.freezeUntil <= this.simTime) continue;
        if (text.includes('stuck enemies') && enemy.stunUntil <= this.simTime) continue;
        if (text.includes('attack speed reduction') || text.includes('attack/ability speeds')) {
          enemy.abilitySlowAmount = Math.max(enemy.abilitySlowAmount, Number(text.match(/(\d+(?:\.\d+)?)%/)?.[1] ?? 25) / 100);
          enemy.abilitySlowUntil = Math.max(enemy.abilitySlowUntil, this.simTime + 1.5);
        }
        if ((text.includes('slow') || text.includes('speed reduction')) && !text.includes('slowed targets') && !text.includes('slowed enemies')
          && !text.includes('attack speed reduction') && !text.includes('attack/ability speeds')) {
          const amount = Number(text.match(/(\d+(?:\.\d+)?)%/)?.[1] ?? 25) / 100;
          const duration = Number(text.match(/for\s+(\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?/)?.[1] ?? 1.5);
          this.applySlow(enemy, amount, duration, tower, text.includes('including bosses'));
        }
        if (/freeze(?:s|d)? (?:targets? )?solid/.test(text)) this.applyFreeze(enemy, Number(text.match(/for\s+(\d+(?:\.\d+)?)\s*s/)?.[1] ?? 1.5), tower, /bosses? (?:are )?affected/.test(text));
        else if (text.includes('freezing puddle')) this.applySlow(enemy, 0.3, 3, tower);
        else if (text.includes('stun') || text.includes('stuck completely') || text.includes('stop one enemy')) this.applyStun(enemy, Number(text.match(/for\s+(\d+(?:\.\d+)?)\s*s/)?.[1] ?? 0.5));
        if (text.includes('armor') && /reduce|strip|shred|remove|lower/.test(text)) enemy.armorShred = Math.max(enemy.armorShred, Number(text.match(/(\d+(?:\.\d+)?)%/)?.[1] ?? 25) / 100);
        if (text.includes('hyperarmor') && /reduce|strip|shred|remove|lower|negative/.test(text)
          && !text.includes('slowed targets') && !text.includes('frozen targets')) enemy.hyperarmorShred = Math.max(enemy.hyperarmorShred, Number(text.match(/(\d+(?:\.\d+)?)%/)?.[1] ?? 25) / 100);
        if (text.includes('take') && text.includes('more damage') && !text.includes('slowed targets') && !text.includes('frozen targets')) {
          enemy.damageTakenMultiplier = Math.max(enemy.damageTakenMultiplier, 1 + Number(text.match(/(\d+(?:\.\d+)?)%/)?.[1] ?? 15) / 100);
          enemy.damageTakenUntil = Math.max(enemy.damageTakenUntil, this.simTime + 2);
        }
        if (text.includes('burn') && !/increased burn damage/.test(text)) {
          const burnDps = Number(text.match(/(\d+(?:\.\d+)?)\s*(?:damage per second|dps)/)?.[1] ?? Math.max(1, tower.spec.damage * tower.damageMultiplier * 0.2));
          const burnDuration = Number(text.match(/for\s+(\d+(?:\.\d+)?)\s+seconds?/)?.[1] ?? 3);
          if (burnDps >= enemy.burnDps) enemy.burnSource = tower;
          enemy.burnDps = Math.max(enemy.burnDps, burnDps);
          enemy.burnUntil = Math.max(enemy.burnUntil, this.simTime + burnDuration * this.statusDurationMultiplier());
        }
        if (/deals?|deal|damage per second|\bdps\b/.test(text) && !/take\s+\d+%?\s+more damage/.test(text) && !text.includes('burn')) {
          const dps = Number(text.match(/(\d+(?:\.\d+)?)\s*(?:damage per second|dps)/)?.[1] ?? 0);
          const flatDamage = Number(text.match(/(?:deals?|deal)\s+(\d+(?:\.\d+)?)\s+damage/)?.[1] ?? 0);
          if (dps > 0) {
            const duration = Number(text.match(/for\s+(\d+(?:\.\d+)?)\s+seconds?/)?.[1] ?? 0);
            if (duration > 0) {
              enemy.burnDps = Math.max(enemy.burnDps, dps);
              enemy.burnSource = tower;
              enemy.burnUntil = Math.max(enemy.burnUntil, this.simTime + duration * this.statusDurationMultiplier());
            } else this.damageEnemy(enemy, tower, dps * Math.min(1.5, interval));
          } else if (flatDamage || /damage|bleed|shockwave|beam|launch|attack|spawn|summon|minion|pet|pounce|detonate|crush|sweep|vortex|pull|vacuum|swallow|consume|slam/.test(text)) {
            this.damageEnemy(enemy, tower, flatDamage || Math.max(1, tower.spec.damage * tower.damageMultiplier * 0.2));
          }
        }
        if ((text.includes('push') || text.includes('backward') || text.includes('turn around')) && !enemy.spec.boss && !enemy.spec.miniboss) {
          enemy.pathProgress = Math.max(0, enemy.pathProgress - 0.5);
        }
      }
    }
  }

  private stepPermafrostMortar(tower: PlacedTower, dt: number): void {
    const key = '7:Permafrost Mortar';
    let timer = (tower.passiveUpgradeTimers.get(key) ?? 0) - dt;
    if (timer > 0) { tower.passiveUpgradeTimers.set(key, timer); return; }
    tower.passiveUpgradeTimers.set(key, 2);
    const inRange = this.enemies.filter((enemy) => enemy.alive
      && this.distanceToPathTiles(this.towerGridCenter(tower), enemy.pathProgress, enemy.route) <= tower.spec.range * tower.rangeMultiplier * this.globalRangeMultiplier());
    const target = this.chooseTarget(inRange, tower.priority);
    if (!target) return;
    for (const enemy of inRange) {
      if (enemy.route !== target.route || Math.abs(enemy.pathProgress - target.pathProgress) > 2) continue;
      if (enemy.spec.boss) continue;
      if (enemy.spec.miniboss) {
        this.applyStun(enemy, 1);
        this.applySlow(enemy, 0.25, 2, tower);
      } else {
        enemy.freezeUntil = Math.max(enemy.freezeUntil, this.simTime + 3600);
        enemy.stunUntil = Math.max(enemy.stunUntil, enemy.freezeUntil);
      }
    }
  }

  private applyTowerAuras(tower: PlacedTower): void {
    if (tower.disabledUntil > this.simTime) return;
    const teddyAura = tower.spec.id === 'giantMechTeddyBear';
    const pigeonRangeAura = tower.spec.id === 'angryPigeon' && tower.ranks[1]! >= 4;
    if (tower.spec.attackType !== 'supportLaser' && !teddyAura && !pigeonRangeAura && tower.pigeonAuraBonus <= 0 && tower.nearbyFireRateBonus <= 0 && tower.passiveSlow <= 0 && tower.auraSlow <= 0) return;
    const center = this.towerGridCenter(tower);
    for (const nearby of this.towers) {
      if (nearby === tower) continue;
      const other = this.towerGridCenter(nearby);
      const distance = Math.hypot(center.x - other.x, center.y - other.y);
        if (distance <= (teddyAura ? 6 * tower.cuddleAuraRadiusMultiplier * this.globalRangeMultiplier() : tower.spec.range * tower.rangeMultiplier * this.globalRangeMultiplier())) {
        let buffed = false;
        if (tower.spec.attackType === 'supportLaser') { nearby.attackSpeedMultiplier = Math.max(nearby.attackSpeedMultiplier, 1 + 0.15 * tower.supportPowerMultiplier); buffed = true; }
        if (teddyAura) { nearby.attackSpeedMultiplier = Math.max(nearby.attackSpeedMultiplier, 1 + 0.05 * tower.cuddleAuraPowerMultiplier); buffed = true; }
        if (tower.pigeonAuraBonus > 0 && nearby.spec.id === 'angryPigeon') { nearby.attackSpeedMultiplier = Math.max(nearby.attackSpeedMultiplier, 1 + tower.pigeonAuraBonus); buffed = true; }
        if (tower.spec.id === 'angryPigeon' && tower.ranks[1]! >= 4 && nearby.spec.id === 'angryPigeon') nearby.pigeonRangeAuraMultiplier = Math.max(nearby.pigeonRangeAuraMultiplier, 1.2);
        if (tower.nearbyFireRateBonus > 0) { nearby.attackSpeedMultiplier = Math.max(nearby.attackSpeedMultiplier, 1 + tower.nearbyFireRateBonus); buffed = true; }
        if (buffed) {
          const targets = this.waveBuffTargets.get(tower) ?? new Set<PlacedTower>();
          targets.add(nearby);
          this.waveBuffTargets.set(tower, targets);
        }
      }
    }
    if (tower.passiveSlow > 0 || tower.auraSlow > 0) {
      for (const enemy of this.enemies) {
        if (!enemy.alive || this.distanceToPathTiles(center, enemy.pathProgress, enemy.route) > tower.spec.range * tower.rangeMultiplier * this.globalRangeMultiplier()) continue;
        if (tower.passiveSlow > 0) this.applySlow(enemy, tower.passiveSlow, 0.2, tower);
        if (tower.auraSlow > 0) this.applySlow(enemy, tower.auraSlow, 0.2, tower);
      }
    }
  }

  private applySlow(enemy: ActiveEnemy, amount: number, seconds: number, source?: PlacedTower, allowBoss = false): void {
    if ((enemy.spec.boss && !allowBoss) || this.simTime < enemy.ccImmuneUntil) return;
    const effectiveness = enemy.spec.miniboss ? 0.5 : 1;
    const weakenedSlow = Math.max(0, amount - this.mutationStack('weakeningSlow') * 0.15);
    const effectiveSlow = Math.min(0.9, weakenedSlow * effectiveness);
    if (effectiveSlow > 0 && source) {
      const targets = this.waveDebuffTargets.get(source) ?? new Set<number>();
      targets.add(enemy.id);
      this.waveDebuffTargets.set(source, targets);
    }
    enemy.slowAmount = Math.max(enemy.slowAmount, effectiveSlow);
    if (source) enemy.slowSource = source;
    enemy.slowUntil = Math.max(enemy.slowUntil, this.simTime + seconds * effectiveness * this.statusDurationMultiplier());
  }

  private applyStun(enemy: ActiveEnemy, seconds: number, allowBoss = false): void {
    if ((enemy.spec.boss && !allowBoss) || this.simTime < enemy.ccImmuneUntil) return;
    enemy.stunUntil = Math.max(enemy.stunUntil, this.simTime + seconds * (enemy.spec.miniboss ? 0.5 : 1));
  }

  private applyFreeze(enemy: ActiveEnemy, seconds: number, source?: PlacedTower, allowBoss = false): void {
    if ((enemy.spec.boss && !allowBoss) || this.simTime < enemy.ccImmuneUntil) return;
    const duration = seconds * (enemy.spec.miniboss ? 0.5 : 1);
    enemy.freezeUntil = Math.max(enemy.freezeUntil, this.simTime + duration);
    enemy.stunUntil = Math.max(enemy.stunUntil, enemy.freezeUntil);
    if (source?.spec.id === 'freezeRayIceCreamTruck' && source.ranks[1]! >= 5) {
      enemy.unfreezeSlowPending = true;
      enemy.unfreezeSlowSource = source;
    }
  }

  private mutationStack(id: string): number { return this.mutationStacks[id] ?? 0; }
  private globalAttackSpeedMultiplier(): number {
    const stackables = Math.max(0.05, 1 + Math.min(1.5, this.mutationStack('rapidFire') * 0.1) - Math.min(0.5, this.mutationStack('sluggishMechanisms') * 0.08));
    return stackables * (this.mutationStack('systemSlowdown') ? 0.6 : 1);
  }
  private globalRangeMultiplier(): number {
    return Math.max(0.1, 1 + Math.min(1.5, this.mutationStack('extendedReach') * 0.15) - Math.min(0.3, this.mutationStack('narrowedSights') * 0.05)) * (this.mutationStack('shortLeash') ? 0.5 : 1);
  }
  private globalDamageMultiplier(): number { return Math.max(0.1, 1 - Math.min(0.5, this.mutationStack('dulledImpact') * 0.1)) * (this.mutationStack('glassCannons') ? 1.5 : 1); }
  private statusDurationMultiplier(): number { return 1 + Math.min(1.5, this.mutationStack('lingeringEffects') * 0.15); }
  private enemySpawnRateMultiplier(): number { return 1 + Math.min(1, this.mutationStack('crowdedWaves') * 0.1); }
  private upgradePrice(base: number): number {
    const multiplier = Math.max(0.1, 1 + Math.min(1, this.mutationStack('priceHike') * 0.1)
      - Math.min(0.5, this.mutationStack('discountPath') * 0.1));
    return Math.ceil(base * multiplier / 10) * 10;
  }

  private showModifierChoice(forced = false): void {
    this.clearModifierOverlay();
    this.modifierChoiceOpen = true;
    const allModifiers = this.endlessMode ? CAMPAIGN_MUTATIONS : CAMPAIGN_MUTATIONS.filter((card) => card.side === 'GOOD' || card.side === 'BAD');
    const eligible = allModifiers.filter((card) => this.mutationStack(card.id) < card.stackCap);
    Phaser.Utils.Array.Shuffle(eligible);
    const choices = eligible.slice(0, 3);
    if (choices.length === 0) { this.modifierChoiceOpen = false; return; }
    const background = this.add.rectangle(W / 2, H / 2, W, H, 0x071016, 0.84).setDepth(40).setInteractive();
    const panel = this.add.rectangle(W / 2, H / 2, 700, 370, 0x203643).setStrokeStyle(2, 0x6fc8e8).setDepth(41);
    const title = this.add.text(W / 2, 210, forced ? 'FORCED MODIFIER BONUS' : `WAVE ${this.wave} MUTATION`, {
      fontFamily: 'Arial', fontSize: '24px', color: '#f6f1df', fontStyle: 'bold', letterSpacing: 2,
    }).setOrigin(0.5).setDepth(42);
    const subtitle = this.add.text(W / 2, 246, forced ? 'Choose one card, then a random extra mutation is applied.' : 'Choose one Good or Bad mutation. It lasts for this run.', {
      fontFamily: 'Arial', fontSize: '13px', color: '#a8b8b8', align: 'center',
    }).setOrigin(0.5).setDepth(42);
    this.modifierOverlayObjects.push(background, panel, title, subtitle);
    choices.forEach((choice, index) => {
      const x = 640 + (index - 1) * 220;
      const good = choice.side === 'GOOD';
      const tint = good ? 0x31584d : choice.side === 'BAD' ? 0x62404b : choice.side === 'HELL' ? 0x594126 : 0x3c3262;
      const rect = this.add.rectangle(x, 384, 196, 190, tint).setStrokeStyle(2, good ? 0xa9e7c2 : choice.side === 'BAD' ? 0xef7e9c : choice.side === 'HELL' ? 0xffb04a : 0xb98cf5).setDepth(42).setInteractive({ useHandCursor: true });
      const type = this.add.text(x, 318, choice.side, { fontFamily: 'Arial', fontSize: '10px', color: good ? '#a9e7c2' : choice.side === 'BAD' ? '#ffb0c0' : choice.side === 'HELL' ? '#ffcf7c' : '#d7bbff', fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5).setDepth(43);
      const name = this.add.text(x, 348, choice.name, { fontFamily: 'Arial', fontSize: '15px', color: '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: { width: 174 } }).setOrigin(0.5).setDepth(43);
      const desc = this.add.text(x, 394, choice.description, { fontFamily: 'Arial', fontSize: '11px', color: '#e1e8ec', align: 'center', wordWrap: { width: 168 }, lineSpacing: 4 }).setOrigin(0.5, 0).setDepth(43);
      const choose = () => this.selectMutation(choice, forced);
      rect.on('pointerover', () => rect.setAlpha(0.82));
      rect.on('pointerout', () => rect.setAlpha(1));
      rect.on('pointerdown', choose);
      [type, name, desc].forEach((obj) => obj.setInteractive({ useHandCursor: true }).on('pointerdown', choose));
      this.modifierOverlayObjects.push(rect, type, name, desc);
    });
  }

  private selectMutation(choice: CampaignMutation, forced: boolean): void {
    this.applyMutation(choice);
    this.clearModifierOverlay();
    this.modifierChoiceOpen = false;
    if (forced) {
      this.stackableSinceForced = 0;
      this.nonstackableSinceForced = 0;
      const pool = this.endlessMode ? CAMPAIGN_MUTATIONS : CAMPAIGN_MUTATIONS.filter((card) => card.side === 'GOOD' || card.side === 'BAD');
      const randomChoices = pool.filter((card) => this.mutationStack(card.id) < card.stackCap);
      if (randomChoices.length) this.applyMutation(randomChoices[Math.floor(Math.random() * randomChoices.length)]!);
    } else if (this.stackableSinceForced >= 3 || this.nonstackableSinceForced >= 2) {
      this.showModifierChoice(true);
    }
    this.gridFeedback = forced ? 'FORCED EVENT · BONUS RANDOM MUTATION APPLIED' : `${choice.name.toUpperCase()} APPLIED`;
    this.updateHUD();
  }

  private applyMutation(choice: CampaignMutation): void {
    this.mutationChoiceHistory.push(choice.id);
    if (choice.id === 'mutationRoulette') {
      const active = CAMPAIGN_MUTATIONS.filter((item) => item.id !== choice.id && this.mutationStack(item.id) > 0);
      if (active.length) {
        const removed = active[Math.floor(Math.random() * active.length)]!;
        this.mutationStacks[removed.id] = Math.max(0, this.mutationStack(removed.id) - 1);
        if (removed.id === 'titanBlood') for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          enemy.hp = Math.max(1, Math.floor(enemy.hp / 1.5));
          enemy.maxHp = Math.max(1, Math.floor(enemy.maxHp / 1.5));
          this.positionEnemy(enemy);
        }
        if (removed.id === 'overchargedSells') for (const tower of this.towers) {
          tower.overchargedUntil = 0;
          tower.attackSpeedMultiplier = tower.baseAttackSpeedMultiplier;
        }
        if (removed.id === 'reverseMomentum') for (const enemy of this.enemies) enemy.reverseMomentumUntil = 0;
        if (removed.id === 'sharedMisery') this.towerStunUntil = 0;
      }
      this.nonstackableSinceForced += 1;
      this.nonstackableMutationCount += 1;
      return;
    }
    this.mutationStacks[choice.id] = choice.stackable === false ? 1 : this.mutationStack(choice.id) + 1;
    if (choice.stackable === false) { this.nonstackableMutationCount += 1; this.nonstackableSinceForced += 1; }
    else { this.stackableMutationCount += 1; this.stackableSinceForced += 1; }
    if (choice.id === 'randomTowerSwap') this.randomSwapTimer = 30;
    if (choice.id === 'titanBlood') {
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        enemy.hp = Math.floor(enemy.hp * 1.5);
        enemy.maxHp = Math.floor(enemy.maxHp * 1.5);
        this.positionEnemy(enemy);
      }
    }
  }

  private clearModifierOverlay(): void {
    this.modifierOverlayObjects.splice(0).forEach((object) => object.destroy());
  }

  private showActiveModifiers(): void {
    if (this.modifierChoiceOpen) return;
    this.modifierChoiceOpen = true;
    const backdrop = this.add.rectangle(W / 2, H / 2, W, H, 0x071016, 0.84).setDepth(40).setInteractive();
    const panel = this.add.rectangle(W / 2, H / 2, 700, 430, 0x203643).setStrokeStyle(2, 0x6fc8e8).setDepth(41);
    const title = this.add.text(W / 2, 178, 'MUTATIONS CHOSEN THIS RUN', { fontFamily: 'Arial', fontSize: '23px', color: '#f6f1df', fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5).setDepth(42);
    const chosenIds = [...new Set(this.mutationChoiceHistory)];
    const chosen = chosenIds.map((id) => CAMPAIGN_MUTATIONS.find((entry) => entry.id === id)!).filter(Boolean);
    let page = 0;
    const list = this.add.text(W / 2, 218, '', { fontFamily: 'Arial', fontSize: '12px', color: '#e1e8ec', align: 'left', wordWrap: { width: 590 }, lineSpacing: 2 }).setOrigin(0.5, 0).setDepth(42);
    const pageLabel = this.add.text(W / 2, 534, '', { fontFamily: 'Arial', fontSize: '11px', color: '#a8b8b8', align: 'center' }).setOrigin(0.5).setDepth(42);
    const pageButton = (x: number, label: string, step: number) => {
      const button = this.add.rectangle(x, 534, 72, 28, 0x263447).setStrokeStyle(1, 0x6fc8e8).setDepth(42).setInteractive({ useHandCursor: true });
      const buttonLabel = this.add.text(x, 534, label, { fontFamily: 'Arial', fontSize: '11px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(43);
      const changePage = () => { page = Math.max(0, Math.min(Math.ceil(chosen.length / 7) - 1, page + step)); refreshPage(); };
      button.on('pointerdown', changePage);
      buttonLabel.setInteractive({ useHandCursor: true }).on('pointerdown', changePage);
      this.modifierOverlayObjects.push(button, buttonLabel);
    };
    const refreshPage = () => {
      const visible = chosen.slice(page * 7, page * 7 + 7);
      list.setText(visible.length ? visible.map((entry) => {
        const chosenCount = this.mutationChoiceHistory.filter((id) => id === entry.id).length;
        const activeCount = this.mutationStack(entry.id);
        const status = activeCount === chosenCount ? `CHOSEN ×${chosenCount} · ACTIVE` : `CHOSEN ×${chosenCount} · ACTIVE ×${activeCount}`;
        return `${entry.name}  ·  ${status}\n${entry.description}`;
      }).join('\n\n') : 'No mutations have been chosen yet.');
      pageLabel.setText(chosen.length ? `PAGE ${page + 1} / ${Math.ceil(chosen.length / 7)}` : '');
    };
    refreshPage();
    pageButton(465, '‹ PREV', -1);
    pageButton(815, 'NEXT ›', 1);
    const close = this.add.rectangle(W / 2, 570, 180, 38, 0x31584d).setStrokeStyle(1, 0xa9e7c2).setDepth(42).setInteractive({ useHandCursor: true });
    const closeLabel = this.add.text(W / 2, 570, 'CLOSE', { fontFamily: 'Arial', fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(43);
    const dismiss = () => { this.clearModifierOverlay(); this.modifierChoiceOpen = false; };
    close.on('pointerdown', dismiss); closeLabel.setInteractive({ useHandCursor: true }).on('pointerdown', dismiss);
    this.modifierOverlayObjects.push(backdrop, panel, title, list, pageLabel, close, closeLabel);
  }

  private damageEnemy(enemy: ActiveEnemy, tower: PlacedTower | undefined, rawDamage: number, singleTargetHit = false, impactResolved = false, damageCreditSource?: PlacedTower, exactDamage = false): void {
    if (!enemy.alive) return;
    if (tower && !exactDamage && this.mutationStack('unsteadyAim') && Math.random() < 0.1) return;
    if (tower && !exactDamage) rawDamage = this.applyUpgradeHitEffects(tower, enemy, rawDamage, singleTargetHit);
    if (tower && PHYSICAL_PROJECTILE_TOWER_IDS.has(tower.spec.id)) {
      const vacuum = this.enemies.find((candidate) => candidate.alive && candidate.spec.ability === 'cosmicVacuum'
        && this.simTime < candidate.suctionUntil
        && Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, candidate.sprite.x, candidate.sprite.y) <= 6 * BOARD.cell);
      if (vacuum) enemy = vacuum;
    }
    if (tower && !impactResolved && this.projectileSlowedByTape(tower, enemy)) {
      // Use the existing short shot animation as the prototype's baseline travel time.
      this.pendingImpacts.push({ enemyId: enemy.id, tower, damage: rawDamage, singleTargetHit, dueAt: this.simTime + 0.095 / 0.7 });
      return;
    }
    if (tower) {
      if (!exactDamage) rawDamage *= this.globalDamageMultiplier();
      const criticalChance = Math.min(1, this.mutationStack('keenAim') * 0.1);
      const upgradeCrit = Math.min(1, tower.criticalChance);
      const criticalHit = Math.random() < Math.max(criticalChance, upgradeCrit);
      if (!exactDamage && this.mutationStack('luckyShot') && !enemy.spec.boss && Math.random() < 0.01) rawDamage = enemy.hp + 1000;
      if (!exactDamage && this.mutationStack('criticalOverload')) rawDamage *= criticalHit ? Math.max(1.1, 3 - this.mutationStack('bluntedCriticals') * 0.1) : 0.5;
      else if (!exactDamage && criticalHit && (PHYSICAL_PROJECTILE_TOWER_IDS.has(tower.spec.id) || upgradeCrit > 0)) {
        rawDamage *= Math.max(1.1, 1.5 - this.mutationStack('bluntedCriticals') * 0.1);
      }
      if (!exactDamage && criticalHit && tower.acquiredUpgrades.some((upgrade) => /crit.*slow|crits.*slow/i.test(upgrade.description))) this.applySlow(enemy, 0.2, 1, tower);
    }
    const effectiveArmor = enemy.spec.armor < 0 ? enemy.spec.armor : enemy.spec.armor * (1 - enemy.armorShred);
    const afterArmor = exactDamage ? rawDamage : Math.max(1, rawDamage - effectiveArmor);
    let damageTakenMultiplier = this.simTime < enemy.damageTakenUntil ? enemy.damageTakenMultiplier : 1;
    if (tower && enemy.wetUntil > this.simTime && (tower.spec.attackType === 'freeze' || tower.spec.id === 'unstableToasterLauncher')) damageTakenMultiplier *= 1.25;
    if (tower && enemy.freezeUntil > this.simTime && PHYSICAL_PROJECTILE_TOWER_IDS.has(tower.spec.id)
      && tower.acquiredUpgrades.some((upgrade) => /frozen targets.*physical damage/i.test(upgrade.description))) damageTakenMultiplier *= 1.3;
    if (tower?.spec.id === 'hotSauceSprinkler' && enemy.slowUntil > this.simTime
      && tower.acquiredUpgrades.some((upgrade) => /slowed targets.*30% more fire damage/i.test(upgrade.description))) damageTakenMultiplier *= 1.3;
    const effectiveHyperarmor = enemy.spec.hyperarmor < 0 ? enemy.spec.hyperarmor : enemy.spec.hyperarmor * (1 - enemy.hyperarmorShred);
    const damage = exactDamage ? Math.max(1, Math.floor(afterArmor)) : Math.max(1, Math.floor(afterArmor * (1 - effectiveHyperarmor / 200) * damageTakenMultiplier));
    const actualHpRemoved = Math.min(enemy.hp, damage);
    enemy.hp -= damage;
    const creditSource = tower ?? damageCreditSource;
    if (creditSource && actualHpRemoved > 0) this.waveDamageByTower.set(creditSource, (this.waveDamageByTower.get(creditSource) ?? 0) + actualHpRemoved);
    if (tower && singleTargetHit && enemy.spec.ability === 'bubbleBath' && damage > 50) this.spawnSoapPuddle(enemy.pathProgress, enemy.route);
    this.processEnemyThresholds(enemy);
    this.positionEnemy(enemy);
    if (enemy.hp <= 0) {
      unlockBestiaryEntry(this.registry, enemy.spec.id as EnemyKey);
      const baseBounty = starScaledBounty(enemy.spec.bounty, this.star);
      let bounty = Math.floor(baseBounty * Math.max(0, 1 + Math.min(1.5, this.mutationStack('bountySurge') * 0.2) - Math.min(0.8, this.mutationStack('leanBounties') * 0.2)));
      if (this.endlessMode && enemy.waveNumber > 15) bounty = Math.floor(bounty * endlessBountyMultiplier(enemy.waveNumber));
      if (this.mutationStack('phantomBounties')) {
        const roll = Math.random();
        bounty *= roll < 0.25 ? 2 : roll < 0.5 ? 0 : 1;
      }
      this.coins += bounty;
      this.run.coins = this.coins;
      this.triggerEnemyDefeatAbility(enemy);
      this.removeEnemy(enemy);
    } else if (!exactDamage && tower && this.mutationStack('echoProjectiles') && tower.shotCounter > 0 && tower.shotCounter % 10 === 0) {
      this.damageEnemy(enemy, tower, damage, singleTargetHit, true, undefined, true);
    }
  }

  /** Shared on-hit hooks ensure descriptive upgrade effects have a live combat trigger. */
  private applyUpgradeHitEffects(tower: PlacedTower, enemy: ActiveEnemy, rawDamage: number, primaryTarget = false): number {
    for (const upgrade of tower.acquiredUpgrades) {
      const text = upgrade.description.toLowerCase();
      const passiveOnly = /passiv(?:ely|e)|periodically|continuous(?:ly)?|every\s+\d+\s+seconds?/.test(text)
        && !/(?:crit|shot|dart|hit|splash|direct|on firing)/.test(text);
      if (passiveOnly) continue;
      const percent = Number(text.match(/([0-9]+(?:\.[0-9]+)?)%/)?.[1] ?? 0) / 100;
      const seconds = Number(text.match(/([0-9]+(?:\.[0-9]+)?)\s*s(?:ec(?:ond)?s?)?\b/)?.[1] ?? 0);
      const every = Number(text.match(/every\s+(\d+)(?:st|nd|rd|th)?\s+(?:shot|dart|hit)/)?.[1] ?? 0);
      const scheduled = every === 0 || tower.shotCounter % every === 0;
      if (!scheduled) continue;
      if (every > 0 && /double damage|deals double damage/.test(text)) rawDamage *= 2;
      if (text.includes('damage') && text.includes('armored') && enemy.spec.armor > 0) rawDamage *= 1 + (percent || 0.5);
      if (text.includes('take') && (text.includes('more damage') || text.includes('damage from all sources'))) {
        enemy.damageTakenMultiplier = Math.max(enemy.damageTakenMultiplier, 1 + (percent || 0.15));
        enemy.damageTakenUntil = Math.max(enemy.damageTakenUntil, this.simTime + (seconds || 6));
      }
      if (text.includes('hyperarmor') && (text.includes('negative') || /reduce|strip|shred|remove|lower/.test(text))) enemy.hyperarmorShred = Math.max(enemy.hyperarmorShred, percent || 0.25);
      if (text.includes('armor') && /reduce|strip|shred|remove|lower/.test(text)) enemy.armorShred = Math.max(enemy.armorShred, percent || (text.includes('all armor') ? 1 : 0.25));
      if (text.includes('wet debuff')) enemy.wetUntil = Math.max(enemy.wetUntil, this.simTime + 3);
      if (tower.spec.id === 'freezeRayIceCreamTruck' && tower.ranks[1]! >= 6 && enemy.spec.boss && text.includes('freezes heavy bosses')) {
        this.applyFreeze(enemy, 1.75, tower, true);
      }
      if (text.includes('take') && text.includes('more damage')) {
        const conditionalSlowed = text.includes('slowed targets') && enemy.slowUntil > this.simTime;
        const conditionalFrozen = text.includes('frozen targets') && enemy.freezeUntil > this.simTime;
        if ((!text.includes('slowed targets') && !text.includes('frozen targets')) || conditionalSlowed || conditionalFrozen) {
          enemy.damageTakenMultiplier = Math.max(enemy.damageTakenMultiplier, 1 + (percent || 0.15));
          enemy.damageTakenUntil = Math.max(enemy.damageTakenUntil, this.simTime + (seconds || 2));
        }
      }
      if ((text.includes('freeze solid') && (!text.includes('direct balloon hits') || primaryTarget)) || text.includes('flash-freezing') || text.includes('freeze all hit enemies')) this.applyFreeze(enemy, seconds || 1, tower);
      else if (text.includes('stun') && (!text.includes('chance') || Math.random() < (percent || 1))) this.applyStun(enemy, seconds || 0.5);
      if (text.includes('stuck completely') || text.includes('stop one enemy')) this.applyStun(enemy, seconds || (text.includes('rest of its lifespan') ? 3600 : 1.5));
      if (text.includes('slow') && !text.includes('slow duration') && !text.includes('slowed targets') && !text.includes('crit')) this.applySlow(enemy, percent || 0.25, seconds || 1, tower);
      if (text.includes('random minor debuffs')) {
        const effect = Math.floor(Math.random() * 3);
        if (effect === 0) this.applySlow(enemy, 0.2, 2, tower);
        else if (effect === 1) this.applyStun(enemy, 0.25);
        else enemy.armorShred = Math.max(enemy.armorShred, 0.1);
      }
      if (/instantly (?:destroy|kill|crush)|vaporizing|disintegrating/.test(text)) rawDamage = Math.max(rawDamage, enemy.spec.boss ? enemy.hp * 0.35 : enemy.hp);
      if ((text.includes('burn') || text.includes('bleed') || text.includes('dot') || text.includes('damage over time')) && !text.includes('increased burn damage')) {
        const dps = Number(text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:damage per second|dps)/)?.[1] ?? 2);
        if (dps >= enemy.burnDps) enemy.burnSource = tower;
        enemy.burnDps = Math.max(enemy.burnDps, dps);
        enemy.burnUntil = Math.max(enemy.burnUntil, this.simTime + (seconds || 3));
      }
      if ((text.includes('push') || text.includes('blows enemies')) && !enemy.spec.boss && !enemy.spec.miniboss) {
        enemy.pathProgress = Math.max(0, enemy.pathProgress - (percent ? Math.max(0.5, percent * 10) : 0.5));
      }
    }
    return rawDamage;
  }

  private copyIsHybrid(tower: PlacedTower): boolean {
    const thresholds: Record<string, { path: number; rank: number }> = {
      squeakyRubberDuckCannon: { path: 0, rank: 5 }, angryPigeon: { path: 0, rank: 5 },
      leafBlowerGuy: { path: 1, rank: 6 }, unstableToasterLauncher: { path: 0, rank: 6 },
      cosmicRoomba: { path: 1, rank: 4 }, discoTurret: { path: 1, rank: 3 }, catLaserPointer: { path: 2, rank: 3 },
    };
    if (tower.spec.id === 'giantMechTeddyBear') return true;
    const threshold = thresholds[tower.spec.id];
    return Boolean(threshold && tower.ranks[threshold.path]! >= threshold.rank);
  }

  private copyHasAttackRole(tower: PlacedTower): boolean {
    const supportOnly = new Set(['leafBlowerGuy', 'freezeRayIceCreamTruck', 'stickyBubblegumDispenser', 'discoTurret']);
    return !supportOnly.has(tower.spec.id) || this.copyIsHybrid(tower);
  }

  private copyHasSupportRole(tower: PlacedTower): boolean {
    const supportTypes = new Set(['leafBlowerGuy', 'freezeRayIceCreamTruck', 'stickyBubblegumDispenser', 'discoTurret']);
    return supportTypes.has(tower.spec.id) || this.copyIsHybrid(tower);
  }

  private awardRankedMeasure(scores: Map<string, number>, qualifies: (score: number) => boolean): Map<string, number> {
    const ranked = [...scores.entries()].filter(([, score]) => qualifies(score)).sort((a, b) => b[1] - a[1]);
    const awards = new Map<string, number>();
    if (ranked.length <= 3) {
      ranked.forEach(([id]) => awards.set(id, 800));
      return awards;
    }
    const cutoffScore = ranked[2]![1];
    for (const [id, score] of ranked) if (score > cutoffScore) awards.set(id, 800);
    const tiedAtCutoff = ranked.filter(([, score]) => score === cutoffScore).map(([id]) => id);
    const slots = 3 - awards.size;
    Phaser.Utils.Array.Shuffle(tiedAtCutoff);
    const selected = new Set(tiedAtCutoff.slice(0, slots));
    for (const id of tiedAtCutoff) awards.set(id, selected.has(id) ? 800 : 650);
    for (const [id, score] of ranked) if (score < cutoffScore) awards.set(id, 250);
    return awards;
  }

  private awardWaveTowerXp(): void {
    if (this.mapPreview || (this.endlessMode && this.endlessModifiersEnabled) || this.waveTotalHp <= 0) return;
    const attackScores = new Map<string, number>();
    for (const tower of this.towers) {
      if (!this.copyHasAttackRole(tower)) continue;
      const damage = this.waveDamageByTower.get(tower) ?? 0;
      attackScores.set(tower.spec.id, (attackScores.get(tower.spec.id) ?? 0) + damage);
    }
    const awards = this.awardRankedMeasure(attackScores, (damage) => damage / this.waveTotalHp >= 0.1);

    const buffCounts = new Map<string, Set<PlacedTower>>();
    const debuffCounts = new Map<string, Set<number>>();
    for (const [source, targets] of this.waveBuffTargets) {
      if (!this.copyHasSupportRole(source)) continue;
      const combined = buffCounts.get(source.spec.id) ?? new Set<PlacedTower>();
      targets.forEach((target) => combined.add(target));
      buffCounts.set(source.spec.id, combined);
    }
    for (const [source, targets] of this.waveDebuffTargets) {
      if (!this.copyHasSupportRole(source)) continue;
      const combined = debuffCounts.get(source.spec.id) ?? new Set<number>();
      targets.forEach((target) => combined.add(target));
      debuffCounts.set(source.spec.id, combined);
    }
    const buffScores = new Map([...buffCounts.entries()].map(([id, targets]) => [id, targets.size]));
    const debuffScores = new Map([...debuffCounts.entries()].map(([id, targets]) => [id, targets.size]));
    const buffAwards = this.awardRankedMeasure(buffScores, (count) => count > 0);
    const debuffAwards = this.awardRankedMeasure(debuffScores, (count) => this.waveEnemyCount > 0 && count / this.waveEnemyCount >= 0.1);
    for (const [id, amount] of [...buffAwards, ...debuffAwards]) awards.set(id, Math.max(awards.get(id) ?? 0, amount));

    const summary: string[] = [];
    for (const [towerId, amount] of awards) {
      const levels = grantTowerXp(this.registry, towerId, amount);
      this.runMasteryXp.set(towerId, (this.runMasteryXp.get(towerId) ?? 0) + amount);
      const towerName = TOWERS.find((tower) => tower.id === towerId)?.name ?? towerId;
      summary.push(`${towerName} +${amount}${levels ? ` · LEVEL ${towerMastery(this.registry, towerId).level}` : ''}`);
    }
    if (summary.length) this.gridFeedback = `MASTERY XP · ${summary.join('  |  ')}`;
  }

  private drawShot(tower: PlacedTower, target: ActiveEnemy): void {
    const origin = this.towerCenter(tower.tile, tower.spec);
    const shot = this.addToBoard(this.add.graphics().setDepth(3));
    shot.lineStyle(1, tower.spec.color, 0.88).lineBetween(origin.x, origin.y, target.sprite.x, target.sprite.y);
    this.tweens.add({ targets: shot, alpha: 0, duration: this.projectileSlowedByTape(tower, target) ? 136 : 95, onComplete: () => shot.destroy() });
  }

  private chooseTarget(candidates: ActiveEnemy[], priority: Priority): ActiveEnemy | undefined {
    if (candidates.length === 0) return undefined;
    let sorted = candidates;
    if (priority === 'First') sorted = [...candidates].sort((a, b) => b.pathProgress - a.pathProgress);
    else if (priority === 'Last') sorted = [...candidates].sort((a, b) => a.pathProgress - b.pathProgress);
    else if (priority === 'Weakest') sorted = [...candidates].sort((a, b) => a.hp - b.hp || b.pathProgress - a.pathProgress);
    else sorted = [...candidates].sort((a, b) => b.hp - a.hp || b.pathProgress - a.pathProgress);
    const first = sorted[0]!;
    const tied = sorted.filter((enemy) => this.samePriorityValue(enemy, first, priority));
    const furthest = Math.max(...tied.map((enemy) => enemy.pathProgress));
    const tieBreak = tied.filter((enemy) => Math.abs(enemy.pathProgress - furthest) < 0.001);
    return tieBreak.length === 1 ? tieBreak[0] : tieBreak[Math.floor(Math.random() * tieBreak.length)];
  }

  private samePriorityValue(a: ActiveEnemy, b: ActiveEnemy, priority: Priority): boolean {
    if (priority === 'First' || priority === 'Last') return Math.abs(a.pathProgress - b.pathProgress) < 0.001;
    return a.hp === b.hp;
  }

  private completeWave(advanceImmediately = false): void {
    this.awardWaveTowerXp();
    const n = this.wave <= 24 ? 5 : 7 + 2 * Math.floor((this.wave - 25) / 10);
    const basePayout = this.endlessMode ? Math.min(3800, 300 + 2 * this.star * n * this.wave) : waveClearPayout(this.wave, this.star);
    const payout = Math.min(3800, Math.floor(basePayout * (1 + Math.min(1.5, this.mutationStack('bountySurge') * 0.2))));
    this.coins += payout;
    this.run.coins = this.coins;
    this.lastWavePayout = payout;
    if (!this.endlessMode && this.wave >= this.totalWaves) { this.endRun(true); return; }
    if (advanceImmediately) this.beginWave(this.wave + 1);
    else {
      this.betweenWaveTimer = 2;
      this.phase = 'between-waves';
      this.run.phase = 'between-waves';
      this.gridFeedback = '';
    }
  }

  private hasPendingSpawns(): boolean {
    return this.groupRemaining > 0 || this.groupIndex < this.waveGroups.length;
  }

  private hasLivingEnemies(): boolean {
    return this.enemies.some((enemy) => enemy.alive);
  }

  private canSkipWave(): boolean {
    return this.phase === 'wave'
      && this.wave < this.totalWaves
      && this.skipCooldown <= 0
      && !this.hasPendingSpawns()
      && !this.enemies.some((enemy) => enemy.alive && (enemy.spec.miniboss || enemy.spec.boss));
  }

  private skipWave(): void {
    if (!this.canSkipWave()) return;
    this.skipCooldown = 20;
    this.completeWave(true);
  }

  private endRun(won: boolean): void {
    this.registry.set('lastRunMasteryXp', [...this.runMasteryXp.values()].reduce((sum, value) => sum + value, 0));
    let playerXpAward = 0;
    let endlessGemAward = 0;
    if (this.endlessMode && !won) {
      const reached = this.endlessModifiersEnabled ? 0 : this.wave;
      playerXpAward = 100 * Math.min(reached, 15) + 75 * Math.max(0, reached - 15);
      endlessGemAward = reached >= 15 ? 3 * Math.floor(reached / 15) : reached > 0 ? 1 : 0;
      if (playerXpAward > 0) grantPlayerXp(this.registry, playerXpAward);
      if (endlessGemAward > 0) {
        const progress = this.registry.get('mapProgress') as { gems: number; unlockedMaps: MapId[] };
        progress.gems += endlessGemAward;
        this.registry.set('mapProgress', progress);
      }
    }
    this.registry.set('lastRunGems', endlessGemAward);
    if (won) {
      const clearKey = `stage${this.campaignStage}Star${this.star}Cleared`;
      this.firstClear = !this.mapPreview && !this.registry.get(clearKey);
      if (this.firstClear) {
        this.registry.set(clearKey, true);
        const xpPerClear = this.star === 1 ? 500 : this.star === 2 ? 800 : 1200;
        playerXpAward = xpPerClear;
        grantPlayerXp(this.registry, xpPerClear);
        const tierComplete = Array.from({ length: 5 }, (_, index) => index + 1)
          .every((stage) => stage === this.campaignStage || Boolean(this.registry.get(`stage${stage}Star${this.star}Cleared`)));
        const tierRewardKey = `campaignStar${this.star}GemsAwarded`;
        if (tierComplete && !this.registry.get(tierRewardKey)) {
          this.campaignGemReward = this.star === 1 ? 20 : this.star === 2 ? 45 : 80;
          const progress = this.registry.get('mapProgress') as { gems: number; unlockedMaps: MapId[] };
          progress.gems += this.campaignGemReward;
          this.registry.set('mapProgress', progress);
          this.registry.set(tierRewardKey, true);
        }
      }
    }
    this.registry.set('lastRunPlayerXp', playerXpAward);
    this.phase = won ? 'victory' : 'defeat';
    this.run.phase = won ? 'victory' : 'defeat';
    this.run.baseHealth = this.baseHealth;
    this.run.coins = this.coins;
    this.paused = false;
    this.statusLabel?.setText(won ? `STAGE COMPLETE\nAll ${this.totalWaves} waves survived!` : 'BASE LOST\nThe defense has fallen.');
    this.statusLabel?.setColor(won ? '#a9e7c2' : '#ef7e70');
    this.gridFeedback = won ? `STAGE ${this.campaignStage} CLEARED · $${this.coins} REMAINING` : this.endlessMode
      ? `ENDLESS ENDED · WAVE ${this.wave} · +${playerXpAward} XP · +${endlessGemAward} GEMS`
      : `DEFEATED ON WAVE ${this.wave}`;
    this.updateHUD();
    if (won) this.showVictoryScreen();
    else this.showDefeatScreen();
  }

  private showVictoryScreen(): void {
    this.add.rectangle(W / 2, H / 2, W, H, 0x071016, 0.82).setDepth(20).setInteractive();
    this.add.rectangle(W / 2, H / 2, 460, 286, 0x203643).setStrokeStyle(2, COLORS.mint).setDepth(21);
    this.add.text(W / 2, 270, `STAGE ${this.campaignStage} CLEARED`, { fontFamily: 'Arial', fontSize: '27px', color: '#a9e7c2', fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5).setDepth(22);
    const xpPerClear = this.star === 1 ? 500 : this.star === 2 ? 800 : 1200;
    const clearNote = this.firstClear
      ? `FIRST CLEAR  ·  +${xpPerClear} PLAYER XP${this.campaignGemReward ? `  ·  STAR TIER COMPLETE  ·  +${this.campaignGemReward} GEMS` : ''}`
      : 'Stage replayed · no first-clear bonus';
    this.add.text(W / 2, 319, `All ${this.totalWaves} waves survived at ${this.star} Star.\n$${this.coins} coins remaining.\n${clearNote}`, { fontFamily: 'Arial', fontSize: '16px', color: COLORS.cream, align: 'center', lineSpacing: 8 }).setOrigin(0.5).setDepth(22);
    const lobby = this.add.rectangle(W / 2, 405, 270, 44, 0x2d4b58).setStrokeStyle(1, COLORS.mint).setDepth(22).setInteractive({ useHandCursor: true });
    this.add.text(W / 2, 405, 'RETURN TO LOBBY', { fontFamily: 'Arial', fontSize: '13px', color: COLORS.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(23);
    const retry = this.add.rectangle(W / 2, 461, 270, 40, 0x182733).setStrokeStyle(1, 0x607c82).setDepth(22).setInteractive({ useHandCursor: true });
    this.add.text(W / 2, 461, 'PLAY THIS STAGE AGAIN', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(23);
    lobby.on('pointerdown', () => this.scene.start('Lobby'));
    retry.on('pointerdown', () => this.scene.restart());
  }

  private showDefeatScreen(): void {
    this.add.rectangle(W / 2, H / 2, W, H, 0x071016, 0.82).setDepth(20).setInteractive();
    this.add.rectangle(W / 2, H / 2, 460, 286, 0x203643).setStrokeStyle(2, 0xef7e70).setDepth(21);
    this.add.text(W / 2, 270, 'DEFENSE LOST', { fontFamily: 'Arial', fontSize: '30px', color: '#ef7e70', fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5).setDepth(22);
    const rewardLine = this.endlessMode ? `\n+${Number(this.registry.get('lastRunPlayerXp') ?? 0).toLocaleString()} Player XP · +${Number(this.registry.get('lastRunGems') ?? 0)} gems` : '';
    this.add.text(W / 2, 319, `The base fell during wave ${this.wave}.\nYou had ${this.baseHealth} base health remaining.${rewardLine}`, { fontFamily: 'Arial', fontSize: '16px', color: COLORS.cream, align: 'center', lineSpacing: 8 }).setOrigin(0.5).setDepth(22);
    const retry = this.add.rectangle(W / 2, 405, 270, 44, 0x2d4b58).setStrokeStyle(1, COLORS.mint).setDepth(22).setInteractive({ useHandCursor: true });
    this.add.text(W / 2, 405, this.endlessMode ? 'RETRY ENDLESS' : `RETRY STAGE ${this.campaignStage}`, { fontFamily: 'Arial', fontSize: '13px', color: COLORS.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(23);
    const lobby = this.add.rectangle(W / 2, 461, 270, 40, 0x182733).setStrokeStyle(1, 0x607c82).setDepth(22).setInteractive({ useHandCursor: true });
    this.add.text(W / 2, 461, 'RETURN TO LOBBY', { fontFamily: 'Arial', fontSize: '12px', color: COLORS.cream, fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(23);
    retry.on('pointerdown', () => this.scene.restart());
    lobby.on('pointerdown', () => this.scene.start('Lobby'));
  }

  private buyUpgrade(pathIndex: number): void {
    const tower = this.selectedTower;
    if (!tower) { this.gridFeedback = 'SELECT A PLACED TOWER TO UPGRADE'; this.updateHUD(); return; }
    if (tower.chosenPath !== undefined && tower.chosenPath !== pathIndex) {
      this.gridFeedback = `PATH LOCKED · THIS TOWER IS COMMITTED TO PATH ${tower.chosenPath + 1}`;
      this.updateHUD();
      return;
    }
    const nextRank = tower.ranks[pathIndex]! + 1;
    const rankCap = towerMastery(this.registry, tower.spec.id).pathRanks[pathIndex]!;
    if (nextRank > rankCap) { this.gridFeedback = `THIS TOWER TYPE HAS RANKS 1–${rankCap} UNLOCKED ON THIS PATH`; this.updateHUD(); return; }
    const upgrade = tower.spec.paths[pathIndex]?.tiers[nextRank - 1];
    if (!upgrade) return;
    const cost = this.upgradePrice(upgrade.cost);
    if (this.coins < cost) { this.gridFeedback = `NOT ENOUGH COINS · $${cost} NEEDED`; this.updateHUD(); return; }
    this.coins -= cost;
    tower.spentCoins += cost;
    tower.chosenPath = pathIndex;
    tower.ranks[pathIndex] = nextRank;
    tower.totalUpgrades += 1;
    this.applyUpgrade(tower, pathIndex, upgrade);
    this.run.coins = this.coins;
    this.gridFeedback = `${upgrade.name.toUpperCase()} PURCHASED`;
    // Keep the selected tower path and preview open. updateHUD derives the
    // next tier from the tower's new rank, so another confirm buys it directly.
    this.updateHUD();
  }

  private selectUpgrade(pathIndex: number): void {
    if (!this.selectedTower) {
      this.pendingUpgrade = undefined;
      this.gridFeedback = 'SELECT A PLACED TOWER TO PREVIEW ITS UPGRADE';
      this.updateHUD();
      return;
    }
    if (this.selectedTower.chosenPath !== undefined && this.selectedTower.chosenPath !== pathIndex) {
      this.pendingUpgrade = undefined;
      this.gridFeedback = `PATH LOCKED · THIS TOWER IS COMMITTED TO PATH ${this.selectedTower.chosenPath + 1}`;
      this.updateHUD();
      return;
    }
    this.pendingUpgrade = { tower: this.selectedTower, pathIndex };
    this.upgradeDetailsOpen = false;
    this.selectedEnemy = undefined;
    this.gridFeedback = '';
    this.updateHUD();
  }

  private showUpgradeDetails(): void {
    if (!this.pendingUpgrade) {
      this.gridFeedback = 'CHOOSE A PATH TO PREVIEW ITS NEXT UPGRADE';
      this.updateHUD();
      return;
    }
    this.upgradeDetailsOpen = true;
    this.gridFeedback = '';
    this.updateHUD();
  }

  private denyUpgrade(): void {
    this.pendingUpgrade = undefined;
    this.upgradeDetailsOpen = false;
    this.gridFeedback = 'UPGRADE DECLINED';
    this.updateHUD();
  }

  private applyUpgrade(tower: PlacedTower, pathIndex: number, upgrade: UpgradeTier): void {
    tower.acquiredUpgrades.push(upgrade);
    const text = upgrade.description.toLowerCase();
    const pct = Number(text.match(/[+]?([0-9]+(?:\.[0-9]+)?)%/)?.[1] ?? text.match(/([0-9]+(?:\.[0-9]+)?) percentage points?/)?.[1] ?? 0) / 100;
    if (text.includes('crit') && text.includes('chance')) tower.criticalChance = Math.max(tower.criticalChance, pct || 0.5);
    if (text.includes('passively generates small cash bonus')) tower.coinBonusOnStick = 1;
    if (text.includes('nearby pigeons')) tower.pigeonAuraBonus = pct;
    if (text.includes('minor burn') || text.includes('dot')) tower.burnDpsBonus = 2;
    if (text.includes('attack speed reduction for nearby enemies')) tower.passiveSlow = 0.1;
    if (text.includes('minor slow to passing enemies')) tower.auraSlow = 0.1;
    if (text.includes('fire rate for nearby towers')) tower.nearbyFireRateBonus = pct;
    if (text.includes('target tracking')) tower.trackingMultiplier *= 1 + pct;
    if (tower.spec.id === 'angryPigeon' && pathIndex === 0) {
      if (upgrade.rank === 3) tower.baseAttackSpeedMultiplier = Math.max(tower.baseAttackSpeedMultiplier, 2);
      if (upgrade.rank === 5) tower.baseAttackSpeedMultiplier = Math.max(tower.baseAttackSpeedMultiplier, 4);
      if (upgrade.rank === 7) tower.baseAttackSpeedMultiplier = Math.max(tower.baseAttackSpeedMultiplier, 20);
    }
    if (tower.spec.id === 'giantMechTeddyBear' && pathIndex === 2 && text.includes('aura radius')) tower.cuddleAuraRadiusMultiplier *= 1 + pct;
    if (!pct) return;
    if (text.includes('damage')) tower.damageMultiplier *= 1 + pct;
    if (text.includes('attack speed') || text.includes('fire rate') || text.includes('rotation speed') || text.includes('cooldown speed')) {
      tower.baseAttackSpeedMultiplier *= 1 + pct;
      tower.attackSpeedMultiplier = tower.baseAttackSpeedMultiplier * (this.simTime < tower.overchargedUntil ? 2 : 1);
    }
    const blastEffect = text.includes('blast area') || text.includes('area size') || text.includes('blast radius');
    if (!blastEffect && !(tower.spec.id === 'giantMechTeddyBear' && pathIndex === 2 && text.includes('aura radius'))
      && (text.includes('range') || text.includes('radius') || text.includes('suction') || text.includes('patrol distance'))) tower.rangeMultiplier *= 1 + pct;
    if (blastEffect) tower.blastMultiplier *= 1 + pct;
    if (text.includes('slow duration')) tower.slowDurationMultiplier *= 1 + pct;
    else if (text.includes('slow')) tower.slowBonus += pct;
    if (text.includes('stun chance') || text.includes('percentage points')) tower.stunChance += pct;
    if (text.includes('buff power') || text.includes('speed buff')) tower.supportPowerMultiplier *= 1 + pct;
    if (text.includes('buff power') && tower.spec.id === 'giantMechTeddyBear' && pathIndex === 2) tower.cuddleAuraPowerMultiplier *= 1 + pct;
    if (text.includes('push distance')) tower.pushBonus += pct;
    if (tower.coinBonusOnStick) this.gridFeedback = `${upgrade.name.toUpperCase()} · BONUS COIN EFFECT ACTIVE`;
  }

  private placeTower(tile: Tile): void {
    const spec = this.currentTowerSpec;
    const mystery = this.mysteryPlacing;
    const cost = mystery ? 0 : spec.cost;
    const totalSpent = mystery ? this.mysteryTowerCost : cost;
    if (this.coins < cost) { this.gridFeedback = `NOT ENOUGH COINS · $${cost} NEEDED`; this.updateHUD(); return; }
    if (!this.isBuildable(tile, spec)) { this.gridFeedback = `INVALID ${spec.footprint}×${spec.footprint} FOOTPRINT · CHOOSE CLEAR TILES`; this.updateHUD(); return; }
    this.coins -= cost;
    if (mystery) this.mysteryBoxUsed = true;
    this.mysteryPlacing = false;
    const center = this.towerCenter(tile, spec);
    const size = BOARD.cell * spec.footprint * 0.9;
    const sprite = this.addToBoard(this.add.rectangle(center.x, center.y, size, size, spec.color, 1).setStrokeStyle(1.5, 0x10232c, 1).setDepth(2));
    const art = this.drawTowerDesign(spec, center.x, center.y);
    const labelSize = (spec.footprint >= 4 ? 7 : 5) * BOARD.cell / 6.8;
    const label = this.addToBoard(this.add.text(center.x, center.y, spec.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2), {
      fontFamily: 'Arial', fontSize: `${labelSize}px`, color: '#101820', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3));
    label.setVisible(false);
    const tower: PlacedTower = {
      tile, spec, sprite, art, label, spentCoins: totalSpent, cooldown: 0, priority: this.defaultPriority, ranks: [0, 0, 0], totalUpgrades: 0, beamLockTime: 0,
      damageMultiplier: 1, rangeMultiplier: 1, attackSpeedMultiplier: 1, blastMultiplier: 1,
      slowBonus: 0, slowDurationMultiplier: 1, pushBonus: 0, stunChance: 0, supportPowerMultiplier: 1, pigeonAuraBonus: 0, coinBonusOnStick: 0,
      burnDpsBonus: 0, passiveSlow: 0, auraSlow: 0, nearbyFireRateBonus: 0, trackingMultiplier: 1, cuddleAuraRadiusMultiplier: 1, cuddleAuraPowerMultiplier: 1,
      baseAttackSpeedMultiplier: 1, guanoDropTimer: 0, helperPigeons: [], helperPigeonCooldowns: [],
      pigeonAttackRampSeconds: 0, pigeonRangeAuraMultiplier: 1, armadaCooldown: 0, armadaRemaining: 0, armadaPulseTimer: 0,
      acquiredUpgrades: [], shotCounter: 0, criticalChance: 0,
      passiveUpgradeTimers: new Map(),
      disabledUntil: 0, stunHitUntil: 0,
      noSell: this.mysteryTowerMode,
      overchargedUntil: this.mutationStack('overchargedSells') > 0 ? this.simTime + 5 : 0,
    };
    this.towers.push(tower);
    for (let dx = 0; dx < spec.footprint; dx += 1) {
      for (let dy = 0; dy < spec.footprint; dy += 1) this.towerObjects.set(routeKey({ x: tile.x + dx, y: tile.y + dy }), tower);
    }
    this.placing = false;
    if (this.mysteryTowerMode) {
      this.mysteryTowerOffer = undefined;
      this.mysteryTowerRefund = false;
      this.mysteryTowerMode = false;
      this.mysteryTowerCost = 0;
    }
    this.selectedTower = tower;
    this.selectedEnemy = undefined;
    this.pendingUpgrade = undefined;
    this.upgradeDetailsOpen = false;
    this.gridFeedback = `${spec.name.toUpperCase()} PLACED`;
    this.updateHUD();
  }

  private selectTower(tile: Tile): void {
    const tower = this.towerObjects.get(routeKey(tile));
    if (!tower) { this.selectedTower = undefined; this.selectedEnemy = undefined; this.pendingUpgrade = undefined; this.upgradeDetailsOpen = false; this.updateHUD(); return; }
    this.selectedTower = tower;
    this.selectedEnemy = undefined;
    this.pendingUpgrade = undefined;
    this.upgradeDetailsOpen = false;
    this.gridFeedback = `${tower.spec.name.toUpperCase()} · ${tower.priority.toUpperCase()} TARGET`;
    this.updateHUD();
  }

  private selectEnemyAt(x: number, y: number): boolean {
    let closest: ActiveEnemy | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const distance = Phaser.Math.Distance.Between(x, y, enemy.sprite.x, enemy.sprite.y);
      if (distance <= enemy.sprite.radius + 7 && distance < closestDistance) {
        closest = enemy;
        closestDistance = distance;
      }
    }
    if (!closest) return false;
    this.selectedEnemy = closest;
    this.selectedTower = undefined;
    this.pendingUpgrade = undefined;
    this.upgradeDetailsOpen = false;
    this.placing = false;
    this.gridFeedback = `${closest.spec.name} selected`;
    this.updateHUD();
    return true;
  }

  private isBuildable(tile: Tile, spec: TowerSpec = this.currentTowerSpec): boolean {
    for (let dx = 0; dx < spec.footprint; dx += 1) {
      for (let dy = 0; dy < spec.footprint; dy += 1) {
        const cell = { x: tile.x + dx, y: tile.y + dy };
        const key = routeKey(cell);
        if (cell.x < 0 || cell.x >= BOARD_COLUMNS || cell.y < 0 || cell.y >= BOARD_ROWS || this.roadTiles.has(key) || this.obstacleTiles.has(key) || this.towerObjects.has(key)) return false;
      }
    }
    return true;
  }

  private towerCenter(tile: Tile, spec: TowerSpec): { x: number; y: number } {
    return { x: BOARD.x + (tile.x + spec.footprint / 2) * BOARD.cell, y: BOARD.y + (tile.y + spec.footprint / 2) * BOARD.cell };
  }

  private towerGridCenter(tower: PlacedTower): Tile {
    return { x: tower.tile.x + tower.spec.footprint / 2, y: tower.tile.y + tower.spec.footprint / 2 };
  }

  private distanceToPathTiles(tile: Tile, progress: number, route: Tile[] = this.route): number {
    const step = Math.min(progress, route.length - 1);
    const index = Math.floor(step);
    const fraction = step - index;
    const a = route[index]!;
    const b = route[Math.min(index + 1, route.length - 1)]!;
    const x = a.x + (b.x - a.x) * fraction;
    const y = a.y + (b.y - a.y) * fraction;
    return Math.hypot(tile.x - x, tile.y - y);
  }

  private positionEnemy(enemy: ActiveEnemy): void {
    const { x, y } = this.positionOnRoute(enemy.pathProgress, enemy.route);
    enemy.sprite.setPosition(x, y);
    enemy.art.setPosition(x, y);
    enemy.hpBar.setPosition(x, y - enemy.sprite.radius - 2.5).setSize(Math.max(2, enemy.sprite.radius * 2 * enemy.hp / enemy.maxHp), 2.4);
    enemy.label.setPosition(x, y);
  }

  private positionOnRoute(progress: number, route: Tile[] = this.route): { x: number; y: number } {
    const clamped = Math.max(0, Math.min(progress, route.length - 1));
    const index = Math.floor(clamped);
    const amount = clamped - index;
    const a = this.tileCenter(route[index]!);
    const b = this.tileCenter(route[Math.min(index + 1, route.length - 1)]!);
    return { x: Phaser.Math.Linear(a.x, b.x, amount), y: Phaser.Math.Linear(a.y, b.y, amount) };
  }

  private createRouteArrows(): void {
    this.routeArrows.length = 0;
    for (const route of this.visualRoutes) {
      const spacing = Math.max(28, Math.floor((route.length - 1) / 3));
      for (let progress = spacing * 0.45; progress < route.length - 1; progress += spacing) {
        const graphic = this.addToBoard(this.add.graphics().setDepth(6));
        // Two open chevrons read as a path overlay, with no body, badge, or
        // other shape that could be mistaken for an enemy.
        graphic.lineStyle(8, 0x43eaff, 0.2).beginPath().moveTo(-6, 5).lineTo(0, -2).lineTo(6, 5).moveTo(-6, -3).lineTo(0, -10).lineTo(6, -3).strokePath();
        graphic.lineStyle(3, 0xc8fbff, 0.95).beginPath().moveTo(-6, 5).lineTo(0, -2).lineTo(6, 5).moveTo(-6, -3).lineTo(0, -10).lineTo(6, -3).strokePath();
        this.routeArrows.push({ route, progress, elapsed: 0, graphic });
      }
    }
    this.stepRouteArrows(0);
  }

  private stepRouteArrows(dt: number): void {
    for (let i = this.routeArrows.length - 1; i >= 0; i -= 1) {
      const marker = this.routeArrows[i]!;
      marker.elapsed += dt;
      if (marker.elapsed >= 8) {
        marker.graphic.destroy();
        this.routeArrows.splice(i, 1);
        continue;
      }
      const length = marker.route.length - 1;
      if (length <= 0) continue;
      marker.progress = (marker.progress + dt * 6) % length;
      const point = this.positionOnRoute(marker.progress, marker.route);
      const from = this.positionOnRoute(marker.progress, marker.route);
      const to = this.positionOnRoute(Math.min(marker.progress + 0.2, length), marker.route);
      const angle = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2;
      const fade = Math.max(0, 1 - marker.elapsed / 8);
      const pulse = 0.82 + (Math.sin(marker.elapsed * 7 + marker.progress) + 1) * 0.09;
      marker.graphic.setPosition(point.x, point.y).setRotation(angle).setAlpha(fade * pulse);
    }
  }

  private removeEnemy(enemy: ActiveEnemy): void {
    enemy.alive = false;
    enemy.sprite.destroy(); enemy.art.destroy(); enemy.hpBar.destroy(); enemy.label.destroy();
  }

  /** Small, crisp vector silhouettes keep the units recognizable at every board zoom. */
  private drawTowerDesign(spec: TowerSpec, x: number, y: number): Phaser.GameObjects.Graphics {
    const g = this.addToBoard(this.add.graphics().setPosition(x, y).setDepth(3));
    const u = spec.footprint * BOARD.cell / 20;
    const line = Math.max(1, u * 1.25);
    const ink = 0x172532;
    const cream = 0xfff1cb;
    const cyan = 0x63dcff;
    const pink = 0xff7cab;
    const gold = 0xffd15e;
    g.lineStyle(line, ink, 1);
    const dot = (cx: number, cy: number, r: number, color: number) => g.fillStyle(color, 1).fillCircle(cx * u, cy * u, r * u);
    const bar = (x1: number, y1: number, x2: number, y2: number, color = cream, width = 2) => g.lineStyle(width * u, color, 1).lineBetween(x1 * u, y1 * u, x2 * u, y2 * u);
    switch (spec.id) {
      case 'lawnDartGnome':
        g.fillStyle(0xe64d5c, 1).fillTriangle(-8*u, 6*u, 8*u, 6*u, 0, 9*u);
        dot(0, -1, 5, cream); g.fillStyle(0x47a96d, 1).fillTriangle(-7*u, -3*u, 7*u, -3*u, 0, -10*u);
        bar(-7, -5, 7, -5, 0x69d88a, 2); bar(-9, 3, 9, 3, 0x385064, 1);
        bar(-8, 7, 8, -8, 0xddeafa, 2); g.fillStyle(gold, 1).fillTriangle(7*u, -9*u, 10*u, -11*u, 9*u, -6*u); break;
      case 'leafBlowerGuy':
        g.fillStyle(0x2a4350, 1).fillRoundedRect(-8*u, -4*u, 13*u, 7*u, 2*u); g.fillStyle(cyan, 1).fillTriangle(5*u, -5*u, 10*u, -2*u, 5*u, 1*u);
        bar(-4, 2, -7, 8, gold, 3); dot(-2, -6, 2.2, 0x83d783); dot(2, -7, 2, 0x83d783); bar(7, -2, 10, -2, 0x9ef2ff, 1); break;
      case 'waterBalloonSlingshot':
        bar(-7, 8, -4, -7, 0x684b37, 2); bar(-4, -7, 0, -2, 0x684b37, 2); bar(-4, -7, -8, -3, 0x684b37, 2);
        bar(-7, -4, 4, -7, pink, 1); dot(3, -5, 4, cyan); dot(-1, 4, 2, gold); break;
      case 'stickyBubblegumDispenser':
        g.fillStyle(0x3c6170, 1).fillRoundedRect(-7*u, -8*u, 14*u, 15*u, 3*u); g.fillStyle(pink, 1).fillCircle(0, -2*u, 5*u);
        dot(-2, -3, 1.5, cream); dot(4, -9, 2.5, cyan); dot(-7, -8, 1.5, gold); bar(-5, 8, 5, 8, cream, 2); break;
      case 'angryPigeon':
        g.fillStyle(0x8d9eaa, 1).fillEllipse(-1*u, 1*u, 14*u, 11*u); g.fillStyle(0x6d7f91, 1).fillEllipse(-2*u, 2*u, 8*u, 7*u);
        dot(4, -4, 3, cream); dot(5, -4, 1, ink); g.fillStyle(gold, 1).fillTriangle(7*u, -2*u, 12*u, 0, 7*u, 1*u);
        g.fillStyle(pink, 1).fillTriangle(-6*u, 5*u, -10*u, 8*u, -4*u, 7*u); break;
      case 'discoTurret':
        g.fillStyle(0x2d3651, 1).fillRoundedRect(-7*u, 2*u, 14*u, 6*u, 2*u); dot(0, -3, 7, 0x75c9ee);
        bar(-5, -7, 5, 1, cream, 1); bar(-7, -3, 4, -3, pink, 1); bar(-2, -9, -2, 2, gold, 1); dot(-8, -9, 1.5, gold); dot(8, -8, 1.5, cyan); break;
      case 'anvilTrapdoor':
        g.fillStyle(0x9daeb8, 1).fillTriangle(-9*u, -4*u, 9*u, -4*u, 6*u, 2*u); g.fillStyle(0x657784, 1).fillRect(-6*u, 2*u, 12*u, 3*u);
        bar(-9, -5, 9, -5, cream, 1); g.fillStyle(gold, 1).fillTriangle(-3*u, -9*u, 3*u, -9*u, 0, -3*u); break;
      case 'squeakyRubberDuckCannon':
        g.fillStyle(0xffdc65, 1).fillEllipse(-2*u, 0, 12*u, 10*u); dot(-3, -6, 4, gold); dot(-4, -7, 1, ink);
        g.fillStyle(0xf38c46, 1).fillTriangle(2*u, -4*u, 9*u, -2*u, 2*u, 0); g.fillStyle(0x425466, 1).fillRoundedRect(2*u, 2*u, 9*u, 4*u, 1*u);
        bar(-6, 5, -5, 9, ink, 2); break;
      case 'hotSauceSprinkler':
        g.fillStyle(0xe34946, 1).fillRoundedRect(-5*u, -8*u, 10*u, 15*u, 3*u); g.fillStyle(cream, 1).fillRect(-3*u, -4*u, 6*u, 4*u);
        bar(0, -8, 0, -10, ink, 2); dot(-7, -5, 1.5, pink); dot(7, -6, 1.5, gold); dot(0, 8, 2, 0x57656d); break;
      case 'catLaserPointer':
        g.fillStyle(0xf0bd73, 1).fillEllipse(0, 1*u, 13*u, 11*u); g.fillStyle(0xf0bd73, 1).fillTriangle(-6*u, -3*u, -5*u, -10*u, 0, -4*u); g.fillStyle(0xf0bd73, 1).fillTriangle(2*u, -4*u, 7*u, -10*u, 7*u, -2*u);
        dot(-3, 0, 1, ink); dot(3, 0, 1, ink); bar(6, 0, 11, -5, 0xff466d, 1); break;
      case 'freezeRayIceCreamTruck':
        g.fillStyle(0xf7e4f2, 1).fillRoundedRect(-9*u, -2*u, 18*u, 10*u, 2*u); g.fillStyle(cyan, 1).fillRect(-7*u, 0, 6*u, 4*u);
        dot(-3, -5, 5, pink); dot(3, -7, 4, cream); dot(2, -9, 2, gold); dot(-5, 9, 2, ink); dot(5, 9, 2, ink);
        bar(5, -1, 10, -4, cyan, 2); break;
      case 'unstableToasterLauncher':
        g.fillStyle(0x84939e, 1).fillRoundedRect(-8*u, -4*u, 16*u, 11*u, 3*u); g.fillStyle(0x553c32, 1).fillRect(-5*u, -8*u, 10*u, 4*u);
        g.fillStyle(0xf0b35a, 1).fillTriangle(-4*u, -8*u, -3*u, -14*u, 3*u, -8*u); g.fillStyle(0xe97c49, 1).fillTriangle(0, -8*u, 2*u, -15*u, 6*u, -8*u);
        dot(-4, 8, 2, ink); dot(4, 8, 2, ink); break;
      case 'giantMechTeddyBear':
        dot(-6, -6, 5, 0xb77a55); dot(6, -6, 5, 0xb77a55); g.fillStyle(0x986044, 1).fillCircle(0, 0, 9*u);
        g.fillStyle(0xdba77a, 1).fillEllipse(0, 3*u, 10*u, 7*u); dot(-3, -1, 1, cream); dot(3, -1, 1, cream); dot(0, 3, 1.5, 0x543b36);
        bar(-11, 7, 11, 7, cyan, 2); break;
      case 'cosmicRoomba':
        g.fillStyle(0x45566e, 1).fillCircle(0, 0, 9*u); g.lineStyle(1.5*u, 0x17152f, 1).strokeCircle(0, 0, 7.5*u);
        dot(0, -2, 3, 0x8f78e8); bar(-5, 4, 5, 4, cyan, 1); dot(-6, 0, 1, gold); dot(6, 1, 1, pink); break;
    }
    return g;
  }

  private drawEnemyDesign(spec: EnemySpec, radius: number): Phaser.GameObjects.Graphics {
    const g = this.addToBoard(this.add.graphics().setDepth(5));
    const r = radius;
    const ink = 0x14212b;
    const light = 0xfff5d7;
    const eye = (x: number, y: number, size = Math.max(0.8, r * 0.18)) => {
      g.fillStyle(light, 1).fillCircle(x * r / 7, y * r / 7, size);
      g.fillStyle(ink, 1).fillCircle(x * r / 7, y * r / 7, size * 0.48);
    };
    const line = (x1: number, y1: number, x2: number, y2: number, color = ink, width = Math.max(0.8, r * 0.16)) =>
      g.lineStyle(width, color, 1).lineBetween(x1 * r / 7, y1 * r / 7, x2 * r / 7, y2 * r / 7);
    const dot = (x: number, y: number, radius: number, color: number) => g.fillStyle(color, 1).fillCircle(x * r / 7, y * r / 7, radius * r / 7);
    switch (spec.id) {
      case 'sock': g.fillStyle(light, 1).fillEllipse(-0.4*r, -0.2*r, r*0.9, r*1.25); g.fillStyle(0x78b9d1, 1).fillRect(-0.7*r, -0.15*r, r*0.8, r*0.2); line(0,-2,3,4,0x7b4b3d); break;
      case 'donut': g.lineStyle(Math.max(2, r*0.38), 0x734535, 1).strokeCircle(0, 0, r*0.52); g.lineStyle(Math.max(1.5, r*0.24), 0xffa0ba, 1).strokeCircle(0, 0, r*0.45); dot(-2,-2,0.55,0x62d8ea); dot(2,2,0.5,0xffd15e); break;
      case 'box': g.lineStyle(1, 0x805b3e, 1).lineBetween(-r*0.5,-r*0.5,0,0).lineBetween(r*0.5,-r*0.5,0,0); line(0,-4,0,4,0xb88c5d); break;
      case 'bowling': dot(-2,-2,0.75,ink); dot(1,-3,0.75,ink); dot(0,1,0.75,ink); break;
      case 'scooter': dot(-3,3,1.1,ink); dot(3,3,1.1,ink); line(-3,2,2,1,0xf4ecff); line(2,1,2,-4,0xf4ecff); line(2,-4,4,-4,0xf4ecff); break;
      case 'ferret': dot(-3,-4,2.1,spec.color); dot(3,-4,2.1,spec.color); eye(-2,0); eye(2,0); line(-2,4,2,4,light); break;
      case 'shoppingCart': g.lineStyle(1.2, 0x344a58, 1).strokeRect(-r*0.45,-r*0.3,r*0.7,r*0.6); line(-4,-3,3,-3,light,0.8); line(-4,0,3,0,light,0.8); dot(-2,4,0.8,ink); dot(3,4,0.8,ink); break;
      case 'recliner': g.fillStyle(0xd69d70, 1).fillRoundedRect(-r*0.5,-r*0.25,r,r*0.65,2); g.fillStyle(0xf0bd8a, 1).fillRoundedRect(-r*0.35,-r*0.6,r*0.7,r*0.45,2); line(-4,3,-4,5); line(4,3,4,5); break;
      case 'brickSafe': g.lineStyle(1, 0xe2b65f, 1).strokeRect(-r*0.45,-r*0.45,r*0.9,r*0.9); dot(0,0,1.4,0xe2b65f); line(0,-3,0,-1,0xe2b65f); break;
      case 'vending': g.lineStyle(1, ink, 1).strokeRect(-r*0.5,-r*0.55,r,r*1.1); g.fillStyle(0x91e2be,1).fillRect(-r*0.3,-r*0.35,r*0.6,r*0.48); dot(2,2,0.7,0xffd15e); break;
      case 'dumpster': g.fillStyle(0x455d46,1).fillRoundedRect(-r*0.48,-r*0.2,r*0.96,r*0.65,2); line(-r*0.55,-r*0.25,r*0.5,-r*0.25,0xb5d66a); line(-2,1,2,1,light,1); break;
      case 'grandfatherClock': line(0,-4,0,1,0xffe7a8,1); line(0,1,3,3,0xffe7a8,1); dot(0,-4,0.7,0xffe7a8); break;
      case 'paradeBalloon': dot(-2,-2,1.2,light); dot(2,-2,1.2,light); g.fillStyle(0xf6b4db,1).fillTriangle(-1*r/7,r*0.65,1*r/7,r*0.65,0,r*0.95); break;
      case 'lawnMower': eye(-2,-2); eye(2,-2); line(-4,3,4,3,0x242a30,1.5); line(-3,4,3,4,0xf9cf59,1); line(-4,-3,-5,-5,light,0.8); line(4,-3,5,-5,light,0.8); break;
      case 'overlordFridge': g.lineStyle(1, 0xe9ffff, 1).strokeRoundedRect(-r*0.48,-r*0.58,r*0.96,r*1.16,2); line(-r*0.4,0,r*0.4,0,0xe9ffff,0.8); line(r*0.25,-4,r*0.25,-1,0xe9ffff,1); break;
      case 'piggyBank': g.fillStyle(0xff9dca,1).fillEllipse(0,0,r*1.3,r*1.05); g.fillStyle(0xffd2e7,1).fillEllipse(r*0.4,0,r*0.45,r*0.34); dot(r*0.35,0,0.55,ink); line(-2,-4,2,-4,ink,0.8); break;
      case 'cosmicVacuum': g.lineStyle(Math.max(1.5,r*0.32),0x5a4b99,1).strokeCircle(0,0,r*0.6); dot(0,0,1.5,0xd7c7ff); dot(-4,-3,0.65,0xfff1a8); dot(4,3,0.65,0x68e3ff); line(-4,4,4,-4,0xc8aaff,0.8); break;
      case 'pinata': eye(-2,-1); eye(2,-1); line(-4,-4,-2,-6,0xfde5a1,1); line(0,-5,0,-7,0x79e2b6,1); line(4,-4,2,-6,0x67d9ff,1); break;
      case 'nestingDoll': g.fillStyle(0xffdfaa,1).fillEllipse(0,0,r*0.92,r*1.25); eye(-2,-1); eye(2,-1); line(-2,3,2,3,0x9c3f46,0.8); dot(0,-5,1,0x75c786); break;
      case 'teeth': g.fillStyle(light,1).fillRoundedRect(-r*0.5,-r*0.34,r,r*0.68,2); for(let i=-2;i<=2;i+=2) line(i,-2,i,2,0x68564f,0.7); line(-3,2,3,2,0xd85068,0.9); break;
      case 'bubbleBath': dot(-3,-2,1.5,0xb7f5ff); dot(2,-3,2,0xd7fbff); dot(0,2,1.6,0x49bbda); dot(4,2,0.8,0xf7ffff); break;
      case 'alarm': dot(-4,-4,2,spec.color); dot(4,-4,2,spec.color); line(0,-3,0,1,light,0.9); line(0,1,3,2,light,0.9); line(-4,4,-4,6,ink,1); line(4,4,4,6,ink,1); break;
      case 'tape': g.lineStyle(Math.max(1.5,r*0.36),0xffdc55,1).strokeCircle(0,0,r*0.5); g.lineStyle(Math.max(0.8,r*0.17),0x8a6431,1).strokeCircle(0,0,r*0.2); line(-4,3,4,3,0xfff1bb,0.8); break;
      default: eye(-2,0); eye(2,0); break;
    }
    return g;
  }

  private tileCenter(tile: Tile): { x: number; y: number } {
    return { x: BOARD.x + (tile.x + 0.5) * BOARD.cell, y: BOARD.y + (tile.y + 0.5) * BOARD.cell };
  }

  private updateHUD(): void {
    this.waveLabel?.setText(this.endlessMode ? `Wave ${this.wave || 1}` : `${Math.min(this.wave || 1, this.totalWaves)} / ${this.totalWaves}`);
    this.healthLabel?.setText(`${this.baseHealth} / 100`).setColor(this.baseHealth <= 30 ? '#ef7e70' : '#f6f1df');
    this.coinLabel?.setText(`$${this.coins}`);
    this.statusLabel?.setText(this.gridFeedback || this.phaseMessage());
    const unlockedSpeeds = new Set((this.registry.get('unlockedGameSpeeds') as number[] | undefined) ?? []);
    const paintSpeedOption = (value: 3 | 4, button?: Phaser.GameObjects.Rectangle, label?: Phaser.GameObjects.Text) => {
      const unlocked = unlockedSpeeds.has(value);
      const active = this.speed === value;
      button?.setFillStyle(active ? 0x3c684f : unlocked ? 0x2d4b58 : 0x182733)
        .setStrokeStyle(1, active ? 0xa9e7c2 : unlocked ? 0x6fc8e8 : 0xf4c86a);
      label?.setText(unlocked ? `${value}× SPEED` : `UNLOCK ${value}× · 30G`)
        .setColor(active ? '#ffffff' : unlocked ? '#d8e5e1' : COLORS.cream);
    };
    this.speedLabel?.setText(`${this.speed}× SPEED`);
    paintSpeedOption(3, this.speed3Button, this.speed3Label);
    paintSpeedOption(4, this.speed4Button, this.speed4Label);
    const show4x = unlockedSpeeds.has(3);
    this.speed4Button?.setVisible(show4x);
    this.speed4Label?.setVisible(show4x);
    const alive = this.enemies.filter((enemy) => enemy.alive).length;
    const queued = this.waveGroups.slice(this.groupIndex).reduce((total, group) => total + group.count, this.groupRemaining);
    this.enemyCountLabel?.setText(this.phase === 'victory' || this.phase === 'defeat' ? '' : `${alive} alive · ${queued} queued`);
    const pendingTower = this.pendingUpgrade?.tower;
    const pendingPath = pendingTower?.spec.paths[this.pendingUpgrade!.pathIndex];
    const pendingRank = pendingTower && this.pendingUpgrade ? pendingTower.ranks[this.pendingUpgrade.pathIndex]! + 1 : 0;
    const pendingTier = pendingPath?.tiers[pendingRank - 1];
    if (pendingTower && pendingTier && this.pendingUpgrade && this.upgradeDetailsOpen) {
      const rankCap = towerMastery(this.registry, pendingTower.spec.id).pathRanks[this.pendingUpgrade.pathIndex]!;
      const cap = pendingRank > rankCap;
      const affordable = this.coins >= this.upgradePrice(pendingTier.cost);
      const upgradeHeading = `${pendingTier.name.toUpperCase()}  ·  ${pendingPath.name}`;
      this.bottomBarTitle?.setText(upgradeHeading.length > 37 ? `${upgradeHeading.slice(0, 36)}…` : upgradeHeading).setColor('#ffd15e');
      this.enemyInspectorLabel?.setText(`${pendingTier.description}  ·  Cost $${this.upgradePrice(pendingTier.cost)}${cap ? '  ·  MASTERY RANK LOCKED' : !affordable ? '  ·  NOT ENOUGH COINS' : ''}`);
      const canConfirm = Boolean(!cap && affordable);
      this.upgradeConfirmButton?.setVisible(true).setFillStyle(canConfirm ? 0x3c684f : 0x354050).setStrokeStyle(1, canConfirm ? 0xa9e7c2 : 0x65758b);
      this.upgradeConfirmLabel?.setVisible(true).setColor(canConfirm ? '#ffffff' : '#9aa8b8').setText(`CONFIRM\n$${this.upgradePrice(pendingTier.cost)}`);
      this.upgradeDenyButton?.setVisible(true);
      this.upgradeDenyLabel?.setVisible(true);
      if (canConfirm) this.upgradeConfirmButton?.setInteractive({ useHandCursor: true });
      else this.upgradeConfirmButton?.disableInteractive();
    } else if (pendingTower && pendingTier && this.pendingUpgrade) {
      this.bottomBarTitle?.setText('UPGRADE PREVIEW').setColor('#f4c86a');
      this.enemyInspectorLabel?.setText(`Click “${pendingTier.name}” below the paths to view its description and choose whether to buy it.`);
      this.upgradeConfirmButton?.setVisible(false);
      this.upgradeConfirmLabel?.setVisible(false);
      this.upgradeDenyButton?.setVisible(false);
      this.upgradeDenyLabel?.setVisible(false);
    } else if (this.selectedEnemy) {
      const { spec, hp } = this.selectedEnemy;
      const effectiveArmor = spec.armor < 0 ? spec.armor : spec.armor * (1 - this.selectedEnemy.armorShred);
      const armorText = effectiveArmor !== spec.armor
        ? `Armor ${spec.armor}→${Number(effectiveArmor.toFixed(1))} (${Math.round(this.selectedEnemy.armorShred * 100)}% shred)`
        : `Armor ${spec.armor}`;
      const effectiveHyperarmor = spec.hyperarmor < 0 ? spec.hyperarmor : spec.hyperarmor * (1 - this.selectedEnemy.hyperarmorShred);
      const hyperarmorText = effectiveHyperarmor !== spec.hyperarmor
        ? `Hyperarmor ${spec.hyperarmor}→${Number(effectiveHyperarmor.toFixed(1))}`
        : `Hyperarmor ${spec.hyperarmor}`;
      const statuses = [
        this.selectedEnemy.freezeUntil > this.simTime ? 'FROZEN' : '',
        this.selectedEnemy.stunUntil > this.simTime && this.selectedEnemy.freezeUntil <= this.simTime ? 'STUNNED' : '',
        this.selectedEnemy.slowUntil > this.simTime ? `SLOWED ${Math.round(this.selectedEnemy.slowAmount * 100)}%` : '',
        this.selectedEnemy.burnUntil > this.simTime ? 'BURNING' : '',
        this.selectedEnemy.wetUntil > this.simTime ? 'WET' : '',
      ].filter(Boolean).join(' · ');
      this.bottomBarTitle?.setText('ENEMY INSPECTOR').setColor('#6fc8e8');
      this.enemyInspectorLabel?.setText(`${spec.name}  ·  HP ${Math.max(0, Math.ceil(hp))}/${this.selectedEnemy.maxHp}  ·  Speed ${spec.speed}  ·  ${armorText}  ·  ${hyperarmorText}${statuses ? `  ·  ${statuses}` : ''}`);
      this.upgradeConfirmButton?.setVisible(false);
      this.upgradeConfirmLabel?.setVisible(false);
      this.upgradeDenyButton?.setVisible(false);
      this.upgradeDenyLabel?.setVisible(false);
    } else {
      this.bottomBarTitle?.setText('ENEMY INSPECTOR').setColor('#6fc8e8');
      this.enemyInspectorLabel?.setText('Click an enemy on the board to inspect its stats.');
      this.upgradeConfirmButton?.setVisible(false);
      this.upgradeConfirmLabel?.setVisible(false);
      this.upgradeDenyButton?.setVisible(false);
      this.upgradeDenyLabel?.setVisible(false);
    }
    // Keep the inspector's bottom edge fixed. Its height grows only when the
    // selected description wraps onto extra lines, then returns to compact.
    const barHeight = Math.max(54, (this.enemyInspectorLabel?.height ?? 14) + 32);
    const barTop = 706 - barHeight;
    const buttonY = 678 + (barTop - 652);
    this.inspectorGraphics?.clear();
    this.inspectorGraphics?.fillStyle(0x292750, 1).fillRoundedRect(408, barTop, 464, barHeight, 10);
    this.inspectorGraphics?.lineStyle(2, 0x63dcff, 0.95).strokeRoundedRect(408, barTop, 464, barHeight, 10);
    this.inspectorGraphics?.fillStyle(0xffd15e, 1).fillRoundedRect(414, barTop + 6, 4, barHeight - 12, 2);
    this.bottomBarTitle?.setY(barTop + 4);
    this.enemyInspectorLabel?.setY(barTop + 23);
    this.upgradeDenyButton?.setY(buttonY);
    this.upgradeDenyLabel?.setY(buttonY);
    this.upgradeConfirmButton?.setY(buttonY);
    this.upgradeConfirmLabel?.setY(buttonY);
    this.priorityButtonLabel?.setText(`${(this.selectedTower?.priority ?? this.defaultPriority).toUpperCase()}   ▾`);
    const canSkip = this.canSkipWave();
    this.skipButton?.setFillStyle(canSkip ? 0x2d4b58 : 0x182733);
    this.skipButton?.setStrokeStyle(1, canSkip ? COLORS.mint : 0x607c82);
    this.skipButtonLabel?.setColor(canSkip ? '#f6f1df' : COLORS.muted)
      .setText(this.skipCooldown > 0 ? `SKIP WAVE · ${Math.ceil(this.skipCooldown)}s` : 'SKIP WAVE');
    const activeMutations = CAMPAIGN_MUTATIONS.filter((mutation) => this.mutationStack(mutation.id) > 0)
      .map((mutation) => `${mutation.name} ×${this.mutationStack(mutation.id)}`);
    this.modifierStatusLabel?.setText(activeMutations.length ? `ACTIVE MODIFIERS · ${activeMutations.length} · CLICK TO VIEW` : this.endlessModifiersEnabled ? 'MODIFIERS · NONE YET · CLICK TO VIEW' : 'STAGE 5 MODIFIERS · NONE YET');
    this.selectionLabel?.setText(this.selectedTower?.spec.name ?? (this.placing ? (this.mysteryPlacing ? 'Placing Mystery Box' : `Placing ${this.currentTowerSpec.name}`) : 'No tower selected'));
    const showCancel = this.placing;
    const showDelete = Boolean(this.selectedTower) && !this.placing && !this.selectedTower?.noSell && !this.mutationStack('overchargedSells');
    this.cancelPlacementButton?.setVisible(showCancel);
    this.cancelPlacementLabel?.setVisible(showCancel);
    this.deleteTowerButton?.setVisible(showDelete);
    this.deleteTowerLabel?.setVisible(showDelete);
    if (showDelete && this.selectedTower) this.deleteTowerLabel?.setText(`SELL TOWER · +$${Math.ceil(this.selectedTower.spentCoins * 0.5)}`);
    const spec = this.selectedTower?.spec ?? this.currentTowerSpec;
    const tower = this.selectedTower;
    if (!tower && this.mysteryPlacing) {
      this.towerStatsLabel?.setText('Mystery tower\nThe tower type is revealed when you place it.');
    } else if (!tower) {
      this.towerStatsLabel?.setText(`${spec.role}\n${spec.damage} damage · ${spec.attackRate}/sec · ${spec.range} range · ${spec.footprint}×${spec.footprint}`);
    } else {
      const value = (number: number) => Number(number.toFixed(1)).toString();
      const stat = (name: string, base: number, current: number, unit = '') => {
        const changed = Math.abs(base - current) > 0.001;
        const change = changed ? ` (+${Math.round((current / base - 1) * 100)}%)` : '';
        return `${name} ${value(base)}${changed ? `→${value(current)}` : ''}${unit}${change}`;
      };
      const details = [
        `${stat('Damage', spec.damage, spec.damage * tower.damageMultiplier)} · ${stat('Rate', spec.attackRate, spec.attackRate * tower.attackSpeedMultiplier, '/s')}`,
        stat('Range', spec.range, spec.range * tower.rangeMultiplier),
      ];
      const modifiers: string[] = [];
      if (tower.blastMultiplier > 1) modifiers.push(`Blast ×${value(tower.blastMultiplier)}`);
      if (tower.slowBonus > 0) modifiers.push(`Slow +${Math.round(tower.slowBonus * 100)}%`);
      if (tower.slowDurationMultiplier > 1) modifiers.push(`Slow duration ×${value(tower.slowDurationMultiplier)}`);
      if (tower.pushBonus > 0) modifiers.push(`Push +${Math.round(tower.pushBonus * 100)}%`);
      if (tower.stunChance > 0) modifiers.push(`Stun ${Math.round(tower.stunChance * 100)}%`);
      if (tower.burnDpsBonus > 0) modifiers.push(`Burn ${value(tower.burnDpsBonus)} DPS`);
      if (tower.passiveSlow > 0 || tower.auraSlow > 0) modifiers.push(`Aura slow ${Math.round((tower.passiveSlow + tower.auraSlow) * 100)}%`);
      if (tower.nearbyFireRateBonus > 0 || tower.pigeonAuraBonus > 0) modifiers.push(`Nearby speed +${Math.round(Math.max(tower.nearbyFireRateBonus, tower.pigeonAuraBonus) * 100)}%`);
      if (tower.supportPowerMultiplier > 1) modifiers.push(`Buff power ×${value(tower.supportPowerMultiplier)}`);
      if (tower.coinBonusOnStick > 0) modifiers.push(`+$${tower.coinBonusOnStick}/stick`);
      if (tower.trackingMultiplier > 1) modifiers.push(`Tracking ×${value(tower.trackingMultiplier)}`);
      if (tower.cuddleAuraRadiusMultiplier > 1) modifiers.push(`Cuddle radius ×${value(tower.cuddleAuraRadiusMultiplier)}`);
      if (tower.cuddleAuraPowerMultiplier > 1) modifiers.push(`Cuddle power ×${value(tower.cuddleAuraPowerMultiplier)}`);
      if (modifiers.length) details.push(`Upgrades: ${modifiers.join(' · ')}`);
      const bought = tower.spec.paths.flatMap((path, pathIndex) => path.tiers.slice(0, tower.ranks[pathIndex]!).map((tier) => tier.name));
      if (bought.length) details.push(`Bought: ${bought.join(' · ')}`);
      this.towerStatsLabel?.setText(details.join('\n')).setColor('#d8e5e1');
    }
    const currentUnlock = this.towerUnlockState(this.currentTowerSpec);
    // Mystery Boxes replace the normal tower roster for the full Endless
    // Mystery run and throughout Stage 4.
    const mysteryBoxReplacesRoster = this.isMysteryOnlyRun();
    this.rosterNameLabel?.setText(mysteryBoxReplacesRoster ? 'MYSTERY BOX' : 'OPEN GRID');
    const canAfford = currentUnlock.unlocked && this.coins >= this.currentTowerSpec.cost;
    this.towerButton?.setStrokeStyle(1, canAfford ? RARITY_COLOR[this.currentTowerSpec.rarity] : 0xef7e9c).setFillStyle(canAfford ? 0x202c46 : 0x302436);
    this.upgradeButtons.forEach((button, pathIndex) => {
      const tower = this.selectedTower;
      const path = (tower?.spec ?? this.currentTowerSpec).paths[pathIndex]!;
      const rank = tower?.ranks[pathIndex] ?? 0;
      const next = path.tiers[rank];
      const rankCap = tower ? towerMastery(this.registry, tower.spec.id).pathRanks[pathIndex]! : 2;
      const pathLocked = Boolean(tower?.chosenPath !== undefined && tower.chosenPath !== pathIndex);
      const unlocked = Boolean(tower && !pathLocked && rank < rankCap && next && this.coins >= this.upgradePrice(next.cost));
      this.upgradeLabels[pathIndex]?.setText(`PATH ${pathIndex + 1}\n${rank}/${rankCap}`)
        .setColor(pathLocked ? '#ef9aab' : unlocked ? '#a9e7c2' : '#a8b8b8');
      const pathColors = [0x6fc8e8, 0xc58bf0, 0xf4c86a];
      button.setFillStyle(pathLocked ? 0x302436 : unlocked ? 0x2d4b58 : 0x182733).setStrokeStyle(1, pathColors[pathIndex]!);
      if (pathLocked) button.disableInteractive();
      else if (!button.input?.enabled) button.setInteractive({ useHandCursor: true });
    });
    const chosen = this.pendingUpgrade;
    const chosenPath = chosen?.tower.spec.paths[chosen.pathIndex];
    const chosenTier = chosen && chosenPath ? chosenPath.tiers[chosen.tower.ranks[chosen.pathIndex]!] : undefined;
    this.upgradeNameButton?.setVisible(Boolean(this.selectedTower));
    this.upgradeNameLabel?.setVisible(Boolean(this.selectedTower));
    this.upgradeNameLabel?.setText(chosenTier ? chosenTier.name : this.selectedTower ? 'CHOOSE A PATH ABOVE' : 'SELECT A TOWER FIRST');
    this.upgradeNameButton?.setStrokeStyle(1, chosenTier ? [0x6fc8e8, 0xc58bf0, 0xf4c86a][chosen!.pathIndex]! : 0x607c82);
    if (this.hudGraphics && this.selectedTower) {
      this.hudGraphics.clear();
      const c = this.towerCenter(this.selectedTower.tile, this.selectedTower.spec);
      this.hudGraphics.lineStyle(0.8, COLORS.mint, 0.4).strokeCircle(c.x, c.y, BOARD.cell * this.selectedTower.spec.range * this.selectedTower.rangeMultiplier);
      this.hudGraphics.lineStyle(1, COLORS.mint, 0.9).strokeRect(BOARD.x + this.selectedTower.tile.x * BOARD.cell, BOARD.y + this.selectedTower.tile.y * BOARD.cell, BOARD.cell * this.selectedTower.spec.footprint, BOARD.cell * this.selectedTower.spec.footprint);
    } else if (this.hudGraphics && !this.placing) this.hudGraphics.clear();
    if (this.paused && this.phase !== 'victory' && this.phase !== 'defeat') this.statusLabel?.setText('PAUSED');
  }

  private phaseMessage(): string {
    if (this.phase === 'countdown') return this.wave === 1 ? `First wave in ${Math.ceil(this.countdown)}…` : `Wave ${this.wave} in ${Math.ceil(this.countdown)}…`;
    if (this.phase === 'wave') return `${WAVE_EVENT_NAMES[this.wave - 1] ?? 'Standard'} wave ${this.wave} in progress`;
    if (this.phase === 'between-waves') return `Wave ${this.wave} cleared · +$${this.lastWavePayout} · next wave in ${Math.ceil(this.betweenWaveTimer)}…`;
    if (this.phase === 'victory') return 'STAGE COMPLETE';
    if (this.phase === 'defeat') return 'BASE LOST';
    return 'Ready';
  }

  private disposeScene(): void {
    this.input.off('wheel');
    this.enemies.length = 0;
    this.towers.length = 0;
    this.towerObjects.clear();
  }
}
