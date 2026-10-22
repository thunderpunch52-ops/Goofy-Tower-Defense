export type TowerRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type TowerAttackType = 'single' | 'push' | 'splash' | 'sticky' | 'supportLaser' | 'trap' | 'chain' | 'burnAura' | 'beam' | 'freeze' | 'pierce' | 'teddy' | 'roomba' | 'claw' | 'trafficLight' | 'fortress';
export interface UpgradeTier { rank: number; name: string; cost: number; description: string }
export interface TowerUpgradePath { name: string; tiers: UpgradeTier[] }
export interface TowerSpec { id: string; name: string; rarity: TowerRarity; footprint: number; cost: number; role: string; damage: number; attackRate: number; range: number; attackType: TowerAttackType; color: number; paths: TowerUpgradePath[] }
import { ADDED_TOWERS } from './addedTowers';

const ORIGINAL_TOWERS = [
  {
    "id": "lawnDartGnome",
    "name": "Lawn Dart Gnome",
    "rarity": "Common",
    "footprint": 2,
    "cost": 300,
    "role": "Single-target ranged damage",
    "damage": 15,
    "attackRate": 1.0,
    "range": 14,
    "attackType": "single",
    "color": 7914660,
    "paths": [
      {
        "name": "Sharp Shooter (Precision & Crits)",
        "tiers": [
          {
            "rank": 1,
            "name": "Sharper Tips",
            "cost": 30,
            "description": "+5% Damage"
          },
          {
            "rank": 2,
            "name": "Aerodynamic Flights",
            "cost": 40,
            "description": "+10% Range"
          },
          {
            "rank": 3,
            "name": "Pointed Precision",
            "cost": 90,
            "description": "Every 4th shot automatically deals double damage"
          },
          {
            "rank": 4,
            "name": "Heavy Brass Tips",
            "cost": 120,
            "description": "Crits automatically slow enemies by 20% for 1s"
          },
          {
            "rank": 5,
            "name": "Piercing Dart",
            "cost": 180,
            "description": "Darts passively pierce through 2 targets"
          },
          {
            "rank": 6,
            "name": "Eagle-Eyed Gnome",
            "cost": 240,
            "description": "Crit chance passively increases to 50%"
          },
          {
            "rank": 7,
            "name": "Sniper Gnome",
            "cost": 960,
            "description": "Gains passive infinite range and can hit anywhere on the map. Darts continuously deal massive armor-ignoring damage on crits."
          }
        ]
      },
      {
        "name": "Heavy Thrower (Knockback & Stun)",
        "tiers": [
          {
            "rank": 1,
            "name": "Firm Grip",
            "cost": 30,
            "description": "+5% Attack Speed"
          },
          {
            "rank": 2,
            "name": "Weighted Fins",
            "cost": 40,
            "description": "+10% Damage"
          },
          {
            "rank": 3,
            "name": "Heavy Metal Darts",
            "cost": 90,
            "description": "Shots passively push small enemies back slightly"
          },
          {
            "rank": 4,
            "name": "Concussion Tip",
            "cost": 120,
            "description": "Every 3rd dart automatically stuns the primary target for 0.5s"
          },
          {
            "rank": 5,
            "name": "Shatter-Proof Ceramic",
            "cost": 180,
            "description": "Shots deal passive +50% damage against armored targets"
          },
          {
            "rank": 6,
            "name": "Ground Pounder",
            "cost": 290,
            "description": "Stun duration increased to 1.5s; automatically affects adjacent enemies"
          },
          {
            "rank": 7,
            "name": "Titan’s Javelin",
            "cost": 720,
            "description": "Continuously throws giant iron spears that pin enemies to the ground and stun in a wide radius"
          }
        ]
      },
      {
        "name": "Lawn Decor Swarm (Multi-Target & Traps)",
        "tiers": [
          {
            "rank": 1,
            "name": "Redder Hat",
            "cost": 30,
            "description": "+5% Range"
          },
          {
            "rank": 2,
            "name": "Quick Draw",
            "cost": 40,
            "description": "+10% Attack Speed"
          },
          {
            "rank": 3,
            "name": "Double Dart",
            "cost": 60,
            "description": "Passively throws 2 darts at once toward separate targets"
          },
          {
            "rank": 4,
            "name": "Lawn Spikes",
            "cost": 100,
            "description": "Landed darts passively stick in the ground, dealing minor hazard damage to enemies passing over"
          },
          {
            "rank": 5,
            "name": "Gnome Battalion",
            "cost": 150,
            "description": "Passively throws 3 darts simultaneously"
          },
          {
            "rank": 6,
            "name": "Yard Guard",
            "cost": 240,
            "description": "Automatically leaves lingering spike traps on every kill"
          },
          {
            "rank": 7,
            "name": "Gnome Army Invasion",
            "cost": 720,
            "description": "Automatically and periodically spawns mini-gnomes that run down the track and detonate on enemy contact"
          }
        ]
      }
    ]
  },
  {
    "id": "leafBlowerGuy",
    "name": "Leaf Blower Guy",
    "rarity": "Common",
    "footprint": 2,
    "cost": 350,
    "role": "Pushback and crowd control",
    "damage": 2,
    "attackRate": 2.0,
    "range": 6,
    "attackType": "push",
    "color": 9881994,
    "paths": [
      {
        "name": "Hurricane Force (Heavy Pushback)",
        "tiers": [
          {
            "rank": 1,
            "name": "Clean Filter",
            "cost": 30,
            "description": "+5% Push Distance"
          },
          {
            "rank": 2,
            "name": "Wider Nozzle",
            "cost": 50,
            "description": "+10% Cone Angle"
          },
          {
            "rank": 3,
            "name": "Gale Force",
            "cost": 70,
            "description": "Blows enemies 30% further back"
          },
          {
            "rank": 4,
            "name": "Turboblower",
            "cost": 120,
            "description": "Attacks 25% faster"
          },
          {
            "rank": 5,
            "name": "Jet Engine Nozzle",
            "cost": 210,
            "description": "Blows away lighter enemies entirely; pushes heavy enemies back consistently"
          },
          {
            "rank": 6,
            "name": "Tornado Blast",
            "cost": 340,
            "description": "Every 8 seconds, emits a cone blast that pushes non-Boss enemies to the cone edge, stuns them for 1 second, and deals damage equal to 20% of current HP (cannot kill). Bosses take the damage but are unaffected by the slow due to CC immunity."
          },
          {
            "rank": 7,
            "name": "Category 5 Hurricane",
            "cost": 1120,
            "description": "Continuously blows enemies in a wide cone within its attack range backward, pushing them away from the exit toward the entrance."
          }
        ]
      },
      {
        "name": "Mulch & Trash (Debris & Damage)",
        "tiers": [
          {
            "rank": 1,
            "name": "Extra Gasoline",
            "cost": 30,
            "description": "+5% Attack Speed"
          },
          {
            "rank": 2,
            "name": "Dusty Intake",
            "cost": 50,
            "description": "Passively applies minor burn/itch DOT"
          },
          {
            "rank": 3,
            "name": "Leaf Shredder",
            "cost": 90,
            "description": "Rips foliage; blows sharp debris that deals continuous area damage"
          },
          {
            "rank": 4,
            "name": "Twig Shrapnel",
            "cost": 120,
            "description": "Debris automatically applies a bleed effect for 3s"
          },
          {
            "rank": 5,
            "name": "Compost Launcher",
            "cost": 210,
            "description": "Blows heavy compost clumps that deal heavy impact damage and slow"
          },
          {
            "rank": 6,
            "name": "Toxic Mulch",
            "cost": 340,
            "description": "Debris passively lowers enemy armor by 30%"
          },
          {
            "rank": 7,
            "name": "Debris Vortex",
            "cost": 840,
            "description": "Passively creates a swirling storm of lawn trash that shreds and pushes back all surrounding enemies"
          }
        ]
      },
      {
        "name": "Noise Pollution (Debuffs & Stuns)",
        "tiers": [
          {
            "rank": 1,
            "name": "Ergonomic Strap",
            "cost": 30,
            "description": "+5% Range"
          },
          {
            "rank": 2,
            "name": "Loud Motor",
            "cost": 50,
            "description": "Passive attack speed reduction for nearby enemies"
          },
          {
            "rank": 3,
            "name": "Ear-Splitting Decibels",
            "cost": 90,
            "description": "Enemies caught in the cone are disoriented, walking 25% slower"
          },
          {
            "rank": 4,
            "name": "Engine Backfire",
            "cost": 140,
            "description": "Automatically emits an occasional loud pop that stuns nearby enemies for 1s"
          },
          {
            "rank": 5,
            "name": "Exhaust Fumes",
            "cost": 180,
            "description": "Passively leaves behind a cloud of smoke; the smoke is visual only and does not change enemy accuracy or evasion."
          },
          {
            "rank": 6,
            "name": "Deafening Roar",
            "cost": 280,
            "description": "Noise disorients enemies into occasionally walking backward"
          },
          {
            "rank": 7,
            "name": "Sonic Boom Blower",
            "cost": 1120,
            "description": "Periodically emits sonic waves that hit all enemies on screen, stun them for 1.5 seconds, and apply a 25% slow for the rest of each enemy’s lifespan."
          }
        ]
      }
    ]
  },
  {
    "id": "waterBalloonSlingshot",
    "name": "Water Balloon Slingshot",
    "rarity": "Common",
    "footprint": 4,
    "cost": 500,
    "role": "Splash damage",
    "damage": 22,
    "attackRate": 0.6,
    "range": 18,
    "attackType": "splash",
    "color": 7063528,
    "paths": [
      {
        "name": "Mega Splash (AoE Size & Damage)",
        "tiers": [
          {
            "rank": 1,
            "name": "Stretchy Rubber",
            "cost": 40,
            "description": "+5% Range"
          },
          {
            "rank": 2,
            "name": "Bigger Balloons",
            "cost": 60,
            "description": "+10% blast area size"
          },
          {
            "rank": 3,
            "name": "Splash Zone",
            "cost": 150,
            "description": "Blast area permanently increased by 50% while retaining a square shape"
          },
          {
            "rank": 4,
            "name": "Soaking Wet",
            "cost": 200,
            "description": "Splash hits apply WET for 3s, making enemies take 25% more electric/freeze damage"
          },
          {
            "rank": 5,
            "name": "Balloon Barrage",
            "cost": 250,
            "description": "Passively launches 2 balloons at once"
          },
          {
            "rank": 6,
            "name": "Tidal Wave Balloon",
            "cost": 480,
            "description": "Splash reaches track intersections only when they are inside this tower’s attack range."
          },
          {
            "rank": 7,
            "name": "Tsunami Launchpad",
            "cost": 1200,
            "description": "Continuously launches massive water bladders that hit a 32 × 40 rectangle. A damaging wave pulses every 2 seconds and deals 60 damage to each enemy hit per pulse."
          }
        ]
      },
      {
        "name": "Freezing Water (Slow & Freeze)",
        "tiers": [
          {
            "rank": 1,
            "name": "Chilled Water",
            "cost": 40,
            "description": "+5% Slow Duration"
          },
          {
            "rank": 2,
            "name": "Ice Cubes Inside",
            "cost": 60,
            "description": "+10% Damage"
          },
          {
            "rank": 3,
            "name": "Ice Pack Splash",
            "cost": 120,
            "description": "Enemies caught in the splash are passively slowed by 30%"
          },
          {
            "rank": 4,
            "name": "Frostbite Balloons",
            "cost": 200,
            "description": "Passively deals bonus damage to slowed enemies"
          },
          {
            "rank": 5,
            "name": "Deep Freeze",
            "cost": 300,
            "description": "Direct balloon hits automatically freeze target solid for 1s"
          },
          {
            "rank": 6,
            "name": "Sub-Zero Slingshot",
            "cost": 480,
            "description": "Splash area passively leaves behind a freezing puddle for 3s"
          },
          {
            "rank": 7,
            "name": "Absolute Zero Launcher",
            "cost": 1200,
            "description": "Continuously launches flash-freezing water balloons that freeze all hit enemies into shatterable ice"
          }
        ]
      },
      {
        "name": "Paint Balloons (Damage Amplification)",
        "tiers": [
          {
            "rank": 1,
            "name": "Bright Pigment",
            "cost": 40,
            "description": "+5% Damage"
          },
          {
            "rank": 2,
            "name": "Faster Elastic",
            "cost": 60,
            "description": "+10% Attack Speed"
          },
          {
            "rank": 3,
            "name": "Paint Splash",
            "cost": 120,
            "description": "Applies negative hyperarmor so splattered enemies take 15% more damage from all other towers"
          },
          {
            "rank": 4,
            "name": "Sticky Dye",
            "cost": 160,
            "description": "Paint passively lingers on enemies for 6s"
          },
          {
            "rank": 5,
            "name": "Rainbow Explosion",
            "cost": 250,
            "description": "Mixes colors; each balloon hit automatically applies random minor debuffs"
          },
          {
            "rank": 6,
            "name": "Neon Splatter",
            "cost": 400,
            "description": "Painted enemies currently marked by this tower take 25% more damage from all sources. The bonus ends when the paint mark expires and does not stack."
          },
          {
            "rank": 7,
            "name": "Masterpiece Barrage",
            "cost": 1600,
            "description": "Continuously coats the wave in glowing paint. Every enemy that appears during that wave takes double damage from all towers for that wave. This vulnerability does not stack above 2× total damage taken."
          }
        ]
      }
    ]
  },
  {
    "id": "stickyBubblegumDispenser",
    "name": "Sticky Bubblegum Dispenser",
    "rarity": "Common",
    "footprint": 2,
    "cost": 400,
    "role": "Path slow and hazards",
    "damage": 3,
    "attackRate": 0.8,
    "range": 10,
    "attackType": "sticky",
    "color": 15170485,
    "paths": [
      {
        "name": "Extra Sticky (Maximum Slow)",
        "tiers": [
          {
            "rank": 1,
            "name": "Chewy Formula",
            "cost": 40,
            "description": "+5% Slow Effect"
          },
          {
            "rank": 2,
            "name": "Larger Globs",
            "cost": 50,
            "description": "+10% Goo Duration"
          },
          {
            "rank": 3,
            "name": "Super Glue Gum",
            "cost": 100,
            "description": "Enemies walking over gum are passively slowed by 50%"
          },
          {
            "rank": 4,
            "name": "Gum Traps",
            "cost": 130,
            "description": "Gum passively stays on the track for twice as long"
          },
          {
            "rank": 5,
            "name": "Immobilizing Wad",
            "cost": 290,
            "description": "Small enemies automatically get stuck completely for 1.5s"
          },
          {
            "rank": 6,
            "name": "Asphalt Adhesive",
            "cost": 390,
            "description": "Slow is 60% for regular enemies and 35% for heavy enemies."
          },
          {
            "rank": 7,
            "name": "The Permanently Stuck Path",
            "cost": 1280,
            "description": "Coats 10 track tiles with hyper-adhesive gum. Each gum tile can stop one enemy for the rest of its lifespan. Bosses are not affected."
          }
        ]
      },
      {
        "name": "Bubble Burst (Explosive Damage)",
        "tiers": [
          {
            "rank": 1,
            "name": "Sugary Core",
            "cost": 40,
            "description": "+5% Blast Radius"
          },
          {
            "rank": 2,
            "name": "High Pressure",
            "cost": 50,
            "description": "+10% Range"
          },
          {
            "rank": 3,
            "name": "Bubble Pop",
            "cost": 100,
            "description": "Gum wads automatically inflate and burst on contact, dealing splash damage"
          },
          {
            "rank": 4,
            "name": "Giant Bubbles",
            "cost": 190,
            "description": "Bubbles automatically capture small enemies inside them, trapping them until popped"
          },
          {
            "rank": 5,
            "name": "Acidic Sugar",
            "cost": 200,
            "description": "Goo passively deals damage over time to stuck enemies"
          },
          {
            "rank": 6,
            "name": "Chain Reaction",
            "cost": 320,
            "description": "Popping a bubble automatically triggers adjacent bubbles to explode"
          },
          {
            "rank": 7,
            "name": "Giga-Bubble Apocalypse",
            "cost": 960,
            "description": "Creates screen-wide giant bubbles that trap enemy groups and pop for massive damage. Each pop deals damage equal to 20% of the target’s maximum health; total damage from this upgrade is capped at 40% of each enemy’s maximum health per wave."
          }
        ]
      },
      {
        "name": "Flavor Craze (Buffs & Debuffs)",
        "tiers": [
          {
            "rank": 1,
            "name": "Fruit Flavor",
            "cost": 40,
            "description": "+5% Attack Speed"
          },
          {
            "rank": 2,
            "name": "Double Coin Dispense",
            "cost": 50,
            "description": "Passively generates small cash bonus when enemies step on gum"
          },
          {
            "rank": 3,
            "name": "Spearmint Chill",
            "cost": 100,
            "description": "Passively chills enemies, slowing their attack/ability speeds"
          },
          {
            "rank": 4,
            "name": "Cinnamon Burn",
            "cost": 130,
            "description": "Spicy gum automatically deals continuous fire damage"
          },
          {
            "rank": 5,
            "name": "Sour Shock",
            "cost": 240,
            "description": "Acidic flavor passively strips 25% of enemy armor"
          },
          {
            "rank": 6,
            "name": "Taste Explosion",
            "cost": 390,
            "description": "Goo continuously and automatically cycles through effects: burn, slow, or armor shred"
          },
          {
            "rank": 7,
            "name": "Everlasting Gobstopper",
            "cost": 960,
            "description": "Drops a flavor item onto the track that remains for the rest of the game. Any enemy that stops on it receives the effects of Path 2 Tiers 3, 4, and 5 simultaneously."
          }
        ]
      }
    ]
  },
  {
    "id": "angryPigeon",
    "name": "Angry Pigeon",
    "rarity": "Common",
    "footprint": 2,
    "cost": 300,
    "role": "Rapid single-target peck",
    "damage": 3,
    "attackRate": 4.5,
    "range": 5,
    "attackType": "single",
    "color": 11134914,
    "paths": [
      {
        "name": "Rapid Pecking (Extreme Attack Speed)",
        "tiers": [
          {
            "rank": 1,
            "name": "Extra Seeds",
            "cost": 30,
            "description": "+5% Attack Speed"
          },
          {
            "rank": 2,
            "name": "Sharper Beak",
            "cost": 40,
            "description": "+10% Damage"
          },
          {
            "rank": 3,
            "name": "Hyper Peck",
            "cost": 80,
            "description": "Sets attack speed to 2× the base rate."
          },
          {
            "rank": 4,
            "name": "Frenzied Feathers",
            "cost": 120,
            "description": "While continuously attacking the same target, attack speed increases by 25% per second, up to 3× the base rate after 4 seconds. The ramp resets when the target changes."
          },
          {
            "rank": 5,
            "name": "Turbo Beak",
            "cost": 180,
            "description": "Sets sustained attack speed to 4× the base rate and raises the same-target ramp maximum to 6× the base rate."
          },
          {
            "rank": 6,
            "name": "Sonic Pecking",
            "cost": 240,
            "description": "Attacks so fast it passively creates micro-shockwaves"
          },
          {
            "rank": 7,
            "name": "Peck-Pocalypse",
            "cost": 960,
            "description": "Passively attacks at a blinding, near-instantaneous rate, vaporizing single targets"
          }
        ]
      },
      {
        "name": "Flock Leader (Swarm Minions)",
        "tiers": [
          {
            "rank": 1,
            "name": "Breadcrumb Bait",
            "cost": 30,
            "description": "+5% Range"
          },
          {
            "rank": 2,
            "name": "Loud Coo",
            "cost": 40,
            "description": "Passively buffs nearby Pigeons' speed by 10%"
          },
          {
            "rank": 3,
            "name": "Pigeon Flock",
            "cost": 90,
            "description": "Passively spawns 2 permanent helper pigeons to peck adjacent targets"
          },
          {
            "rank": 4,
            "name": "Coo-pment",
            "cost": 120,
            "description": "Nearby bird-type towers, including placed and summoned Pigeons and future bird towers, gain +20% range"
          },
          {
            "rank": 5,
            "name": "City Swarm",
            "cost": 150,
            "description": "Passively maintains 4 flying pigeons that continuously patrol the nearby path"
          },
          {
            "rank": 6,
            "name": "Pigeon Commander",
            "cost": 290,
            "description": "Summoned pigeon damage increases by 50%."
          },
          {
            "rank": 7,
            "name": "Feathered Armada",
            "cost": 960,
            "description": "For 6 seconds, summons two 30-damage pigeons each second to attack all enemies. Tier 6 helpers remain active. Cooldown: 85 seconds."
          }
        ]
      },
      {
        "name": "Guano Bombardment (Aoe / Armor Shred)",
        "tiers": [
          {
            "rank": 1,
            "name": "High Perch",
            "cost": 30,
            "description": "+10% Range"
          },
          {
            "rank": 2,
            "name": "Heavy Drop",
            "cost": 40,
            "description": "+5% Damage"
          },
          {
            "rank": 3,
            "name": "Guano Splat",
            "cost": 80,
            "description": "Pigeon periodically drops guano on enemies within its attack range, reducing armor."
          },
          {
            "rank": 4,
            "name": "Slippery Splat",
            "cost": 120,
            "description": "Guano within the Pigeon's attack range causes enemies to slip, moving briefly in reverse."
          },
          {
            "rank": 5,
            "name": "Corrosive Drop",
            "cost": 180,
            "description": "Guano within the Pigeon's attack range passively reduces enemy Armor by 50%."
          },
          {
            "rank": 6,
            "name": "Toxic Droppings",
            "cost": 240,
            "description": "Guano within the Pigeon's attack range leaves toxic pools that deal 10 damage per second for 3 seconds. Damage from these pools stacks up to 3 times per enemy."
          },
          {
            "rank": 7,
            "name": "Statue’s Nightmare",
            "cost": 720,
            "description": "Passively rains corrosive guano within the Pigeon's attack range, completely removing enemy armor."
          }
        ]
      }
    ]
  },
  {
    "id": "discoTurret",
    "name": "Disco Turret",
    "rarity": "Rare",
    "footprint": 4,
    "cost": 1100,
    "role": "Attack-speed support and multi-laser",
    "damage": 12,
    "attackRate": 1.5,
    "range": 12,
    "attackType": "supportLaser",
    "color": 15323997,
    "paths": [
      {
        "name": "Boogie Fever (Tower Buff Specialist)",
        "tiers": [
          {
            "rank": 1,
            "name": "Shiny Facets",
            "cost": 90,
            "description": "+5% Aura Range"
          },
          {
            "rank": 2,
            "name": "Rhythm Bass",
            "cost": 140,
            "description": "+5% Speed Buff"
          },
          {
            "rank": 3,
            "name": "Dance Floor",
            "cost": 220,
            "description": "Aura passively boosts nearby towers' attack speed by 25%"
          },
          {
            "rank": 4,
            "name": "Groove Boost",
            "cost": 360,
            "description": "Buffed towers gain passive +10% Critical Strike Chance"
          },
          {
            "rank": 5,
            "name": "Overdrive Tempo",
            "cost": 550,
            "description": "Automatically and periodically doubles the speed buff on an automated rhythm timer"
          },
          {
            "rank": 6,
            "name": "Spotlight Buff",
            "cost": 1540,
            "description": "Passively targets the strongest nearby tower with a persistent +100% damage buff"
          },
          {
            "rank": 7,
            "name": "Studio 54 Legend",
            "cost": 2640,
            "description": "Grants +75% attack speed and unlimited range to towers within 35 tiles. Other Disco Turrets do not receive this buff."
          }
        ]
      },
      {
        "name": "Laser Light Show (Laser Damage)",
        "tiers": [
          {
            "rank": 1,
            "name": "Polished Chrome",
            "cost": 90,
            "description": "+5% Laser Damage"
          },
          {
            "rank": 2,
            "name": "Faster Rotation",
            "cost": 140,
            "description": "+10% Attack Speed"
          },
          {
            "rank": 3,
            "name": "Quad-Laser",
            "cost": 220,
            "description": "Adds lasers firing from all four cardinal directions simultaneously. The 1.5 pulses/sec rate is shared across all four beams. Each beam can hit only one enemy at a time."
          },
          {
            "rank": 4,
            "name": "Prism Splitter",
            "cost": 360,
            "description": "Lasers split into two beams on hit. Each beam deals half damage and can hit an additional enemy; for example, 50 damage to one enemy becomes 25 damage to each of two enemies."
          },
          {
            "rank": 5,
            "name": "Neon Lasers",
            "cost": 550,
            "description": "Laser damage automatically ramps up the longer an enemy stays in the beam"
          },
          {
            "rank": 6,
            "name": "Strobe Lights",
            "cost": 880,
            "description": "Lasers cause enemies to become dazzled and automatically miss attacks/abilities"
          },
          {
            "rank": 7,
            "name": "Death Ray Disco",
            "cost": 2640,
            "description": "Continuously fires 16 high-powered rainbow lasers that melt everything around the turret"
          }
        ]
      },
      {
        "name": "Hypnotic Groove (Enemy Confusion)",
        "tiers": [
          {
            "rank": 1,
            "name": "Funky Beats",
            "cost": 90,
            "description": "+5% Range"
          },
          {
            "rank": 2,
            "name": "Mirror Flash",
            "cost": 140,
            "description": "Passive minor slow to passing enemies"
          },
          {
            "rank": 3,
            "name": "Dazzling Lights",
            "cost": 270,
            "description": "Enemies inside the disco aura are passively slowed by 20%"
          },
          {
            "rank": 4,
            "name": "Hypnotic Strobe",
            "cost": 360,
            "description": "Passively has a 10% chance per second to force enemies to dance in place for 2s"
          },
          {
            "rank": 5,
            "name": "Party Fever",
            "cost": 660,
            "description": "Distracted enemies passively gain negative hyperarmor and take 20% more damage from all sources"
          },
          {
            "rank": 6,
            "name": "Soul Train Shuffle",
            "cost": 880,
            "description": "Passively causes affected enemies to turn around and walk back toward the entrance"
          },
          {
            "rank": 7,
            "name": "Global Dance Craze",
            "cost": 3520,
            "description": "For 8 seconds, all enemies on screen dance and take continuous disco damage equal to 5% of their health each second. Cooldown: 100 seconds."
          }
        ]
      }
    ]
  },
  {
    "id": "anvilTrapdoor",
    "name": "Anvil Trapdoor",
    "rarity": "Rare",
    "footprint": 2,
    "cost": 700,
    "role": "Heavy single-target burst trap",
    "damage": 350,
    "attackRate": 0.125,
    "range": 3,
    "attackType": "trap",
    "color": 10197915,
    "paths": [
      {
        "name": "Heavy Iron (Single Target Boss Killer)",
        "tiers": [
          {
            "rank": 1,
            "name": "Oiled Hinge",
            "cost": 60,
            "description": "+5% Cooldown Speed"
          },
          {
            "rank": 2,
            "name": "Hardened Steel",
            "cost": 90,
            "description": "+10% Damage"
          },
          {
            "rank": 3,
            "name": "10-Ton Weight",
            "cost": 170,
            "description": "Passively deals massive, armor-piercing damage to the target"
          },
          {
            "rank": 4,
            "name": "Crushing Impact",
            "cost": 270,
            "description": "Automatically executes non-boss enemies under 20% HP"
          },
          {
            "rank": 5,
            "name": "50-Ton Anvil",
            "cost": 420,
            "description": "Passively deals 3x damage to Bosses and Heavy targets"
          },
          {
            "rank": 6,
            "name": "Pulverizing Drop",
            "cost": 980,
            "description": "Direct hits automatically and permanently reduce Boss Armor."
          },
          {
            "rank": 7,
            "name": "The Extinction Anvil",
            "cost": 2240,
            "description": "Automatically drops a mountain-sized anvil that instantly crushes non-bosses and devastates bosses"
          }
        ]
      },
      {
        "name": "Shockwave Drop (AoE Stun & Ground Damage)",
        "tiers": [
          {
            "rank": 1,
            "name": "High Drop",
            "cost": 60,
            "description": "+5% Blast Radius"
          },
          {
            "rank": 2,
            "name": "Reinforced Base",
            "cost": 90,
            "description": "+10% Damage"
          },
          {
            "rank": 3,
            "name": "Ground Tremor",
            "cost": 170,
            "description": "Anvil drop automatically creates a shockwave that stuns surrounding enemies for 1s"
          },
          {
            "rank": 4,
            "name": "Earth-Shatter",
            "cost": 270,
            "description": "Leaves a cracked path that passively slows enemies walking over it"
          },
          {
            "rank": 5,
            "name": "Seismic Slam",
            "cost": 350,
            "description": "Shockwave automatically deals 50% of the drop damage to all nearby targets"
          },
          {
            "rank": 6,
            "name": "Fault Line",
            "cost": 980,
            "description": "Shockwave automatically travels down the track, damaging all enemies in line"
          },
          {
            "rank": 7,
            "name": "Tectonic Crusher",
            "cost": 2240,
            "description": "When the ability is cast, its earthquake stuns and damages every enemy currently on screen."
          }
        ]
      },
      {
        "name": "Automated Trapdoor (Reset Speed & Multi-Drop)",
        "tiers": [
          {
            "rank": 1,
            "name": "Quick Winch",
            "cost": 60,
            "description": "+10% Cooldown Speed"
          },
          {
            "rank": 2,
            "name": "Double Rope",
            "cost": 90,
            "description": "+5% Trigger Area"
          },
          {
            "rank": 3,
            "name": "Rapid Reset",
            "cost": 140,
            "description": "Passively reduces anvil cooldown time by 40%"
          },
          {
            "rank": 4,
            "name": "Multi-Anvil",
            "cost": 230,
            "description": "Automatically drops 2 smaller anvils in quick succession per trigger"
          },
          {
            "rank": 5,
            "name": "Factory Pulley",
            "cost": 350,
            "description": "Cooldown passively reduced by another 30%"
          },
          {
            "rank": 6,
            "name": "Anvil Rain",
            "cost": 560,
            "description": "Automatically drops 3 anvils per trigger sequence"
          },
          {
            "rank": 7,
            "name": "Endless Anvil Conveyor",
            "cost": 1680,
            "description": "Continuously drops a relentless stream of heavy anvils on the track with almost zero cooldown"
          }
        ]
      }
    ]
  },
  {
    "id": "squeakyRubberDuckCannon",
    "name": "Squeaky Rubber Duck Cannon",
    "rarity": "Rare",
    "footprint": 4,
    "cost": 1000,
    "role": "Chaining splash attack",
    "damage": 45,
    "attackRate": 0.8,
    "range": 16,
    "attackType": "chain",
    "color": 16047242,
    "paths": [
      {
        "name": "Chain Squeak (Bounce Count & Range)",
        "tiers": [
          {
            "rank": 1,
            "name": "Extra Squeak",
            "cost": 80,
            "description": "+5% Range"
          },
          {
            "rank": 2,
            "name": "High Pressure Jet",
            "cost": 120,
            "description": "+10% Damage"
          },
          {
            "rank": 3,
            "name": "Multi-Bounce",
            "cost": 240,
            "description": "Water jet automatically chains to up to 6 targets"
          },
          {
            "rank": 4,
            "name": "Long-Range Splash",
            "cost": 470,
            "description": "Chain range between targets is permanently increased by 100%"
          },
          {
            "rank": 5,
            "name": "Hyper-Chain",
            "cost": 600,
            "description": "Chains up to 12 targets with no damage falloff per bounce"
          },
          {
            "rank": 6,
            "name": "Hydro Splatter",
            "cost": 960,
            "description": "Every bounce automatically triggers a small AoE splash"
          },
          {
            "rank": 7,
            "name": "Infinite Rubber Bounce",
            "cost": 2400,
            "description": "A water jet hits one enemy, then chains between enemies up to 2 tiles away. It can hit at least 12 enemies, one at a time, retaining Tier 5’s no-falloff damage."
          }
        ]
      },
      {
        "name": "Soapy Foam (Slippery Slows & Debuffs)",
        "tiers": [
          {
            "rank": 1,
            "name": "Extra Bubble Mix",
            "cost": 80,
            "description": "+5% Slow"
          },
          {
            "rank": 2,
            "name": "Thick Foam",
            "cost": 120,
            "description": "+10% Area Size"
          },
          {
            "rank": 3,
            "name": "Slick Track",
            "cost": 240,
            "description": "Water splashes leave soapy foam on the ground that automatically causes enemies to slip"
          },
          {
            "rank": 4,
            "name": "Sudsy Confusion",
            "cost": 320,
            "description": "Slipping enemies lose targeting and passively move at random"
          },
          {
            "rank": 5,
            "name": "Degreasing Soap",
            "cost": 500,
            "description": "Foam passively reduces enemy Armor and Hyperarmor."
          },
          {
            "rank": 6,
            "name": "Bubble Barrier",
            "cost": 960,
            "description": "Foam passively damages and slows enemies by 60%"
          },
          {
            "rank": 7,
            "name": "Suds Deluge",
            "cost": 3200,
            "description": "For 5 seconds, covers the entire path in mud that sends non-boss enemies sliding toward the entrance, away from the exit. Cooldown: 90 seconds."
          }
        ]
      },
      {
        "name": "Mega Squeaker (Impact & Knockback)",
        "tiers": [
          {
            "rank": 1,
            "name": "Heavy Rubber",
            "cost": 80,
            "description": "+5% Damage"
          },
          {
            "rank": 2,
            "name": "High Volume",
            "cost": 120,
            "description": "+10% Stun Chance"
          },
          {
            "rank": 3,
            "name": "Sonic Squeak",
            "cost": 240,
            "description": "Duck automatically emits a loud squeak on firing, stunning close enemies"
          },
          {
            "rank": 4,
            "name": "Water Pressure Blast",
            "cost": 320,
            "description": "Direct hits automatically knock primary target back significantly"
          },
          {
            "rank": 5,
            "name": "Giant Bath Toy",
            "cost": 500,
            "description": "Passively fires large rubber duckies instead of standard water jets"
          },
          {
            "rank": 6,
            "name": "Disorienting Honk",
            "cost": 960,
            "description": "Sonic squeak passively lowers enemy armor by 40%"
          },
          {
            "rank": 7,
            "name": "The Kraken Duck",
            "cost": 3200,
            "description": "Fires massive rubber ducks that crush enemies and automatically generate map-clearing tidal waves"
          }
        ]
      }
    ]
  },
  {
    "id": "hotSauceSprinkler",
    "name": "Hot Sauce Sprinkler",
    "rarity": "Rare",
    "footprint": 2,
    "cost": 900,
    "role": "360-degree damage over time",
    "damage": 5,
    "attackRate": 2.0,
    "range": 8,
    "attackType": "burnAura",
    "color": 15693906,
    "paths": [
      {
        "name": "Inferno Habanero (High Fire Damage)",
        "tiers": [
          {
            "rank": 1,
            "name": "Extra Spicy",
            "cost": 80,
            "description": "+5% DOT Damage"
          },
          {
            "rank": 2,
            "name": "Wider Nozzle",
            "cost": 110,
            "description": "+10% Range"
          },
          {
            "rank": 3,
            "name": "Ghost Pepper Blend",
            "cost": 220,
            "description": "Fire DOT passively deals 50% more damage per second"
          },
          {
            "rank": 4,
            "name": "Lingering Heat",
            "cost": 290,
            "description": "Burn effect duration extended to 8 seconds"
          },
          {
            "rank": 5,
            "name": "Scorching Spray",
            "cost": 450,
            "description": "Direct hits automatically reduce enemy Armor."
          },
          {
            "rank": 6,
            "name": "Molten Sauce",
            "cost": 720,
            "description": "Burn damage automatically stacks up to 10 times on single targets"
          },
          {
            "rank": 7,
            "name": "Carolina Reaper Meltdown",
            "cost": 2160,
            "description": "Doubles the burn damage per second of Tier 6’s 10-stack output. Each burn tick is affected by the target’s Armor and Hyperarmor normally."
          }
        ]
      },
      {
        "name": "Sticky Salsa (Slow & Burn Combo)",
        "tiers": [
          {
            "rank": 1,
            "name": "Thick Mix",
            "cost": 80,
            "description": "+5% Slow"
          },
          {
            "rank": 2,
            "name": "Chunky Salsa",
            "cost": 110,
            "description": "+10% Duration"
          },
          {
            "rank": 3,
            "name": "Sticky Burn",
            "cost": 220,
            "description": "Hot sauce passively slows enemies by 25% while burning them"
          },
          {
            "rank": 4,
            "name": "Deep Fryer",
            "cost": 350,
            "description": "Slowed targets passively gain negative hyperarmor against fire damage and take 30% more fire damage"
          },
          {
            "rank": 5,
            "name": "Jalapeño Tar",
            "cost": 450,
            "description": "Goo automatically stays on the ground for 5s, burning anyone who steps on it"
          },
          {
            "rank": 6,
            "name": "Napalm Salsa",
            "cost": 720,
            "description": "Ground pools automatically explode when expiring"
          },
          {
            "rank": 7,
            "name": "Lava Lake Sprinkler",
            "cost": 2160,
            "description": "Creates a burning area within an 8-tile radius for 10 seconds. Deals 25 damage per second and applies burn. Bosses are affected. Cooldown: 60 seconds."
          }
        ]
      },
      {
        "name": "Rapid Pressure (Speed & Coverage)",
        "tiers": [
          {
            "rank": 1,
            "name": "High-Flow Pump",
            "cost": 80,
            "description": "+5% Rotation Speed"
          },
          {
            "rank": 2,
            "name": "Brass Nozzle",
            "cost": 110,
            "description": "+10% Range"
          },
          {
            "rank": 3,
            "name": "Hyper-Rotation",
            "cost": 220,
            "description": "Passively spins 3x faster, keeping 100% spray uptime"
          },
          {
            "rank": 4,
            "name": "Pressurized Stream",
            "cost": 420,
            "description": "Permanently increases spray distance dramatically"
          },
          {
            "rank": 5,
            "name": "Dual-Sprinkler Head",
            "cost": 450,
            "description": "Passively sprays two opposing streams at once"
          },
          {
            "rank": 6,
            "name": "Fire Hose Pressure",
            "cost": 870,
            "description": "Automatically pushes back enemies slightly with the sheer force of the spray"
          },
          {
            "rank": 7,
            "name": "Volcano Pressure Pump",
            "cost": 2160,
            "description": "Spins at incredible speeds, maintaining an impenetrable ring of fire around itself"
          }
        ]
      }
    ]
  },
  {
    "id": "catLaserPointer",
    "name": "Cat Laser Pointer",
    "rarity": "Epic",
    "footprint": 2,
    "cost": 1600,
    "role": "Ramping single-target beam",
    "damage": 2,
    "attackRate": 5.0,
    "range": 22,
    "attackType": "beam",
    "color": 16735330,
    "paths": [
      {
        "name": "Thermal Ramp (Extreme Single-Target Ramping)",
        "tiers": [
          {
            "rank": 1,
            "name": "Focused Diode",
            "cost": 130,
            "description": "+5% Base Damage"
          },
          {
            "rank": 2,
            "name": "High-Output Battery",
            "cost": 200,
            "description": "+10% Max Ramp Cap"
          },
          {
            "rank": 3,
            "name": "Meltdown Beam",
            "cost": 320,
            "description": "Damage automatically ramps up 50% faster on the same target"
          },
          {
            "rank": 4,
            "name": "Overheated Core",
            "cost": 520,
            "description": "Raises maximum ramp damage from 200 to 400 damage per second."
          },
          {
            "rank": 5,
            "name": "Thermal Burn",
            "cost": 960,
            "description": "Raises maximum ramp damage to 600 damage per second and reduces target armor by 50% while the beam is at maximum ramp."
          },
          {
            "rank": 6,
            "name": "Plasma Beam",
            "cost": 1280,
            "description": "Overrides the normal reset on target death: transfers 50% of current ramp to the next target; other target switches still reset the ramp"
          },
          {
            "rank": 7,
            "name": "Singularity Ray",
            "cost": 5120,
            "description": "Ramps damage exponentially up to millions, automatically disintegrating targets"
          }
        ]
      },
      {
        "name": "Refracted Lasers (Multi-Target Lasers)",
        "tiers": [
          {
            "rank": 1,
            "name": "Wide Lens",
            "cost": 130,
            "description": "+5% Range"
          },
          {
            "rank": 2,
            "name": "Prism Coating",
            "cost": 200,
            "description": "+10% Damage"
          },
          {
            "rank": 3,
            "name": "Split Beam",
            "cost": 320,
            "description": "Passively splits beam onto 2 additional nearby targets at 50% ramp power"
          },
          {
            "rank": 4,
            "name": "Multi-Prism",
            "cost": 520,
            "description": "Passively splits laser to hit up to 4 targets total"
          },
          {
            "rank": 5,
            "name": "Refraction Grid",
            "cost": 800,
            "description": "Lasers automatically bounce between hit targets"
          },
          {
            "rank": 6,
            "name": "Rainbow Plasma",
            "cost": 1280,
            "description": "Each split beam automatically applies a different elemental debuff"
          },
          {
            "rank": 7,
            "name": "Prismatic Supernova",
            "cost": 3840,
            "description": "Passively splits into 10 ramping beams that wipe out entire clusters"
          }
        ]
      },
      {
        "name": "Cat Distraction (Feline Minions / Taunts)",
        "tiers": [
          {
            "rank": 1,
            "name": "Bright Red Dot",
            "cost": 130,
            "description": "+5% Range"
          },
          {
            "rank": 2,
            "name": "Wobble Mount",
            "cost": 200,
            "description": "+10% Target Tracking"
          },
          {
            "rank": 3,
            "name": "Kitty Attraction",
            "cost": 390,
            "description": "Automatically spawns a helper cat that pounces on the laser dot, damaging enemies"
          },
          {
            "rank": 4,
            "name": "Paw Strike",
            "cost": 620,
            "description": "Cat pounces automatically stun enemies caught under the red dot for 1s"
          },
          {
            "rank": 5,
            "name": "Pack of Kittens",
            "cost": 800,
            "description": "Passively maintains 3 cats that chase the dot, tearing up targets"
          },
          {
            "rank": 6,
            "name": "Feline Frenzy",
            "cost": 1280,
            "description": "Cats' attack speed passively scales with the beam's current ramp level"
          },
          {
            "rank": 7,
            "name": "Giant Laser Panther",
            "cost": 3840,
            "description": "Passively maintains a giant mythical panther that slashes along the laser line"
          }
        ]
      }
    ]
  },
  {
    "id": "freezeRayIceCreamTruck",
    "name": "Freeze-Ray Ice Cream Truck",
    "rarity": "Epic",
    "footprint": 4,
    "cost": 2000,
    "role": "Mortar freeze and area control",
    "damage": 60,
    "attackRate": 0.4,
    "range": 25,
    "attackType": "freeze",
    "color": 7919854,
    "paths": [
      {
        "name": "Deep Freeze (Long Stun / Freeze)",
        "tiers": [
          {
            "rank": 1,
            "name": "Extra Cold",
            "cost": 160,
            "description": "+5% Freeze Duration"
          },
          {
            "rank": 2,
            "name": "Scoop Size",
            "cost": 240,
            "description": "+10% Blast Radius"
          },
          {
            "rank": 3,
            "name": "Hard Freeze",
            "cost": 480,
            "description": "Passively freezes targets solid for 3.5 seconds"
          },
          {
            "rank": 4,
            "name": "Shatter Vulnerability",
            "cost": 770,
            "description": "Frozen targets passively gain negative hyperarmor against physical damage and take 30% more physical damage"
          },
          {
            "rank": 5,
            "name": "Glacial Scoop",
            "cost": 1200,
            "description": "Enemies unfreezing are automatically slowed by 50% for 4 seconds"
          },
          {
            "rank": 6,
            "name": "Absolute Zero Blast",
            "cost": 1920,
            "description": "Automatically freezes heavy bosses for 50% of normal duration"
          },
          {
            "rank": 7,
            "name": "Permafrost Mortar",
            "cost": 4800,
            "description": "Targets a 4 × 4 area anywhere within the tower’s range. The ice zone lasts 2 seconds. Regular enemies caught by the zone remain stunned until they die. Mini-Bosses are stunned for 0.5 seconds and receive a 25% slow. Bosses are immune to stun and slow."
          }
        ]
      },
      {
        "name": "Soft-Serve Blizzard (Continuous Slow & Area Coverage)",
        "tiers": [
          {
            "rank": 1,
            "name": "High-Pressure Hose",
            "cost": 160,
            "description": "+5% Range"
          },
          {
            "rank": 2,
            "name": "Chilled Cone",
            "cost": 240,
            "description": "+10% Attack Speed"
          },
          {
            "rank": 3,
            "name": "Ice Cream Blizzard",
            "cost": 580,
            "description": "Continuously fires smaller scoops, creating a permanent freezing field"
          },
          {
            "rank": 4,
            "name": "Soft-Serve Trap",
            "cost": 770,
            "description": "Leaves sticky ice cream pools that passively slow enemies by 60%"
          },
          {
            "rank": 5,
            "name": "Brain Freeze",
            "cost": 1200,
            "description": "Slowed enemies automatically have their ability/attack cooldowns doubled"
          },
          {
            "rank": 6,
            "name": "Sundae Rain",
            "cost": 1600,
            "description": "Continuously rains ice cream scoops across a wide zone"
          },
          {
            "rank": 7,
            "name": "Avalanche Express",
            "cost": 4800,
            "description": "Automatically counts enemies by the side of the track they are flowing toward and selects the side with the most enemies. If multiple sides tie for the highest count, it selects one of those sides at random. For 8 seconds, enemies on the selected side, including bosses, are slowed by 60% and take 12 damage per second. Basic enemies also receive −25 hyperarmor. Cooldown: 165 seconds."
          }
        ]
      },
      {
        "name": "Jingle Tunes (Support & Coin Boost)",
        "tiers": [
          {
            "rank": 1,
            "name": "Loud Speaker",
            "cost": 160,
            "description": "+5% Aura Radius"
          },
          {
            "rank": 2,
            "name": "Cheerful Melody",
            "cost": 240,
            "description": "+10% Fire Rate for nearby towers"
          },
          {
            "rank": 3,
            "name": "Happy Jingle",
            "cost": 400,
            "description": "Nearby towers gain passive +15% attack speed and range"
          },
          {
            "rank": 4,
            "name": "Ice Cream Sales",
            "cost": 640,
            "description": "Passively generates bonus gold whenever an enemy dies while frozen"
          },
          {
            "rank": 5,
            "name": "Sugar Rush",
            "cost": 1000,
            "description": "Nearby towers passively gain +20% attack speed during active waves"
          },
          {
            "rank": 6,
            "name": "Brain Freeze Melody",
            "cost": 1920,
            "description": "Enemies near the truck passively walk 20% slower from music alone"
          },
          {
            "rank": 7,
            "name": "Festival of Flavors",
            "cost": 6400,
            "description": "Always active. Grants towers +20% to all positive stats. Its freeze effect runs for 18 seconds total, freezing all enemies, including bosses, for 6 seconds at a time with 3 seconds between freezes. Cooldown: 75 seconds."
          }
        ]
      }
    ]
  },
  {
    "id": "unstableToasterLauncher",
    "name": "Unstable Toaster Launcher",
    "rarity": "Epic",
    "footprint": 2,
    "cost": 1700,
    "role": "Fast straight-line piercing and explosive",
    "damage": 80,
    "attackRate": 1.2,
    "range": 20,
    "attackType": "pierce",
    "color": 15765073,
    "paths": [
      {
        "name": "Super-Toasted (Explosive Toast)",
        "tiers": [
          {
            "rank": 1,
            "name": "Extra Butter",
            "cost": 140,
            "description": "+5% Splash Damage"
          },
          {
            "rank": 2,
            "name": "High Heat",
            "cost": 210,
            "description": "+10% Blast Radius"
          },
          {
            "rank": 3,
            "name": "Buttered Boom",
            "cost": 410,
            "description": "Every 3rd shot is automatically Super-Toasted, bursting in a fire explosion"
          },
          {
            "rank": 4,
            "name": "Burnt Crust",
            "cost": 550,
            "description": "Explosions automatically leave burning embers on the path for 3s"
          },
          {
            "rank": 5,
            "name": "Extra Crisp",
            "cost": 850,
            "description": "Super-Toasted shots passively deal double blast damage"
          },
          {
            "rank": 6,
            "name": "Atomic Pop-Up",
            "cost": 1360,
            "description": "Super-Toasted shots automatically trigger a 2nd mini-explosion"
          },
          {
            "rank": 7,
            "name": "Nuclear Toast Overload",
            "cost": 4080,
            "description": "Every single shot is passively converted into a Super-Toasted explosive round"
          }
        ]
      },
      {
        "name": "Razor Slice (Piercing & Bleed)",
        "tiers": [
          {
            "rank": 1,
            "name": "Sharp Edges",
            "cost": 140,
            "description": "+5% Piercing"
          },
          {
            "rank": 2,
            "name": "Fast Spring",
            "cost": 210,
            "description": "+10% Attack Speed"
          },
          {
            "rank": 3,
            "name": "Slicing Toast",
            "cost": 410,
            "description": "Toast passively pierces through up to 5 enemies"
          },
          {
            "rank": 4,
            "name": "Serrated Crust",
            "cost": 660,
            "description": "Pierced enemies automatically suffer heavy bleeding over 4s"
          },
          {
            "rank": 5,
            "name": "Multi-Slot Toast",
            "cost": 850,
            "description": "Passively launches 2 slices simultaneously in a spread pattern"
          },
          {
            "rank": 6,
            "name": "Guillotine Slice",
            "cost": 1640,
            "description": "Toast passively pierces through infinite non-boss enemies"
          },
          {
            "rank": 7,
            "name": "Bread Shredder",
            "cost": 4080,
            "description": "Continuously launches a wall of razor-sharp toast slices that slice through entire lanes"
          }
        ]
      },
      {
        "name": "Electrical Short (Stun & Lightning Damage)",
        "tiers": [
          {
            "rank": 1,
            "name": "Loose Wiring",
            "cost": 140,
            "description": "Adds 5 percentage points to stun chance from a 0% base chance"
          },
          {
            "rank": 2,
            "name": "Sparking Heating Coils",
            "cost": 210,
            "description": "+10% Damage"
          },
          {
            "rank": 3,
            "name": "Shocking Toast",
            "cost": 410,
            "description": "Toast automatically delivers an electric shock, chaining lightning to 2 targets"
          },
          {
            "rank": 4,
            "name": "Overcharge",
            "cost": 660,
            "description": "Electric shocks automatically stun targets for 0.8 seconds"
          },
          {
            "rank": 5,
            "name": "High Voltage Coils",
            "cost": 1020,
            "description": "Chain lightning automatically hits up to 6 targets"
          },
          {
            "rank": 6,
            "name": "EMP Pop",
            "cost": 1360,
            "description": "Toaster periodically and automatically emits an electric shockwave that stuns affected enemies for 1 second."
          },
          {
            "rank": 7,
            "name": "Giga-Watt Appliance",
            "cost": 4080,
            "description": "Continuously fires electrified toast that automatically summons giant lightning bolts on impact"
          }
        ]
      }
    ]
  },
  {
    "id": "giantMechTeddyBear",
    "name": "Giant Mech-Teddy Bear",
    "rarity": "Legendary",
    "footprint": 4,
    "cost": 3200,
    "role": "Area stun, melee slam, and homing rockets",
    "damage": 250,
    "attackRate": 0.3333333333333333,
    "range": 30,
    "attackType": "teddy",
    "color": 12157398,
    "paths": [
      {
        "name": "Plush Crusher (Melee Ground Slam)",
        "tiers": [
          {
            "rank": 1,
            "name": "Heavy Plush",
            "cost": 260,
            "description": "+5% Slam Radius"
          },
          {
            "rank": 2,
            "name": "Reinforced Seams",
            "cost": 390,
            "description": "+10% Slam Damage"
          },
          {
            "rank": 3,
            "name": "Ground Pound",
            "cost": 770,
            "description": "Ground slam automatically stuns all nearby enemies for 2 seconds"
          },
          {
            "rank": 4,
            "name": "Seismic Plush",
            "cost": 1030,
            "description": "Slam automatically creates a wave that travels down the path, damaging distant targets"
          },
          {
            "rank": 5,
            "name": "Iron Fist Slam",
            "cost": 1920,
            "description": "Automatically stuns Mini-Bosses for 1 second (reduced to 0.5 seconds by Mini-Boss stun resistance); passively shreds Armor on ground targets."
          },
          {
            "rank": 6,
            "name": "Megaton Hug",
            "cost": 2560,
            "description": "Automatically grabs the largest nearby enemy and slams them down, crushing surrounding foes"
          },
          {
            "rank": 7,
            "name": "Titan Teddy Stomp",
            "cost": 7680,
            "description": "Continuously slams the ground on an automated timer, keeping nearby enemies in constant stun"
          }
        ]
      },
      {
        "name": "Stuffing Rocket Swarm (Ranged Rocket Barrage)",
        "tiers": [
          {
            "rank": 1,
            "name": "Extra Fluff",
            "cost": 260,
            "description": "+5% Rocket Range"
          },
          {
            "rank": 2,
            "name": "Targeting Monocle",
            "cost": 390,
            "description": "+10% Rocket Tracking"
          },
          {
            "rank": 3,
            "name": "Homing Stuffing",
            "cost": 640,
            "description": "Passively fires an automated stream of 4 homing stuffing-rockets at distant targets"
          },
          {
            "rank": 4,
            "name": "High-Explosive Fluff",
            "cost": 1030,
            "description": "Rockets automatically explode on impact, dealing large AoE damage"
          },
          {
            "rank": 5,
            "name": "Rocket Pods",
            "cost": 1600,
            "description": "Passively fires 8 rockets per volley instead of 4"
          },
          {
            "rank": 6,
            "name": "Micro-Missile Mayhem",
            "cost": 2560,
            "description": "Fires rockets continuously without stopping"
          },
          {
            "rank": 7,
            "name": "Orbital Fluff Strike",
            "cost": 10240,
            "description": "For 30 seconds, the Tier 6 continuous rocket stream remains active. Every 6 seconds, an orbital strike hits every enemy on screen for 35 damage, permanently reduces hit enemies’ armor by 40, and applies burn. Cooldown: 140 seconds."
          }
        ]
      },
      {
        "name": "Cuddle Aura (Defense & Support)",
        "tiers": [
          {
            "rank": 1,
            "name": "Soft Fur",
            "cost": 260,
            "description": "+5% Aura Radius"
          },
          {
            "rank": 2,
            "name": "Warm Hug",
            "cost": 390,
            "description": "+5% Buff Power"
          },
          {
            "rank": 3,
            "name": "Comforting Presence",
            "cost": 640,
            "description": "Nearby towers gain passive +20% damage and +15% attack speed"
          },
          {
            "rank": 4,
            "name": "Fluffy Armor",
            "cost": 1030,
            "description": "Nearby towers passively take less damage from enemy attacks/debuffs"
          },
          {
            "rank": 5,
            "name": "Teddy Protection",
            "cost": 1600,
            "description": "Periodically and automatically grants surrounding towers a damage-absorbing shield. This is a tower-only shield; enemies do not have separate shield pools."
          },
          {
            "rank": 6,
            "name": "Morale Booster",
            "cost": 4480,
            "description": "Passively triples critical strike chance of all towers within its aura"
          },
          {
            "rank": 7,
            "name": "God of Fluff",
            "cost": 10240,
            "description": "For 10 seconds, grants all towers on the map immunity to all debuffs and +100% total damage. Cooldown: 100 seconds."
          }
        ]
      }
    ]
  },
  {
    "id": "cosmicRoomba",
    "name": "Cosmic Roomba",
    "rarity": "Legendary",
    "footprint": 4,
    "cost": 3000,
    "role": "Mobile track vacuum",
    "damage": 18,
    "attackRate": 10.0,
    "range": 10,
    "attackType": "roomba",
    "color": 5946536,
    "paths": [
      {
        "name": "Event Horizon (Black Hole Vortex)",
        "tiers": [
          {
            "rank": 1,
            "name": "Strong Suction",
            "cost": 240,
            "description": "+5% Pull Radius"
          },
          {
            "rank": 2,
            "name": "Dark Matter Core",
            "cost": 360,
            "description": "+10% Vacuum Damage"
          },
          {
            "rank": 3,
            "name": "Black Hole Core",
            "cost": 600,
            "description": "Passively pulls nearby enemies inward toward the Roomba continuously"
          },
          {
            "rank": 4,
            "name": "Gravity Crush",
            "cost": 960,
            "description": "Trapped enemies automatically take increasing damage the closer they get to the center"
          },
          {
            "rank": 5,
            "name": "Singularity Trap",
            "cost": 2180,
            "description": "Automatically swallows light enemies, instantly destroying them"
          },
          {
            "rank": 6,
            "name": "Gravitational Lens",
            "cost": 2400,
            "description": "Passively pulls in flying and heavy enemies with full force"
          },
          {
            "rank": 7,
            "name": "Supermassive Black Hole",
            "cost": 7200,
            "description": "Passively maintains a colossal gravity well that continuously pulls in and crushes waves"
          }
        ]
      },
      {
        "name": "Cosmic Dust Burn (Disintegration Beam)",
        "tiers": [
          {
            "rank": 1,
            "name": "Neon Runes",
            "cost": 240,
            "description": "+5% Laser Range"
          },
          {
            "rank": 2,
            "name": "Plasma Filters",
            "cost": 360,
            "description": "+10% Laser Damage"
          },
          {
            "rank": 3,
            "name": "Vaporizing Dust",
            "cost": 600,
            "description": "Passively fires continuous cosmic beams at pulled-in targets"
          },
          {
            "rank": 4,
            "name": "Molecular Deconstruction",
            "cost": 1160,
            "description": "Beams automatically strip 100% of enemy Armor."
          },
          {
            "rank": 5,
            "name": "Starfire Exhaust",
            "cost": 1500,
            "description": "Passively emits a trail of cosmic fire along the path as it hovers"
          },
          {
            "rank": 6,
            "name": "Antimatter Beam",
            "cost": 2400,
            "description": "Passively fires a giant laser beam through the entire length of the path"
          },
          {
            "rank": 7,
            "name": "Gamma-Ray Annihilator",
            "cost": 7200,
            "description": "For 6 seconds, pulses once per second and hits every enemy within a 10-tile radius. The beam ignores armor and hyperarmor. Non-boss enemies below 25% health and bosses below 10% health are instantly killed. Cooldown: 180 seconds."
          }
        ]
      },
      {
        "name": "Mobile Patrol (Track Patrol & Speed)",
        "tiers": [
          {
            "rank": 1,
            "name": "Fast Wheels",
            "cost": 240,
            "description": "+10% Hover Speed"
          },
          {
            "rank": 2,
            "name": "Extended Battery",
            "cost": 360,
            "description": "+10% Patrol Distance"
          },
          {
            "rank": 3,
            "name": "Track Sweeper",
            "cost": 870,
            "description": "Passively patrols back and forth along a path section, crushing small enemies beneath it"
          },
          {
            "rank": 4,
            "name": "High-Speed Clean",
            "cost": 1160,
            "description": "Patrol speed passively increased by 100%, hitting enemies multiple times per pass"
          },
          {
            "rank": 5,
            "name": "Automated Dock",
            "cost": 1500,
            "description": "Automatically and periodically recharges to unleash an automated energy burst"
          },
          {
            "rank": 6,
            "name": "Path Cleanser",
            "cost": 2880,
            "description": "Passively leaves behind a clean path where enemies gain negative hyperarmor and take 25% more damage"
          },
          {
            "rank": 7,
            "name": "Infinite Vacuum Fleet",
            "cost": 7200,
            "description": "Each ability use spawns 4 mini-Roombas, up to a maximum of 9 active. If 9 are already active, the ability heals 4 Roombas to full health. Mini-Roombas patrol every track lane, have 200 HP, and can collide only with enemies. Each has a 4-tile radius. They use one attack at a time: the mini-laser deals 30 damage per second; the close-range attack hits enemies within 1 tile for 65 damage every 2 seconds. Cooldown: 165 seconds."
          }
        ]
      }
    ]
  }
] as const satisfies readonly TowerSpec[];

export const TOWERS = [...ORIGINAL_TOWERS, ...ADDED_TOWERS] as const satisfies readonly TowerSpec[];
