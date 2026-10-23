import type { TowerSpec, TowerUpgradePath } from './towers';

const path = (name: string, entries: Array<[string, string]>, costs: number[]): TowerUpgradePath => ({
  name,
  tiers: entries.map(([upgradeName, description], index) => ({ rank: index + 1, name: upgradeName, description, cost: costs[index]! })),
});
const cardboardCosts = [200, 300, 500, 800, 1200, 1950, 5800];
const sodaCosts = [90, 140, 270, 360, 660, 880, 3520];
const printerCosts = [140, 210, 410, 660, 1020, 1360, 4080];
const clawCosts = [160, 240, 480, 770, 1200, 1920, 4800];
const microwaveCosts = [270, 400, 790, 1050, 1980, 2640, 7920];
const crusherCosts = [280, 420, 820, 1100, 2050, 2720, 8160];
const trafficCosts = [250, 380, 750, 1000, 1850, 2450, 7350];

export const ADDED_TOWERS: readonly TowerSpec[] = [
  {
    id: 'cardboardFortress', name: 'Cardboard Fortress', rarity: 'Legendary', footprint: 4, cost: 2250,
    role: 'Base Support · Hybrid at combat-unit unlocks', damage: 0, attackRate: 0, range: 14, attackType: 'fortress', color: 0xc99155,
    paths: [
      path('Box Infantry', [
        ['Reinforced Tape', '+5% summon health. Box Guards and Grunts march from the exit toward the entrance, then hold 3 route tiles ahead of the nearest enemy.'], ['Recycled Strength', '+10% summon attack damage once attacks unlock.'],
        ['Cardboard Grunts', 'Deploy up to 4 visible, HP-tracked Grunts (150 HP each before upgrades) that march from the exit toward the entrance and hold 3 route tiles ahead of enemies. Each attacks for 25 physical damage per second. On enemy contact, it deals its remaining HP as collision damage and loses HP equal to the enemy’s remaining HP, reduced by its Armor.'],
        ['Sharp Flaps', 'Slashes apply 5 physical damage per second for 3 seconds; same-source bleed refreshes and does not stack.'],
        ['Box Battalion', 'Increase the limit to 8. Moving Box Guards and Grunts gain +50% march speed.'],
        ['Armored Cartons', 'Summons gain +3 flat Armor.'],
        ['Infinite Corrugated Army', 'For 25 seconds, deploy one visible, 225-HP Heavy Grunt every 2.5 seconds, up to 12. They march from exit toward entrance, deal 35 physical damage per second, and trade remaining HP on enemy contact. They despawn after the effect. Cooldown: 130 seconds.'],
      ], cardboardCosts),
      path('Delivery Drones', [
        ['Light Packaging', '+5% drone range.'], ['Air Mail', '+10% drone attack speed.'],
        ['Drone Squadron', 'Maintain up to 3 drones. Each has 100 HP, moves at 2.5 tiles/second, shoots 40 physical damage at 1.5 shots/second, and has 10-tile range.'],
        ['Precision Targeting', 'Drones inherit First, Last, Weakest, or Strongest targeting.'], ['Heavy Cargo', 'Increase the limit to 6; darts can hit up to 2 targets along the shot.'],
        ['Bomb Droppers', 'Every 8 seconds, drones drop an 80-damage bomb with 1-tile splash at their selected target.'],
        ['Global Air Freight', 'For 20 seconds, raise the limit to 12 and fill temporary slots. Temporary drones vanish afterward; normal six remain. Cooldown: 150 seconds.'],
      ], cardboardCosts),
      path('Mech-Box Artillery', [
        ['Heavy Bolts', '+5% artillery damage.'], ['Sturdy Base', '+10% artillery range.'],
        ['Deployable Turret', 'Deploy up to 2 mobile artillery turrets. Each starts with 125 HP, moves forward along the track until an enemy is within 16 tiles, then stops to attack for 120 physical damage at 0.5 shots per second. Enemies within 1 tile attack it once per second for their star-scaled Damage-to-Base value. Turrets do not block enemies.'],
        ['Shockwave Impact', 'Impacts slow enemies within 1 tile by 25% for 2 seconds.'], ['Dual Cannons', 'Fire two 120-damage shells per attack, with a 2-second attack interval.'],
        ['Fortified Bunkers', 'Permanent turrets gain +250 current and maximum HP (375 maximum total), 5 flat Armor, and 10% Hyperarmor; existing damage is preserved. Destroyed permanent turrets rebuild after 10 seconds at the nearest available route position to the entrance, retrying once per second if blocked. Temporary turrets do not rebuild.'],
        ['Cardboard Artillery Matrix', 'For 15 seconds, allow 4 pieces, deploy up to 2 temporary pieces, and grant artillery map-wide range. Cooldown: 160 seconds.'],
      ], cardboardCosts),
    ],
  },
  {
    id: 'sodaMachineMech', name: 'Soda Machine Mech', rarity: 'Rare', footprint: 2, cost: 1000,
    role: 'Single-target impact damage · coin support', damage: 110, attackRate: 0.5, range: 12, attackType: 'single', color: 0x4fc8df,
    paths: [
      path('Carbonated Payload', [
        ['Fizzy Pressure', '+5% range.'], ['Heavy Aluminium', '+10% damage.'], ['Soda Explosion', 'Direct hits also splash within 2 tiles; each affected enemy takes the hit once.'],
        ['Mentos Reaction', 'Every third shot knocks regular enemies back 2 tiles.'], ['Sticky Sweetness', 'Hits create a puddle that slows enemies by 30%.'], ['High-Pressure Soda Jet', 'Shots pierce up to 3 non-boss enemies.'],
        ['Infinite Fountain Burst', 'For 10 seconds, continuously damage and knock non-boss enemies along the lane. Cooldown: 110 seconds.'],
      ], sodaCosts),
      path('Vending Gold', [
        ['Vending Bonus', '+5% attack speed.'], ['Loose Change', 'Gain $2 coins for each tower kill.'], ['Coin Bundles', 'Generate a coin bundle every 10 seconds.'],
        ['Bulk Discount', 'Nearby towers within 4 tiles pay 10% less for upgrades.'], ['Double Bounty', 'Kills pay double bounty.'],
        ['Boss Bonus', 'Boss and Mini-Boss kills nearby generate a wave-clear coin bonus.'], ['Golden Rush', 'For 10 seconds, all-map kills yield triple coins. Cooldown: 110 seconds.'],
      ], sodaCosts),
      path('Chilled Delivery', [
        ['Cold Storage', '+5% slow duration.'], ['Chilled Start', 'Attacks slow by 15%.'], ['Extra Chill', 'Hits chill targets by 40% for 2 seconds.'],
        ['Cold Snap', 'Slowed targets take 15% more damage from physical towers.'], ['Deep Freeze', 'Every fifth hit freezes for 1 second; halve duration on Mini-Bosses, bosses are immune.'],
        ['Cold Front', 'Create a 5-tile aura that halves enemy speed.'], ['Absolute Zero', 'Freeze all eligible enemies on screen for 3 seconds. Cooldown: 120 seconds.'],
      ], sodaCosts),
    ],
  },
  {
    id: 'laserOfficePrinter', name: 'Laser Office Printer', rarity: 'Epic', footprint: 2, cost: 1800,
    role: 'Piercing line damage', damage: 75, attackRate: 1, range: 18, attackType: 'pierce', color: 0xff5368,
    paths: [
      path('Paper Jam', [
        ['Paper Feed', '+5% pierce capacity.'], ['Fast Feed', '+10% attack speed.'], ['Paper Jam', 'Every fourth shot stuns its target for 1 second.'],
        ['Full Jam', 'Stun every enemy pierced by that shot.'], ['Shredding Jam', 'Stunned enemies take continuous damage equal to 25% of the printer base DPS.'],
        ['Electric Pulse', 'A 2-tile pulse stuns for 1 second every 6 seconds.'], ['Sheet Wall', 'Fire a high-speed line across the map that damages and stuns eligible non-boss enemies. Cooldown: 120 seconds.'],
      ], printerCosts),
      path('Toner Leak', [
        ['Dark Toner', '+5% damage.'], ['Toxic Ink', 'Shots apply minor poison damage over time.'], ['Ink Trail', 'Pierced enemies leave pools dealing 15 damage per second for 3 seconds.'],
        ['Corrosive Toner', 'Pools reduce Armor by 30% while active.'], ['Ink Cloud', 'Persistent cloud reduces Armor by 50%.'], ['Stacking Poison', 'Poison stacks up to 5 times.'],
        ['Total Spill', 'An ink wave removes Armor completely from affected enemies for 6 seconds. Cooldown: 150 seconds.'],
      ], printerCosts),
      path('High-Speed Output', [
        ['Output Tune', '+5% attack speed.'], ['Wide Format', '+10% range.'], ['Rapid Print', 'Attack rate becomes 2 shots per second.'],
        ['Print Ramp', 'Attack speed ramps by 20% per second to 3x base.'], ['Twin Sheets', 'Fire 2 parallel sheets.'], ['Micro-Shockwaves', 'Shots produce small shockwaves that damage nearby enemies.'],
        ['Vapor Output', 'Attack nearly instantly for 10 seconds. Cooldown: 120 seconds.'],
      ], printerCosts),
    ],
  },
  {
    id: 'arcadeClawMachine', name: 'Arcade Claw Machine', rarity: 'Epic', footprint: 4, cost: 2100,
    role: 'Target relocation and grab utility', damage: 90, attackRate: 0.4, range: 14, attackType: 'claw', color: 0x9b67e8,
    paths: [
      path('Heavy Claw', [
        ['Reinforced Grip', '+5% grab damage.'], ['Long Reach', '+10% range.'], ['Back Toss', 'Fling eligible non-boss enemies 5 tiles backward.'],
        ['Hard Landing', 'Double landing damage and stun adjacent eligible enemies for 0.5 seconds.'], ['Heavy Lift', 'Grab Heavy enemies and Mini-Bosses; move Mini-Bosses 2 tiles. Bosses cannot be moved.'],
        ['Armor Crusher', 'Successful direct grabs remove Armor for 5 seconds. Refresh only; do not stack or reduce below the game-wide minimum.'],
        ['Grand Prize', 'Once per wave, return the highest-HP non-boss enemy in range to the entrance; cannot affect bosses or Mini-Bosses.'],
      ], clawCosts),
      path('Prize Drop', [
        ['Prize Aura', '+5% aura radius.'], ['Quick Fingers', 'Nearby towers gain +10% attack speed.'], ['Token Payout', 'Each grab grants $5 coins.'],
        ['Lucky Grab', 'Buffed towers gain +15% critical chance.'], ['Triple Payout', 'Defeated enemies pay triple bounty.'],
        ['Permanent Prize', 'Nearby towers within 4 tiles gain +50% damage for the rest of the run. Multiple machines do not stack this on one tower.'],
        ['Arcade Rush', 'All towers gain unlimited range and double attack speed for 8 seconds. Cooldown: 90 seconds.'],
      ], clawCosts),
      path('Prize Wave', [
        ['Long Stun', '+5% stun duration.'], ['Wide Burst', '+10% blast radius.'], ['Prize Shockwave', 'Release a shockwave that stuns nearby enemies for 1 second.'],
        ['Fractured Route', 'Shockwave slows affected enemies by 35%.'], ['Heavy Drop', 'Tremor deals 50% of claw drop damage.'],
        ['Track Tremor', 'Shockwave travels along the entire route.'], ['Full-Screen Prize Wave', 'Damage and stun eligible enemies on screen. Cooldown: 100 seconds.'],
      ], clawCosts),
    ],
  },
  {
    id: 'sentientMicrowaveOven', name: 'Sentient Microwave Oven', rarity: 'Legendary', footprint: 4, cost: 3300,
    role: 'Area thermal damage over time', damage: 140, attackRate: 1.5, range: 10, attackType: 'burnAura', color: 0xff843d,
    paths: [
      path('Nuclear Meltdown', [
        ['Hotter Core', '+5% thermal damage.'], ['Wide Heating', '+10% radius.'], ['Lingering Burn', 'Burn damage per second +50% and duration becomes 8 seconds.'],
        ['Armor Melt', 'Targets in the aura have Armor reduced by 50%.'], ['Stacking Burn', 'Burn stacks up to 8 times.'], ['Hyperarmor Meltdown', 'Reduce positive Hyperarmor to 0.'],
        ['Nuclear Meltdown', 'At 8 stacks, double Tier 6 burn DPS and burn bosses without bypassing boss crowd-control immunity. Cooldown: 150 seconds.'],
      ], microwaveCosts),
      path('Popcorn Overload', [
        ['Popcorn Spread', '+5% blast radius.'], ['Faster Heating', '+10% attack speed.'], ['Kernel Burst', 'Every third pulse explodes against all targets in range.'],
        ['Bleeding Kernels', 'Explosions apply a 4-second bleed.'], ['Twin Pops', 'Each explosion creates two secondary explosions.'], ['Chain Pop', 'Explosions chain to adjacent targets.'],
        ['Maximum Popcorn', 'Deal 30% of current HP to eligible enemies on screen, capped at 10% of a boss’s maximum HP per activation. Cooldown: 160 seconds.'],
      ], microwaveCosts),
      path('Electromagnetic Interference', [
        ['Static Charge', '+5% stun chance.'], ['Heat Haze', 'Aura slows by 25%.'], ['Electric Shock', 'Every 5 seconds stun enemies in range for 1 second.'],
        ['Interference Window', 'Stunned targets take +30% damage from all sources.'], ['Mini-Boss Disruption', 'Mini-Bosses can be stunned for 1 second, subject to resistance.'],
        ['Signal Lock', 'Aura locks eligible enemies for 1.5 seconds every 8 seconds.'], ['Blackout', 'Map-wide stun and damage pulse for 4 seconds. Cooldown: 180 seconds.'],
      ], microwaveCosts),
    ],
  },
  {
    id: 'hydraulicCarCrusher', name: 'Hydraulic Car Crusher', rarity: 'Legendary', footprint: 4, cost: 3400,
    role: 'Area physical crushing', damage: 500, attackRate: 1 / 6.5, range: 3.5, attackType: 'teddy', color: 0xe75f55,
    paths: [
      path('Absolute Demolition', [
        ['Faster Press', '+5% cooldown speed.'], ['Heavier Plate', '+10% damage.'], ['Armor-Piercing Plate', 'Deal massive Armor-ignoring damage.'],
        ['Execution Plate', 'Execute non-boss enemies below 25% HP.'], ['Boss Buster', 'Deal 3.5x damage to bosses and Heavy enemies.'],
        ['Permanent Dent', 'Each hit reduces boss Armor by 5 for the rest of the run, stacking up to 5 times per boss.'],
        ['Absolute Demolition', 'For 8 seconds, instantly crush non-boss enemies caught by a descent and deal 3.5x normal damage to bosses. Cooldown: 180 seconds.'],
      ], crusherCosts),
      path('Seismic Shockwave', [
        ['Broad Tremor', '+5% radius.'], ['Impact Force', '+10% damage.'], ['Seismic Stun', 'Activation stuns nearby enemies for 1.5 seconds.'],
        ['Cracked Track', 'Affected route slows enemies by 45%.'], ['Shockwave Damage', 'Nearby shockwave deals 60% of plate damage.'],
        ['Track-Length Tremor', 'Shockwave travels along the entire track.'], ['Earthquake', 'Screen-wide stun and damage. Cooldown: 170 seconds.'],
      ], crusherCosts),
      path('Automated Conveyor Line', [
        ['Faster Conveyor', '+10% cooldown speed.'], ['Wide Trigger', '+5% trigger area.'], ['Rapid Press', 'Reduce cooldown by 45%.'],
        ['Double Plate', 'Drop 2 secondary small plates.'], ['Conveyor Overdrive', 'Reduce cooldown by another 35%.'], ['Triple Plate', 'Drop 3 heavy plates per activation.'],
        ['Continuous Press', 'Press with near-zero cooldown for 15 seconds. Cooldown: 180 seconds.'],
      ], crusherCosts),
    ],
  },
  {
    id: 'sentientTrafficLight', name: 'Sentient Traffic Light', rarity: 'Legendary', footprint: 2, cost: 3100,
    role: 'Cycling aura support · damage · control', damage: 15, attackRate: 1, range: 10, attackType: 'trafficLight', color: 0x57d987,
    paths: [
      path('Red Light', [
        ['Wide Red', '+5% radius.'], ['Long Red', '+10% Red-mode duration.'], ['Stop Signal', 'Red mode holds eligible enemies for 3 seconds.'],
        ['Traffic Penalty', 'Held enemies take +25% damage from all towers.'], ['Extended Red', 'Red-mode duration becomes 5 seconds.'],
        ['Mini-Boss Stop', 'Hold Mini-Bosses for 1.5 seconds; bosses are immune.'], ['Red Alert', 'Freeze eligible non-boss enemies for 10 seconds. Cooldown: 140 seconds.'],
      ], trafficCosts),
      path('Green Light', [
        ['Wide Green', '+5% radius.'], ['Long Green', '+10% Green-mode duration.'], ['Go Signal', 'During Green mode, aura grants towers +30% range and +20% attack speed for 3 seconds per cycle.'],
        ['Critical Green', 'Buffed towers gain +15% critical chance.'], ['Extended Green', 'Green-mode duration becomes 5 seconds.'],
        ['Rhythm Bonus', 'Double the Green-mode speed bonus on every other Green activation.'], ['Green Wave', 'All towers gain +100% attack speed and unlimited range for 12 seconds. Cooldown: 130 seconds.'],
      ], trafficCosts),
      path('Yellow Light', [
        ['Wide Yellow', '+5% radius.'], ['Caution', 'Enemies entering the aura are slowed by 25%.'],
        ['Road Hazard', 'During Yellow mode, affected enemies are slowed by 50% and take +20% damage for 3 seconds per cycle.'],
        ['Exposed Signal', 'Reduce positive enemy Hyperarmor by 20 percentage points.'], ['Extended Yellow', 'Yellow-mode duration becomes 5 seconds.'],
        ['Wrong Way', 'Affected enemies occasionally move backward 1 route tile; bosses and Mini-Bosses are exempt.'],
        ['Full Caution', 'All enemies on screen move at 10% speed and take double damage for 10 seconds. Cooldown: 150 seconds.'],
      ], trafficCosts),
    ],
  },
];
