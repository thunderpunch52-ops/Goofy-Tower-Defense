import type { TowerSpec, TowerUpgradePath } from './towers';

type Entry = [string, string];
const path = (name: string, entries: Entry[], costs: number[]): TowerUpgradePath => ({
  name,
  tiers: entries.map(([upgradeName, description], index) => ({ rank: index + 1, name: upgradeName, description, cost: costs[index]! })),
});

const aegis1: Entry[] = [
  ['Gravitational Anchor', 'Every 4s, pulse for 1,500 damage and drag enemies back 2 tiles.'], ['Micro-Snares', 'Drag 3.5 tiles and slow by 15% for 2s.'],
  ['Spatial Distortion', 'Pulse every 3s, damage 2,800 and hit up to 8 targets.'], ['Tear in Reality', 'Rifts teleport standard enemies 5 tiles backward on contact.'],
  ['Singularity Drag', 'Drag 6 tiles; rifts also affect Strong and Fast enemies.'], ['Void Sinkhole', 'Every 12s, swallow a standard/Fast enemy and send it 10 tiles back.'],
  ['Sub-Space Funnel', 'Rifts send enemies back 15 tiles and swallow up to 3 non-bosses.'], ['Event Horizon Rift', '8,500 damage pulse drags all non-bosses within 4 tiles.'],
  ['Wormhole Gateway', 'Black holes continuously pull nearby enemies and slow them 60% for 4s.'], ['Dimensional Fold', 'Every 40s, send a wave group (including Mini-Bosses) back 20 tiles; gain 50% of their base value as coins.'],
];
const aegis2: Entry[] = [
  ['Aegis Shielding', '8-tile dome reduces tower disable and stun duration by 20%.'], ['Reinforced Grid', 'Disable reduction 35%; nearby structures gain 10% range.'],
  ['Defensive Barrier', '10-tile dome; nearby towers gain a 150 HP shield.'], ['Hardened Shell', 'Shield capacity 300 HP and regenerates 20 HP/s out of combat.'],
  ['Harmonic Resonance', 'Disable/stun duration reduced 60%; towers gain 15% attack speed.'], ['Nullification Protocol', 'Shield capacity 600 HP; nearby towers resist enemy silence and slow.'],
  ['Aegis Core Array', '12-tile dome; nearby towers gain 25% armor penetration.'], ['Aegis Pulse', 'When a shield breaks, clear debuffs from towers within 6 tiles.'],
  ['Impenetrable Dome', 'Shield capacity 1,200 HP; blocks boss single-target disables.'], ['Sanctuary Grid', 'Nearby towers are immune to boss debuffs, stuns, laser wipes, and status anomalies.'],
];
const aegis3: Entry[] = [
  ['Heavy Gravity', 'Every 10s, slow enemies 15% in a 6-tile radius.'], ['Crushing Pressure', 'Slow 25%; shockwaves deal 800 damage.'],
  ['Armor Stress', 'Pulses permanently strip 10% of enemy Armor.'], ['Hyperarmor Disruption', 'Pulse every 7s and strip 25% Hyperarmor.'],
  ['Tidal Gravity', 'Slow 40%; 10-tile radius; deal 2,200 damage.'], ['Density Shear', 'Pulses permanently strip 50% Armor and Hyperarmor.'],
  ['Gravitational Collapse', 'Deal 5,000 damage and increase damage taken 20% for 5s.'], ['Sub-Crustal Pulse', 'Strip 75% Armor and Hyperarmor; pulse every 5s.'],
  ['Mass Nullification', 'Pulse for 10,000 damage and suppress elite passives for 3s.'], ['Singularity Slam', 'Every 30s, map-wide pulse deals 25,000 damage and removes enemy Armor for 12s.'],
];
const magma1: Entry[] = [
  ['Slag Vents', 'Coat 3 adjacent track tiles in lava for 50 Fire damage/s.'], ['Superheated Slag', 'Lava deals 120 damage/s and covers 5 track tiles.'],
  ['Armor Melting', 'Lava removes 3 Armor/s from enemies standing in it.'], ['Magma Flow', 'Cover 8 tiles; deal 280 damage/s and remove 8 Armor/s.'],
  ['Thermal Shear', 'Lava deals 500 damage/s and slows enemies 20%.'], ['Volcanic Trench', 'Cover 12 tiles; deal 900 damage/s and remove 15 Armor/s.'],
  ['Liquid Obsidian', 'Lava deals 1,600 damage/s and slows enemies 35%.'], ['Pyroclastic Surge', 'Lava deals 2,800 damage/s; deaths explode for 3,000 Fire damage nearby.'],
  ['Mantle Fracture', 'Lava deals 4,500 damage/s and removes all Armor after 2s.'], ['Obsidian Trench', 'Permanent molten lanes deal 1,200 damage/s, remove Armor, and prevent enemy speed boosts.'],
];
const magma2: Entry[] = [
  ['Focused Beam', 'Single-target beam deals 300 Fire damage/s.'], ['Thermal Accumulation', 'Beam damage ramps 10%/s on one target, up to 50%.'],
  ['Prismatic Core', 'Beam deals 800 damage/s; ramp cap 100%.'], ['Line-Cutter Beam', 'Beam pierces up to 2 aligned targets.'],
  ['Hyper-Thermal Flux', 'Beam deals 1,800 damage/s; ramps 20%/s up to 200%.'], ['Meltdown Beam', 'Pierces obstacles and hits up to 5 aligned targets.'],
  ['Plasma Lance', 'Beam deals 4,200 damage/s; ramp cap 400%.'], ['Focal Supernova', 'Beam also deals 2% of target max HP per second.'],
  ['Orbital Link', 'Infinite range; beam deals 8,500 damage/s.'], ['Solar Ray', 'Infinite-range laser ramps damage 20% each second on its target.'],
];
const magma3: Entry[] = [
  ['Scrap Recovery', 'Enemies killed in range drop 10% more coins.'], ['Thermal Radiance', 'Nearby towers gain 10% attack speed.'],
  ['Bounty Vaporizer', 'Bonus bounty 20%; aura grants 20% attack speed.'], ['Overclocked Turbines', 'Nearby towers gain 15% range and 30% attack speed.'],
  ['Slag Extraction', 'Enemies killed in aura drop 40% more coins.'], ['Heat Sync', '6-tile aura grants 45% attack speed and 20% damage.'],
  ['Alchemical Melt', 'Enemies killed anywhere drop 75% more coins.'], ['Plasma Overdrive', 'Nearby towers gain 60% attack speed; critical hits deal 30% bonus damage.'],
  ['Furnace Bounties', 'Enemies killed anywhere drop 150% more coins.'], ['Scrap Vaporizer', '6×6 aura: enemies killed inside drop 300% more coins.'],
];
const hive1: Entry[] = [
  ['Micro-Drones', 'Deploy 15 drones; each deals 50 damage per tick.'], ['Abrasive Swarm', '20 drones strip 1 Armor/s.'], ['Hyperarmor Erosion', 'Drones deal 120 damage/tick and strip 5% Hyperarmor.'],
  ['Shield Shredder', 'Drones deal double damage to shields and barriers.'], ['Expanded Hive', '35 drones strip 5 Armor/s and 15% Hyperarmor.'], ['Nanite Cloud', 'Persistent 6-tile cloud deals 350 damage/tick.'],
  ['Armor Melt', 'Cloud strips 30% Hyperarmor and drains boss shields for 500 HP/s.'], ['Apex Swarm', '50 drones deal 800 damage/tick.'], ['Disassembly Protocol', 'Nanites strip non-boss Hyperarmor after 3s contact.'], ['Apex Swarm Engine', 'Infinite nanite cloud instantly strips Hyperarmor and melts boss shields.'],
];
const hive2: Entry[] = [
  ['Bio-Harvest', 'Restore 1 Base HP per 50 enemies killed in range.'], ['Cellular Siphon', 'Restore 1 Base HP per 35 kills.'], ['Structural Growth', 'Repair adjacent towers for 25 HP/s.'],
  ['Organoid Vats', 'Restore 1 Base HP per 20 kills.'], ['Bio-Repair Array', 'Adjacent towers gain 200 HP shields and repair for 60 HP/s.'], ['Vascular Siphon', 'Restore 5 Base HP at each wave start.'],
  ['Growth Catalysts', 'Restore 1 Base HP per 10 kills.'], ['Bio-Shielding', 'Excess healing becomes up to 50 temporary Base HP.'], ['Vitality Cascade', 'Restore 15 Base HP per wave and instantly repair nearby towers when damaged.'], ['Bio-Siphon Core', 'Convert 2% of map-wide damage into Base HP, up to max health.'],
];
const hive3: Entry[] = [
  ['Spores', 'Infect targets for 30 Acid damage/s for 4s.'], ['Spore Burst', 'Infected deaths deal 200 damage within 1.5 tiles.'], ['Virulent Strain', 'Spores deal 90 damage/s; burst radius 2.5 tiles.'],
  ['Contagion Spreading', 'Spore explosions infect enemies they damage.'], ['Corrosive Spores', 'Spores deal 250 damage/s and remove 10 Armor.'], ['Epidemic', 'Burst deals 1,200 damage; execute non-bosses below 8% HP.'],
  ['Toxic Outbreak', 'Spores deal 650 damage/s; execute below 12% HP.'], ['Necrotic Catalyst', 'Deaths leave 5s acid pools dealing 1,000 damage/s.'], ['Pandemic Strain', 'Burst deals 3,500 damage; execute below 15% HP.'], ['Viral Cascade', 'Deaths leave corrosive pools and execute non-bosses below 15% max HP.'],
];
const leviathan1: Entry[] = [
  ['Hydro-Cannon', 'Every 5s, deal 2,000 damage and push non-bosses back 1 tile.'], ['Conductive Drench', 'Drench targets for 6s; Frost and Lightning deal 20% more damage.'], ['Tidal Wave', 'Push up to 10 enemies back 2 tiles.'], ['High-Pressure Jet', 'Surge every 4s and deal 4,500 damage.'],
  ['Riptide', 'Drench bonus 40%; push enemies back 3 tiles.'], ['Hydro-Cutter', 'Deal 8,000 damage, remove 20 Armor, and push Strong/Heavy enemies.'], ['Tidal Bore', 'Push all non-boss enemies in its path back 4 tiles.'],
  ['Abyssal Surge', 'Drench bonus 60%; deal 14,000 damage per wave.'], ['Deluge', 'Surge every 3s.'], ['Tsunami Gate', 'Every 20s push all non-bosses on screen back 5 tiles and permanently drench them.'],
];
const leviathan2: Entry[] = [
  ['Depth Pressure', '6-tile aura slows enemies 20%.'], ['Heavy Water', 'Slow 30%; enemies take 200 damage/s.'], ['Crushing Trench', 'Aura reduces enemy Armor by 15.'], ['Scaling Drag', 'Slow ramps to 50% while enemies stay in field.'],
  ['Deep Ocean Weight', '8-tile aura; deal 600 damage/s.'], ['Bathyal Crush', 'Slow cap 65%; deal 1% max HP/s.'], ['Abyssal Hold', 'Reduce Armor 40% and slow enemy attack animations.'], ['Trench Shear', 'Deal 2% max HP/s; slow cap 75%.'],
  ['Hadopelagic Zone', '12-tile aura; deal 2,500 damage/s.'], ['Crushing Trench', 'Reduce Armor 50%; Heavy enemies take 3% max HP/s.'],
];
const leviathan3: Entry[] = [
  ['Deep Reserves', 'Gain 3% interest on saved coins each wave, up to $300.'], ['Seafloor Mining', 'Interest 5%, up to $600.'], ['Sub-Core Dividends', 'Interest 8%, up to $1,000.'], ['Trench Bounty', 'Gain $200 for each Elite defeated.'],
  ['Hydro-Economy', 'Interest 10%, up to $1,800.'], ['Gold Rig', 'Elite bounty $500; gain $500 at wave start.'], ['Abyssal Treasury', 'Interest cap $2,800.'], ['Sub-Ocean Wealth', 'Gain $1,200 for each Mini-Boss or Boss defeated.'], ['Sovereign Vault', 'Interest 12%, up to $4,000.'], ['Deep Sea Gold Reserve', 'Interest 15%, up to $5,000; gain $1,000 at wave start.'],
];
const alchemist1: Entry[] = [
  ['Gold Touch', '2% of defeated enemies convert into bonus gold.'], ['Alchemical Melt', 'Conversion 4%; converted units drop 50% bonus gold.'], ['Transmutation Ray', 'Conversion 6%; converted payout doubled.'], ['Midas Spray', 'Attacks have 3% chance to coat targets; coated enemies drop 3× coins.'],
  ['Gilded Bounties', 'Elites and Mini-Bosses grant 150% extra coins.'], ['Gold Solidification', 'Conversion 8%; coated enemies take 20% more damage.'], ['Chrysopoeia', 'Converted targets drop 250% bonus coins.'], ['Midas Touch Array', 'Coating chance 8%; converted enemies drop immense gold piles.'], ['Alchemical Sovereign', 'Convert 12% of non-boss enemies.'], ['Midas Touch', '15% chance on hit to execute a non-boss for 500% bounty.'],
];
const alchemist2: Entry[] = [
  ['Toxic Gas', '4-tile vapor deals 40 Acid damage/s.'], ['Noxious Cloud', '6-tile vapor deals 90 damage/s.'], ['Anti-Regen Catalyst', 'Gas blocks enemy health regeneration and healing.'], ['Acidic Miasma', 'Deal 220 damage/s and remove 15 Armor.'],
  ['Necrotic Vapor', '8-tile cloud deals 500 damage/s.'], ['Plague Executioner', 'Execute non-bosses below 10% max HP.'], ['Fatal Miasma', 'Deal 1,200 damage/s; execute below 14%.'], ['Corrosive Outbreak', 'Deaths in gas deal 2,500 damage to nearby enemies.'], ['Philosopher’s Cloud', '12-tile cloud deals 3,000 damage/s.'], ['Corrosive Catalyst', '12-tile vapor deals 5,000 damage/s and executes below 20% HP.'],
];
const alchemist3: Entry[] = [
  ['Alchemical Ward', 'Adjacent towers gain shields that absorb 100 boss damage.'], ['Cost Reduction Matrix', 'Nearby tower placement and upgrade costs −10%.'], ['Hardened Elixir', 'Shield 250 HP; regenerates 25 HP/s out of combat.'], ['Transmuter’s Rebate', 'Nearby upgrade costs −20%.'],
  ['Aegis Elixir', 'Shield 500 HP and protect against enemy stuns.'], ['Alchemical Catalyst', 'Nearby upgrade costs −30%.'], ['Immortal Ward', 'Shield 1,000 HP; nearby towers deal 20% more damage.'], ['Vitality Essence', 'Shield fully restores at wave end.'], ['Grand Elixir', 'Nearby upgrade costs −40%.'], ['Philosopher’s Shield', 'Nearby towers are immune to boss destruction, disables, stuns, and laser wipes.'],
];

const championCosts = {
  aegis: [[2500, 4500, 8000, 14000, 22000, 35000, 50000, 72000, 88000, 100000], [2000, 3800, 6500, 12000, 18500, 28000, 42000, 60000, 82000, 100000], [2200, 4200, 7500, 13000, 20000, 32000, 48000, 68000, 85000, 100000]],
  prometheus: [[2800, 5000, 8500, 15000, 24000, 38000, 54000, 75000, 90000, 100000], [3200, 5800, 9500, 17000, 26000, 40000, 58000, 78000, 92000, 100000], [2200, 4000, 7000, 12500, 19000, 30000, 45000, 65000, 84000, 100000]],
  genesis: [[2400, 4500, 7800, 13500, 21000, 33000, 49000, 70000, 86000, 100000], [2000, 3800, 6800, 11500, 18000, 29000, 44000, 64000, 82000, 100000], [2600, 4800, 8200, 14000, 22500, 35000, 52000, 72000, 88000, 100000]],
  leviathan: [[2800, 5200, 8800, 15500, 24000, 37000, 54000, 74000, 89000, 100000], [2200, 4200, 7500, 13000, 20000, 32000, 48000, 68000, 85000, 100000], [3000, 5500, 9000, 16000, 25000, 38000, 55000, 75000, 90000, 100000]],
  alchemist: [[3200, 6000, 10000, 18000, 28000, 42000, 60000, 80000, 94000, 100000], [2500, 4800, 8200, 14500, 23000, 36000, 52000, 72000, 88000, 100000], [2200, 4000, 7200, 12500, 19000, 30000, 45000, 65000, 84000, 100000]],
};

export const CHAMPION_TOWERS: readonly TowerSpec[] = [
  // Champion placement prices buy end-game power: each gets a 25% boost to
  // its base attack damage, alongside the four-tile range increase.
  { id: 'aegisPrime', name: 'Aegis-Prime, The World-Engine', rarity: 'Champion', footprint: 6, cost: 10000, role: 'Area control · map distortion · defensive bastion', damage: 1500, attackRate: 0.25, range: 14, attackType: 'splash', color: 0xc8e5f4, paths: [path('Spatial Rift', aegis1, championCosts.aegis[0]), path('Absolute Bastion', aegis2, championCosts.aegis[1]), path('Event Horizon', aegis3, championCosts.aegis[2])] },
  { id: 'prometheus', name: 'Prometheus, The Core Meltdown Engine', rarity: 'Champion', footprint: 6, cost: 11000, role: 'Thermal executioner · track hazard · economic recovery', damage: 3000, attackRate: 5, range: 16, attackType: 'beam', color: 0xff793e, paths: [path('Magma Mantle', magma1, championCosts.prometheus[0]), path('Supernova Core', magma2, championCosts.prometheus[1]), path('Thermal Overdrive', magma3, championCosts.prometheus[2])] },
  { id: 'genesisWeaver', name: 'Genesis-Weaver, The Bio-Nano Hive', rarity: 'Champion', footprint: 6, cost: 10500, role: 'Bio-mechanical swarm · base healing · executing contagion', damage: 5000, attackRate: 10, range: 18, attackType: 'chain', color: 0x6af0a2, paths: [path('Nanite Swarm', hive1, championCosts.genesis[0]), path('Cellular Regeneration', hive2, championCosts.genesis[1]), path('Mutagenic Spores', hive3, championCosts.genesis[2])] },
  { id: 'leviathanSubCore', name: 'The Leviathan Sub-Core, Abyssal Engine', rarity: 'Champion', footprint: 6, cost: 12500, role: 'Tidal pushback · armor penetration · economic interest', damage: 4375, attackRate: 0.2, range: 14, attackType: 'push', color: 0x37a9dc, paths: [path('Tidal Wave Surge', leviathan1, championCosts.leviathan[0]), path('Abyssal Pressure', leviathan2, championCosts.leviathan[1]), path('Trench Harvester', leviathan3, championCosts.leviathan[2])] },
  { id: 'necroAlchemistCore', name: 'The Necro-Alchemist Core, Philosopher’s Spire', rarity: 'Champion', footprint: 6, cost: 13500, role: 'Gold transmutation · execution vapor · tower protection', damage: 2250, attackRate: 0.5, range: 14, attackType: 'burnAura', color: 0x62e38e, paths: [path('Transmutation Matrix', alchemist1, championCosts.alchemist[0]), path('Philosopher’s Plague', alchemist2, championCosts.alchemist[1]), path('Elixir of Immortality', alchemist3, championCosts.alchemist[2])] },
].map((tower, index) => ({ ...tower, id: ['aegisPrime', 'prometheus', 'genesisWeaver', 'leviathanSubCore', 'necroAlchemistCore'][index]!, cost: [10000, 11000, 10500, 12500, 13500][index]!, color: [0xc8e5f4, 0xff793e, 0x6af0a2, 0x37a9dc, 0x62e38e][index]! })) as readonly TowerSpec[];
