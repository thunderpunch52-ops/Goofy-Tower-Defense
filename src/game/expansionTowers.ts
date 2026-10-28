import type { TowerSpec, TowerUpgradePath } from './towers';

const path = (name: string, entries: Array<[string, string]>, costs: number[]): TowerUpgradePath => ({
  name,
  tiers: entries.map(([upgradeName, description], index) => ({ rank: index + 1, name: upgradeName, description, cost: costs[index]! })),
});
const commonCosts = [25, 40, 75, 110, 170, 260, 780];
const rareCosts = [50, 80, 150, 240, 380, 600, 1800];
const epicCosts = [90, 140, 270, 420, 660, 1050, 3150];
const legendaryCosts = [140, 220, 420, 680, 1080, 1720, 5160];

export const EXPANSION_TOWERS: readonly TowerSpec[] = [
  {
    id: 'bubbleBlower', name: 'Bubble Blower', rarity: 'Common', footprint: 2, cost: 150,
    role: 'Crowd control · pop splash · basic-enemy trap', damage: 5, attackRate: 1 / 1.2, range: 4, attackType: 'bubble', color: 0x75dff1,
    paths: [
      path('Heavy Suds', [['Big Bubbles', 'Bubbles grow larger and pop in a 1-tile radius.'], ['Thick Film', '+15% bubble damage.'], ['Double Pop', 'Pops hit twice for full damage.'], ['Foam Cannon', '+20% attack speed.'], ['Mega Suds', 'Pop radius +1 tile.'], ['Bubble Burst', 'Pops deal +50% damage.'], ['Bubble Bonanza', 'Bubbles can trap Strong enemies briefly.']], commonCosts),
      path('Sticky Residue', [['Slick Landing', 'Popped bubbles leave a visible puddle that slows enemies by 25% for 3 seconds.'], ['Long-Lasting Suds', 'Puddles last 50% longer.'], ['Soap Slick', 'Puddles slow by 35%.'], ['Wide Spill', 'Puddle radius +1 tile.'], ['Slippery Track', 'Puddles also apply a short 10% speed burst after the slow ends.'], ['Sticky Foam', 'Puddles can trap basic enemies briefly.'], ['Endless Suds', 'Puddles last twice as long and slow by 45%.']], commonCosts),
      path('Rapid Foam', [['Quick Pump', '+15% attack speed.'], ['Fine Nozzle', '+15% range.'], ['Foam Stack', 'Up to 3 bubble trap layers can build on one tile.'], ['Bubble Stream', '+25% attack speed.'], ['Long Shot', '+20% range.'], ['Rapid Refill', 'Bubbles travel faster and pop more quickly on contact.'], ['Foam Flood', 'Fire a rapid multi-bubble burst every 8 seconds.']], commonCosts),
    ],
  },
  {
    id: 'saltShaker', name: 'Salt Shaker', rarity: 'Common', footprint: 2, cost: 175,
    role: 'Directional cone · armor stripping · damage over time', damage: 2, attackRate: 0.5, range: 3.5, attackType: 'salt', color: 0xf2db8b,
    paths: [
      path('Corrosive Grind', [['Coarse Crystals', 'Sprays permanently strip 1 Armor, up to 5 total.'], ['Extra Pinch', '+20% cone damage and salt duration.'], ['Drying Agent', 'Armor strip cap increases by 1.'], ['Ground Salt', '+20% spray range.'], ['Heavy Crystals', 'Salt damage over time doubles.'], ['Deep Corrosion', 'Armor strip cap increases to 5 total.'], ['Salt the Earth', 'Salt spray strips up to 5 Armor immediately.']], commonCosts),
      path('Saline Burst', [['Wide Shake', '+20% cone width.'], ['Full Circle', 'Attack sprays a 360-degree radius around the tower.'], ['Salt Cloud', '+20% radius.'], ['Rapid Shake', '+20% attack speed.'], ['Heavy Shower', 'Salt damage +50%.'], ['Wide Burst', 'Radius +1 tile.'], ['Salt Cyclone', 'A full-radius salt burst triggers every 8 seconds.']], commonCosts),
      path('Dehydration', [['Thermal Salt', 'Salt-coated enemies take 15% more thermal and fire damage.'], ['Lasting Coat', 'Salt coating lasts 50% longer.'], ['Hot Crystals', 'Thermal vulnerability increases to 25%.'], ['Dry Heat', '+20% damage over time.'], ['Deep Dehydration', 'Thermal vulnerability lasts twice as long.'], ['Salt Burn', 'Coated enemies also take minor physical damage over time.'], ['Desiccation', 'A wide spray coats all enemies in the cone with thermal vulnerability.']], commonCosts),
    ],
  },
  {
    id: 'lawnAerator', name: 'Lawn Aerator', rarity: 'Common', footprint: 2, cost: 200,
    role: 'Track-adjacent melee trap · pierce · bleed', damage: 12, attackRate: 1 / 0.8, range: 2, attackType: 'aerator', color: 0x8bb976,
    paths: [
      path('Tungsten Spikes', [['Tungsten Tips', '+15% armor penetration per hit.'], ['Harder Rollers', '+20% damage.'], ['Deep Teeth', 'Pierce up to 3 light enemies.'], ['Armor Biter', '+25% armor penetration.'], ['Razor Drum', 'Damage +50%.'], ['Steel Core', 'Pierce up to 5 enemies.'], ['Tungsten Drum', 'Heavy hits ignore most flat Armor.']], commonCosts),
      path('High-RPM Motor', [['Quick Spin', '+25% attack speed.'], ['Turbo Motor', 'Double extension speed and attack frequency.'], ['Continuous Roll', '+20% attack speed.'], ['Hot Bearings', 'Damage +25%.'], ['Redline', '+30% attack speed.'], ['Rapid Extension', 'A second roller strikes adjacent route tiles.'], ['Full RPM', 'Rapidly attacks the full adjacent lane for 8 seconds.']], commonCosts),
      path('Bleed Tines', [['Barbed Teeth', 'Hits apply physical Bleed: 8 damage over 4 seconds.'], ['Long Cut', 'Bleed lasts 2 seconds longer.'], ['Deep Wound', 'Bleed damage +50%.'], ['Barbed Drum', 'Bleed can affect every pierced target.'], ['Open Wound', 'Bleeding enemies take +10% physical damage.'], ['Ragged Edge', 'Bleed damage doubles.'], ['Bloodied Lawn', 'Strikes apply a heavy bleed to all enemies on the contacted lane.']], commonCosts),
    ],
  },
  {
    id: 'deskFan', name: 'Desk Fan', rarity: 'Common', footprint: 2, cost: 180,
    role: 'Directional cone · knockback flow control', damage: 0, attackRate: 1 / 2.5, range: 5, attackType: 'fan', color: 0x9dcbd5,
    paths: [
      path('Industrial Blade', [['Hard Gust', 'Push distance increases to 1.2 tiles and affects medium-weight enemies.'], ['Sharper Air', 'Wind deals 12 damage per cycle.'], ['Bladed Draft', 'Wind deals 25 damage per cycle.'], ['Long Reach', '+20% range.'], ['Heavy Wind', 'Push distance +25%.'], ['Turbine Edge', 'Damage +50%.'], ['Industrial Gale', 'A powerful cone gust pushes and damages all eligible enemies.']], commonCosts),
      path('Oscillation', [['Wide Sweep', 'Sweeps side to side across a 90-degree cone.'], ['Fast Oscillation', '+20% attack speed.'], ['Broad Breeze', '+25% cone width.'], ['Long Oscillation', '+20% range.'], ['Crosswind', 'Hits up to 3 targets per gust.'], ['Turbine Sweep', '+25% attack speed.'], ['Room-Clearing Oscillation', 'Sweeping gust covers the full 90-degree arc.']], commonCosts),
      path('Gale Force', [['Momentum Break', 'A gust periodically resets eligible enemy movement momentum.'], ['Long Gust', '+20% range.'], ['Strong Gust', 'Resets momentum more often.'], ['Wind Wall', 'Gusts affect a wider cone.'], ['Air Pressure', 'Wind deals 25 damage per cycle.'], ['Cyclone', 'Pushes medium enemies farther.'], ['Gale Force', 'A powerful periodic gust resets momentum for enemies caught in the cone.']], commonCosts),
    ],
  },
  {
    id: 'espressoMachine', name: 'Espresso Machine', rarity: 'Rare', footprint: 2, cost: 350,
    role: 'Support aura · attack-speed and range buffs', damage: 0, attackRate: 0, range: 4, attackType: 'espresso', color: 0x9d654d,
    paths: [
      path('Double Shot', [['Extra Shot', 'Attack-speed buff increases to 20%.'], ['Double Shot', 'Attack-speed buff increases to 30% for up to 3 nearby towers.'], ['Crema', 'Buffed towers gain +10% damage.'], ['Triple Espresso', 'Aura range +20%.'], ['Caffeine Rush', 'Attack-speed buff +10 percentage points.'], ['Perfect Extraction', 'Buff up to 5 nearby towers.'], ['Double Shot Deluxe', 'Nearby towers gain +50% attack speed for 8 seconds every 20 seconds.']], rareCosts),
      path('Overclocked Steam', [['Steam Vent', 'Periodically vents visible steam that deals 25 Fire splash damage to nearby track enemies.'], ['Hotter Steam', 'Steam damage +50%.'], ['Frequent Vent', 'Steam vents twice as often.'], ['Wide Vent', 'Steam radius +1 tile.'], ['Boiling Pressure', 'Steam damage doubles.'], ['Steam Burn', 'Vents apply a short burn.'], ['Overclocked Boiler', 'A large steam blast triggers periodically.']], rareCosts),
      path('Syrup Injection', [['Sweet Range', 'Nearby towers gain +10% range.'], ['Extra Syrup', 'Range buff +5 percentage points.'], ['Wide Aura', '+20% aura range.'], ['Sticky Focus', 'Buffed towers gain +10% damage.'], ['Rich Blend', 'Range buff +10 percentage points.'], ['Syrup Network', 'Buff up to 5 nearby towers.'], ['Syrup Injection', 'Nearby towers gain +25% range and +20% attack speed.']], rareCosts),
    ],
  },
  {
    id: 'staplerTurret', name: 'Stapler Turret', rarity: 'Rare', footprint: 2, cost: 325,
    role: 'Burst projectile · pierce · Hyperarmor reduction', damage: 45, attackRate: 1, range: 5, attackType: 'pierce', color: 0xaab5bc,
    paths: [
      path('Heavy Duty Wire', [['Thick Staples', '+20% damage.'], ['Wire Feed', 'Damage increases to 85 and staples pierce up to 2 targets.'], ['Steel Cartridge', '+20% damage.'], ['Long Arm', '+20% range.'], ['Rivet Staples', 'Pierce up to 4 targets.'], ['Heavy Press', 'Damage +50%.'], ['Industrial Stapler', 'Heavy staples pierce 6 enemies and ignore 5 Armor.']], rareCosts),
      path('Rapid Tack', [['Quick Reload', '+20% attack speed.'], ['Burst Fire', 'Fires 3 staples per burst.'], ['Double Burst', '+20% attack speed.'], ['Wide Spread', 'Burst staples can select nearby targets.'], ['Quick Tack', '+30% attack speed.'], ['Staple Storm', 'Burst contains 5 staples.'], ['Rapid Tack', 'Fire a fast 8-staple burst every 6 seconds.']], rareCosts),
      path('Structural Bind', [['Soft Pin', 'Critical hits pin light enemies for 1.5 seconds.'], ['Reinforced Bind', 'Pins also reduce Hyperarmor by 5 points.'], ['Structural Bind', 'Staples reduce target Hyperarmor by 10 points.'], ['Deep Pin', 'Hyperarmor reduction lasts longer.'], ['Heavy Bind', 'Pins affect medium-weight enemies.'], ['Lockdown', 'Pinned enemies take +15% damage.'], ['Permanent Fixture', 'Every fifth hit briefly pins eligible enemies and weakens Hyperarmor.']], rareCosts),
    ],
  },
  {
    id: 'prismMirror', name: 'Prism Mirror', rarity: 'Rare', footprint: 2, cost: 400,
    role: 'Laser redirector · beam splitter', damage: 0, attackRate: 0, range: 4.5, attackType: 'prism', color: 0x87e5ea,
    paths: [
      path('Tri-Refraction', [['Tri-Refraction', 'Redirected beams split into 3 beams.'], ['Prismatic Array', 'Redirected beams hit one additional nearby target.'], ['Bright Facets', 'Reflected beams deal +10% damage.'], ['Wide Bend', 'Reflected target range +1 tile.'], ['Prismatic Burst', 'Each incoming beam can hit one extra target.'], ['Perfect Angles', 'Reflected beams deal +20% damage.'], ['Tri-Refraction Array', 'Redirected beams split into 5 beams.']], rareCosts),
      path('Focal Lens', [['Focused Light', 'Redirected beams deal +10% damage.'], ['Focal Lens', 'Redirected beam damage +20%.'], ['Hot Focus', 'Redirected beams ignore 2 Armor.'], ['Pure Spectrum', 'Beam damage +15%.'], ['Concentrated Ray', 'Redirected beams deal +30% damage.'], ['Burning Lens', 'Reflected hits apply a short burn.'], ['Singularity Focus', 'Redirected beams deal +60% damage.']], rareCosts),
      path('Polished Crystal', [['Polish', 'Reflected beam range +1 tile.'], ['Crystal Clear', 'Reflected beam range +2 tiles.'], ['Wide Refraction', 'Mirror can catch beams from farther away.'], ['Long Spectrum', 'Reflected range +1 tile.'], ['Mirror Network', 'Nearby mirrors can receive redirected beams.'], ['Bright Crystal', 'Redirected beams travel faster.'], ['Polished Crystal', 'Reflected beam range +4 tiles and split beams seek targets across the map.']], rareCosts),
    ],
  },
  {
    id: 'teslaCoilLamp', name: 'Tesla Coil Lamp', rarity: 'Epic', footprint: 4, cost: 650,
    role: 'Chain lightning · shield and armor breaker', damage: 120, attackRate: 1 / 1.8, range: 5, attackType: 'chain', color: 0xf4d66b,
    paths: [
      path('High Voltage', [['Hotter Coil', '+15% chain damage.'], ['High Voltage', 'Chain to 8 targets with no damage falloff.'], ['Long Arc', '+20% range.'], ['Lightning Rod', 'Chains seek farther targets.'], ['Superconductor', 'Ignore 4 Armor.'], ['Storm Charge', 'Chain damage +40%.'], ['Maximum Voltage', 'Chain to 12 targets at full damage.']], epicCosts),
      path('Static Supercharge', [['Static Snap', '+10% stun chance.'], ['Static Supercharge', 'Stun chained targets for 0.8 seconds.'], ['Longer Charge', 'Stun duration +25%.'], ['Conductive Field', 'Stunned targets take +15% damage.'], ['Arc Lock', 'Stuns can affect Mini-Bosses briefly.'], ['Deep Charge', 'Stun duration +50%.'], ['Lightning Cage', 'A periodic chain stuns all struck eligible enemies.']], epicCosts),
      path('Overcharge Field', [['Grounded Coil', 'Chain hits leave visible charged ground that deals secondary damage over time.'], ['Hot Ground', 'Ground damage +50%.'], ['Wide Current', 'Ground radius +1 tile.'], ['Live Wire', 'Ground lasts longer.'], ['Overcharge', 'Ground damage doubles.'], ['Chain Reaction', 'Charged ground arcs to nearby enemies.'], ['Overcharge Field', 'A large electrical field damages enemies across the route.']], epicCosts),
    ],
  },
  {
    id: 'glueCannon', name: 'Glue Cannon', rarity: 'Epic', footprint: 4, cost: 700,
    role: 'Area damage · heavy crowd control · slow', damage: 30, attackRate: 1 / 2.2, range: 4.5, attackType: 'glue', color: 0x78c47d,
    paths: [
      path('Industrial Solvent', [['Caustic Glue', 'Glue deals 40 Acid damage per second while enemies remain stuck.'], ['Hot Solvent', 'Acid damage +50%.'], ['Etching Agent', 'Acid reduces 3 Armor while active.'], ['Deep Etch', 'Acid lasts 50% longer.'], ['Caustic Pool', 'Acid damage doubles.'], ['Industrial Solvent', 'Acid pools cover a wider area.'], ['Molecular Breakdown', 'Glue pools deal heavy acid damage and strip Armor.']], epicCosts),
      path('Hardening Agent', [['Quick Set', 'Enemies remaining in glue for 3 seconds are immobilized for 2 seconds.'], ['Fast Cure', 'Immobilize duration +50%.'], ['Firm Hold', 'Glue slow increases to 60%.'], ['Deep Pool', 'Glue persists longer.'], ['Hard Lock', 'Immobilize can affect Heavy enemies briefly.'], ['Rapid Set', 'Immobilize threshold reduced to 2 seconds.'], ['Hardening Agent', 'Large pools immobilize eligible enemies on contact.']], epicCosts),
      path('Cover-All Spray', [['Wide Glob', 'Splash footprint +1 tile.'], ['Cover-All Spray', 'Expands splash footprint to a 3x3 tile area.'], ['Long Shot', '+20% range.'], ['Thick Coat', 'Slow lasts longer.'], ['Broad Coverage', 'Splash area +1 tile.'], ['Adhesive Rain', 'Fire two globs per attack.'], ['Total Coverage', 'A huge glue blast coats enemies across the route.']], epicCosts),
    ],
  },
  {
    id: 'quantumPendulum', name: 'Quantum Pendulum', rarity: 'Legendary', footprint: 4, cost: 1200,
    role: 'Time manipulation · enemy rewind utility', damage: 200, attackRate: 1 / 12, range: 6, attackType: 'pendulum', color: 0x9b83dc,
    paths: [
      path('Continuum Loop', [['Shorter Loop', 'Attack cooldown reduced to 10 seconds.'], ['Continuum Loop', 'Cooldown becomes 7 seconds and each pulse rewinds up to 3 targets.'], ['Long Swing', '+20% range.'], ['Extra Tick', '+20% attack speed.'], ['Time Stretch', 'Rewind distance +2 tiles.'], ['Pendulum Array', 'Pulse can rewind 5 targets.'], ['Infinite Loop', 'Cooldown becomes 4 seconds and pulse rewinds 6 targets.']], legendaryCosts),
      path('Paradox Blast', [['Temporal Mark', 'Rewound enemies take +25% damage for 4 seconds.'], ['Paradox Blast', 'Rewound enemies take double damage for 4 seconds.'], ['Fractured Time', 'Mark lasts 2 seconds longer.'], ['Deep Paradox', 'Marked enemies take +20% more damage.'], ['Time Shatter', 'Rewinding deals 50% extra damage.'], ['Causal Rupture', 'Marks spread a short distance to nearby enemies.'], ['Paradox Collapse', 'Rewound enemies take triple damage for 4 seconds.']], legendaryCosts),
      path('Stasis Field', [['Frozen Moment', 'Each swing pauses the next enemy wave timer for 1 second.'], ['Stasis Field', 'Each swing pauses wave timers for 3 seconds.'], ['Long Pause', 'Stasis lasts 1 second longer.'], ['Quiet Clock', 'Stasis triggers more often.'], ['Deep Stasis', 'Pause lasts 5 seconds.'], ['Temporal Shelter', 'Towers gain a brief attack-speed boost after stasis.'], ['Time Stop', 'Each swing pauses the wave timer for 8 seconds.']], legendaryCosts),
    ],
  },
];
