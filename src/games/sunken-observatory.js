// src/games/sunken-observatory.js
// Cosmic Horror / Eldritch Investigation GameConfig with presentation metadata, lore, and SVG assets

import { compileGameConfig, GEN2_MILESTONE_TIERS, GEN3_MILESTONE_TIERS } from './blueprint.js';

export const sunkenObservatoryGame = compileGameConfig({
  id: 'sunken-observatory',
  name: 'The Sunken Observatory',
  shortName: 'Sunken Observatory',
  subtitle: 'Unearth eldritch secrets submerged beneath the abyssal depths',
  prestigeImage: './assets/prestige-sunken.jpg',
  prestigeTitle: 'Cosmic Void Transcendence',
  palette: {
    '--bg': '#020506',
    '--card-bg': '#050d10',
    '--card-border': 'rgba(78, 168, 154, 0.20)',
    '--text': '#bfc9c5',
    '--text-muted': '#748c86',
    '--primary': '#4ea89a',
    '--primary-hover': '#68bfb0',
    '--secondary': '#8474a1',
    '--danger': '#9e3a4b',
    '--danger-hover': '#b84659',
    '--success': '#3e8e72',
    '--accent': '#b56586',
    '--font-display': "'Courier Prime', 'Special Elite', 'IM Fell English', monospace",
    '--font-body': "'Courier New', 'Courier', monospace",
    '--bg-pattern': 'radial-gradient(circle at 50% 15%, rgba(3, 10, 12, 0.45) 0%, rgba(1, 4, 5, 0.90) 100%), url("./assets/bg-sunken-observatory.jpg")',
    '--panel-l0-bg': 'url("./assets/panel-sunken-observatory.jpg")',
    '--panel-l1-bg': 'url("./assets/panel-sunken-observatory.jpg")',
    '--panel-overlay-l0': 'linear-gradient(135deg, rgba(4, 14, 17, 0.88) 0%, rgba(2, 7, 9, 0.96) 100%)',
    '--panel-overlay-l1': 'linear-gradient(135deg, rgba(4, 14, 17, 0.88) 0%, rgba(2, 7, 9, 0.96) 100%)',
    '--card-glow': '0 0 28px rgba(0, 0, 0, 0.85), inset 0 0 18px rgba(78, 168, 154, 0.06)',
    '--card-bg-gradient': 'linear-gradient(180deg, rgba(6, 17, 21, 0.92) 0%, rgba(3, 9, 12, 0.97) 100%)',
    '--border-radius-panel': '2px',
    '--border-radius-card': '2px',
    '--border-radius-btn': '1px',
    '--banner-bg': 'linear-gradient(90deg, rgba(4, 14, 18, 0.98) 0%, rgba(2, 9, 12, 0.92) 100%)',
    '--banner-border': 'rgba(78, 168, 154, 0.24)',
    '--tag-case': 'uppercase',
    '--tag-letter-spacing': '0.12em',
    '--badge-bg': 'rgba(78, 168, 154, 0.10)',
    '--badge-color': '#8fc7bd',
    '--btn-bg': 'rgba(0, 0, 0, 0.65)',
    '--btn-bg-hover': 'rgba(0, 0, 0, 0.82)',
    '--btn-bg-disabled': 'rgba(0, 0, 0, 0.48)',
    '--btn-text': '#ffffff',
    '--btn-text-disabled': 'rgba(191, 201, 197, 0.38)',
    '--btn-primary-border': 'rgba(78, 168, 154, 0.62)',
    '--btn-primary-glow': 'inset 0 0 14px rgba(78, 168, 154, 0.16), 0 2px 10px rgba(0, 0, 0, 0.65)',
    '--btn-sec-bg': 'rgba(0, 0, 0, 0.65)',
    '--btn-sec-color': '#ffffff',
    '--btn-sec-border': 'rgba(132, 116, 161, 0.35)',
    '--upg-card-scrim': 'linear-gradient(135deg, rgba(2, 6, 8, 0.92) 0%, rgba(4, 11, 14, 0.84) 52%, rgba(5, 15, 19, 0.66) 100%)',
    '--upg-card-scrim-hover': 'linear-gradient(135deg, rgba(2, 6, 8, 0.85) 0%, rgba(4, 11, 14, 0.74) 52%, rgba(5, 15, 19, 0.52) 100%)',
    '--viewport-vignette': 'radial-gradient(circle at 50% 42%, transparent 32%, rgba(1, 5, 6, 0.58) 72%, rgba(0, 2, 3, 0.88) 100%)',
    '--title-text-shadow': '0 0 14px rgba(78, 168, 154, 0.28), 0 2px 4px rgba(0, 0, 0, 0.95)'
  },
  scenery: `<img src="./assets/bg-sunken-observatory.jpg" alt="Sunken Observatory Abyssal Trench Panorama" class="scenery-img" />`,
  character: {
    name: 'Curator Ambrose',
    title: 'Sole Keeper of the Abyssal Vault',
    image: './assets/portrait-sunken.jpg',
    backstory: 'Former Royal Astronomer who vanished into the Mariana Trench in 1892. Ambrose awoke submerged within the non-Euclidean drowned chambers of the Old Ones, charting subterranean constellations and deciphering bioluminescent eldritch glyphs through curved obsidian lenses.',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="char-svg-horror">
      <circle class="eldritch-eye-ring" cx="32" cy="32" r="28" stroke="#2dd4bf" stroke-width="2" stroke-dasharray="8 4" />
      <path class="eye-outer" d="M14 32 C14 18, 50 18, 50 32 C50 46, 14 46, 14 32 Z" stroke="#a78bfa" stroke-width="2" fill="rgba(167,139,250,0.18)" />
      <circle class="iris-pulse" cx="32" cy="32" r="7" fill="#f472b6" />
      <circle cx="32" cy="32" r="2.5" fill="#020608" />
      <path class="tentacle-twitch" d="M18 48 Q 32 60 46 48" stroke="#2dd4bf" stroke-width="2" fill="none" />
      <path d="M28 12 L32 5 L36 12" stroke="#2dd4bf" stroke-width="2" />
    </svg>`,
    dialogue: {
      intro: 'The salt water rises. The texts call out from the seabed. Command Cult Acolytes to transcribe the Whispers.',
      gen2Revealed: 'The black stone hums. Whispering Monoliths surface, commanding throngs of devotees without human words.',
      gen3Revealed: 'The Abyssal Trench splits open. Rift Harvesters dredge forbidden relics from beyond the stars.',
      prestigeVisible: 'Sanity fractures under the weight of the cosmos. We can trigger Mind Shatter to forge permanent Void Shards.',
      prestigeExecuted: 'The mind breaks, but the void remains eternal. Void Shards amplify our forbidden comprehension.'
    }
  },
  clock: {
    baseCycleDurationMs: 6000,
    baseTicksPerCycle: 1
  },
  clock: {
    baseCycleDurationMs: 7500,
    baseTicksPerCycle: 1
  },
  layers: [
    {
      id: 'layer0',
      name: 'The Abyssal Archive',
      boughtSynergyMultiplier: 1.013,
      overdriveMultiplier: 1.20,
      bayCapacity: {
        gen1: { base: 8, perBought: 0.90 },
        gen2: { base: 4, perBought: 0.8 },
        gen3: { base: 3, perBought: 0.8 }
      },
      capacitor: {
        name: 'Abyssal Bell Jar',
        pulseLabel: 'Sound Sonar',
        dischargeLabel: 'Rupture Rift Tide',
        surgeName: 'Rift Tide',
        pulseCooldownMs: 22000,
        pulseBaseCurrency: 6,
        pulseRateSec: 1.3,
        pulseCharge: 0.05,
        passiveChargePerTick: 0.005,
        minDischargeCharge: 0.40,
        surgeMultiplier: 1.40,
        surgeCycleFreqMult: 1.08,
        surgeTickMult: 2,
        maxSurgeTicks: 12
      },
      defaultStanceId: 'balanced',
      stances: [
        {
          id: 'balanced',
          name: 'Steady Bathysphere',
          description: 'Measured 1.0x transcription, recruitment, and sonar pressure.',
          currencyMult: 1.0,
          metaMult: 1.0,
          chargeMult: 1.0,
          cycleFreqMult: 1.0
        },
        {
          id: 'extraction',
          name: 'Lucid Exegesis',
          description: '+38% direct insight transcription, -55% recruitment cascade, -30% jar charge.',
          currencyMult: 1.38,
          metaMult: 0.45,
          chargeMult: 0.70,
          cycleFreqMult: 1.0
        },
        {
          id: 'cascade',
          name: 'Drowned Calling',
          description: '+80% monolith/rift summoning, +55% bell jar charge, -38% direct insight.',
          currencyMult: 0.62,
          metaMult: 1.80,
          chargeMult: 1.55,
          cycleFreqMult: 1.0
        }
      ],
      image: './assets/icon-horror-l0.jpg',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>`,
      currency: {
        id: 'insight',
        name: 'Insight',
        symbol: 'INS',
        initialAmount: 10
      },
      generators: [
        {
          id: 'gen1',
          name: 'Cult Acolyte',
          lore: 'Sleepless scribes feverishly translating drowned star-charts by tallow candlelight.',
          backstory: 'Former maritime naturalists and shipwreck survivors rescued from the Pacific deeps. Eyes permanently dilated from the crushing twilight of the abyss, they obsessively transcribe drowned astronomical charts onto treated vellum, decoding forgotten constellations that shone before humanity walked the earth.',
          image: './assets/gen-horror-1.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-acolyte">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>`,
          baseCost: 10,
          costGrowth: 1.408,
          cyclePeriodTicks: 1,
          baseOutputPerTick: 6.7,
          produces: 'currency'
        },
        {
          id: 'gen2',
          name: 'Whispering Monolith',
          lore: 'Barnacle-encrusted obelisks transmitting low-frequency psychic instructions that recruit acolytes.',
          backstory: 'Basalt obelisks raised from oceanic trenches by forgotten pre-human architects. Inscribed with cyclopean pictograms, they emit infrasonic acoustic pulses through the brine that seep into the minds of coastal scholars worldwide, drawing willing acolytes down into the underwater library.',
          image: './assets/gen-horror-2.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-monolith">
            <path d="M8 21h8l-2-18h-4z" />
          </svg>`,
          baseCost: 1320,
          costGrowth: 1.43,
          cyclePeriodTicks: 3,
          baseOutputPerTick: 0.0058,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen1'
          },
          unlockThreshold: 530,
          milestones: GEN2_MILESTONE_TIERS
        },
        {
          id: 'gen3',
          name: 'Rift Harvester',
          lore: 'Diving bells equipped with gravimetric dredges, opening fissures that manifest monoliths.',
          backstory: 'Armored bathyspheres cast from abyssal bronze, fitted with pneumatic void dredges and quartz viewing ports. Piloted deep into the Mariana Trench, their ultrasonic drills fracture the continental crust, prying open reality-warping rifts that allow dormant monoliths to breach the seabed.',
          image: './assets/gen-horror-3.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-rift">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>`,
          baseCost: 13500,
          costGrowth: 1.46,
          cyclePeriodTicks: 6,
          baseOutputPerTick: 0.0033,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen2'
          },
          unlockThreshold: 5600,
          milestones: GEN3_MILESTONE_TIERS
        }
      ],
      upgrades: [
        {
          id: 'upg_cycle_accel',
          name: 'Fever Dreams',
          description: 'Speeds research Cycle frequency by 6%',
          lore: 'Hallucinogenic deep-sea flora eliminate the necessity for mundane slumber.',
          backstory: 'Distilled from phosphorescent kelp harvested along hydrothermal vents. Consuming the bitter brew liberates the scholar intellect from the constraint of physical sleep, allowing relentless analysis of submerged star-matrices and accelerating research frequency by 6%.',
          image: './assets/upg-astrolabe.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
          </svg>`,
          baseCost: 215,
          costGrowth: 2.60,
          maxLevel: 6,
          effect: {
            target: 'cycleFrequency',
            operation: 'multiply',
            value: 1.06
          }
        },
        {
          id: 'upg_gen1_overdrive',
          name: 'Black Ink Inscription',
          description: 'Increases Cult Acolyte output by 1.10x per level',
          lore: 'Binding glyphs penned in cephalopod bioluminescent ichor.',
          backstory: 'Drawn from abyssal giant cephalopods that feed upon thermal plumes. This viscous black ink remains warm to the touch and glows faintly in absolute darkness. Texts copied with this ink crawl across the page, compelling acolytes to furious transcriptive output.',
          image: './assets/upg-black-ink.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          </svg>`,
          baseCost: 420,
          costGrowth: 2.65,
          maxLevel: 6,
          effect: {
            target: 'generator',
            targetId: 'gen1',
            operation: 'multiply',
            value: 1.10
          }
        },
        {
          id: 'upg_period_compress',
          name: 'Infrasonic Tidal Pulse',
          description: 'Halves Generator Tick Periods across the Abyssal Archive (+20% Overdrive at <=1s)',
          lore: 'Synchronizes obelisk vibrations with deep-trench seismic currents.',
          backstory: 'By tuning the basalt monoliths to the resonant frequency of the Mariana Trench, psychic transmissions and rift excavations complete in half the required Ticks, driving the archive toward 1.20x Overdrive.',
          image: './assets/upg-hysteria.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>`,
          baseCost: 2700,
          costGrowth: 4.3,
          maxLevel: 2,
          milestoneRank: 2,
          unlockThreshold: 1300,
          prerequisites: [{ id: 'upg_cycle_accel', minLevel: 1 }],
          effect: {
            target: 'generatorPeriod',
            targetId: 'all',
            operation: 'divide',
            value: 2.0
          }
        },
        {
          id: 'upg_doctrine_surge',
          name: 'Doctrine: Trench Rupture',
          description: 'Branch Choice: +20% all Layer 0 insight and +20% Rift Tide Surge (locks Pelagic Brood)',
          lore: 'Unseals pressurised resonance valves across the Abyssal Bell Jar.',
          backstory: 'Cracks the deep-trench acoustic domes whenever pressure peaks, letting dual-tick Rift Tides rip unfiltered astronomical revelations into the scriptorium.',
          image: './assets/upg-void-gaze.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>`,
          baseCost: 8600,
          costGrowth: 1,
          maxLevel: 1,
          milestoneRank: 2,
          unlockThreshold: 4100,
          prerequisites: [{ id: 'upg_period_compress', minLevel: 1 }],
          exclusiveWith: ['upg_doctrine_cascade'],
          effect: {
            target: 'layerGenerators',
            targetId: 'layer0',
            operation: 'multiply',
            value: 1.20
          },
          effects: [
            {
              target: 'surgeMultiplier',
              targetId: 'layer0',
              operation: 'multiply',
              value: 1.20
            }
          ]
        },
        {
          id: 'upg_doctrine_cascade',
          name: 'Doctrine: Pelagic Brood',
          description: 'Branch Choice: +35% Monolith/Rift summoning and +75% Bay Capacity (locks Trench Rupture)',
          lore: 'Carves submerged cloisters for growing orders of deep-sea scribes.',
          backstory: 'Hollows adjacent basalt vaults beneath the archive dome so newly summoned acolytes and monoliths commune without sonic interference.',
          image: './assets/upg-geometries.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>`,
          baseCost: 8600,
          costGrowth: 1,
          maxLevel: 1,
          milestoneRank: 2,
          unlockThreshold: 4100,
          prerequisites: [{ id: 'upg_period_compress', minLevel: 1 }],
          exclusiveWith: ['upg_doctrine_surge'],
          effect: {
            target: 'cascadeMeta',
            targetId: 'layer0',
            operation: 'multiply',
            value: 1.35
          },
          effects: [
            {
              target: 'bayCapacity',
              targetId: 'layer0',
              operation: 'multiply',
              value: 1.75
            }
          ]
        },
        {
          id: 'upg_cross_synergy',
          name: 'Gestalt Chorus',
          description: 'Boosts all Layer 0 output by +0.28% per total Generator bought',
          lore: 'Every acolyte and obelisk joins the submerged telepathic choir.',
          backstory: 'Intertwines the minds of all acolytes with the acoustic hum of every monolith and rift dredge, magnifying total insight yield with every new unit commissioned.',
          image: './assets/upg-geometries.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
          </svg>`,
          baseCost: 14200,
          costGrowth: 3.7,
          maxLevel: 3,
          milestoneRank: 3,
          unlockThreshold: 7100,
          requireMode: 'any',
          prerequisites: [
            { id: 'upg_doctrine_surge', minLevel: 1 },
            { id: 'upg_doctrine_cascade', minLevel: 1 }
          ],
          effect: {
            target: 'crossGeneratorSynergy',
            targetId: 'layer0',
            operation: 'add',
            value: 0.0028
          }
        },
        {
          id: 'upg_milestone_resonance',
          name: 'Eldritch Ordination',
          description: 'Multiplies Milestone Tier bonuses by 1.18x and Bay Capacity by 1.25x per level',
          lore: 'Bestows deep-sea eyes and expanded cloisters upon initiated orders.',
          backstory: 'Once an order of scribes or monoliths reaches its milestone threshold, they undergo the Rite of the Drowned Star, amplifying Milestone Tiers and expanding archive quarters.',
          image: './assets/upg-black-ink.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9 12 2" />
          </svg>`,
          baseCost: 30000,
          costGrowth: 4.3,
          maxLevel: 2,
          milestoneRank: 3,
          unlockThreshold: 15000,
          prerequisites: [{ id: 'upg_cross_synergy', minLevel: 1 }],
          effect: {
            target: 'milestoneMultiplier',
            targetId: 'layer0',
            operation: 'multiply',
            value: 1.18
          },
          effects: [
            {
              target: 'bayCapacity',
              targetId: 'layer0',
              operation: 'multiply',
              value: 1.25
            }
          ]
        },
        {
          id: 'upg_tick_amp',
          name: 'Lucid Trance Channel',
          description: 'Multiplies Ticks emitted per Cycle by 1.5x per level',
          lore: 'Allows the conscious intellect to perceive past and present simultaneously.',
          backstory: 'Through curved obsidian mirrors polished with sea-salt, researchers divide their waking consciousness across multiple temporal planes, harvesting additional insight pulses generated per cycle.',
          image: './assets/upg-lenses.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
          </svg>`,
          baseCost: 58000,
          costGrowth: 7.0,
          maxLevel: 3,
          unlockThreshold: 29000,
          prerequisites: [{ id: 'upg_cross_synergy', minLevel: 1 }],
          effect: {
            target: 'tickYield',
            operation: 'multiply',
            value: 1.5
          }
        },
        {
          id: 'upg_log_momentum',
          name: 'Trench Gravity Collapse',
          description: 'Scales all Layer 0 output by log10(Run Insight)^0.14',
          lore: 'Accumulated forbidden knowledge bends the local spacetime metric.',
          backstory: 'As the archive fills with translated star-charts, the sheer weight of forbidden insight warps reality inside the dome, accelerating transcription rates logarithmically.',
          image: './assets/upg-void-gaze.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v20M2 12h20" />
            <circle cx="12" cy="12" r="7" />
          </svg>`,
          baseCost: 72000,
          costGrowth: 1,
          maxLevel: 1,
          milestoneRank: 4,
          unlockThreshold: 36000,
          prerequisites: [{ id: 'upg_milestone_resonance', minLevel: 1 }],
          effect: {
            target: 'logMomentum',
            targetId: 'layer0',
            operation: 'add',
            value: 0.14
          }
        }
      ]
    },
    {
      id: 'layer1',
      name: 'The Nameless Void',
      image: './assets/icon-horror-l1.jpg',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>`,
      currency: {
        id: 'shards',
        name: 'Void Shards',
        symbol: 'VSH',
        initialAmount: 0
      },
      prestige: {
        targetLayerId: 'layer0',
        thresholdCurrency: 1e6,
        actionLabel: 'Trigger Mind Shatter',
        rewardFormula: (runTotal) => {
          const base = runTotal.div(1e6);
          if (base.lt(1)) return 0;
          return base.pow(0.5).floor();
        },
        passiveMultiplierFormula: (unspentCurrency) => {
          return unspentCurrency.mul(0.55).add(1);
        }
      },
      generators: [],
      upgrades: [
        {
          id: 'upg_l1_exp_mult',
          name: 'Non-Euclidean Echoes',
          description: 'Multiplies all Layer 0 output by 2.55x per level',
          lore: 'Echoes from unmapped spatial dimensions warp mortal comprehension.',
          backstory: 'Resonances bouncing off submerged cyclopean architecture return to the listener before the initial wave was produced. By listening through helical conch shells, scholars tap into hyper-dimensional geometric theorems that multiply mortal research capacity by 2.55x per rank.',
          image: './assets/upg-void-gaze.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          </svg>`,
          baseCost: 1,
          costGrowth: 2.0,
          maxLevel: 5,
          effect: {
            target: 'layerGenerators',
            targetId: 'layer0',
            operation: 'multiply',
            value: 2.55
          }
        },
        {
          id: 'upg_l1_clock',
          name: 'Frozen Epoch',
          description: 'Adds +1 base Tick per Cycle',
          lore: 'Suspends the passage of local time within the flooded library.',
          backstory: 'Sealed behind stone airlocks carved with slumbering cephalopod sigils, the archive exists in a pocket of stopped time. Surface decades elapse in minutes while the archive interior generates relentless additional research ticks per cycle.',
          image: './assets/upg-hysteria.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 8 10" />
          </svg>`,
          baseCost: 2,
          costGrowth: 3.0,
          maxLevel: 5,
          prerequisites: [{ id: 'upg_l1_exp_mult', minLevel: 1 }],
          exclusiveWith: ['upg_l1_synergy'],
          effect: {
            target: 'tickYield',
            operation: 'add',
            value: 1.0
          }
        },
        {
          id: 'upg_l1_synergy',
          name: 'Hierophant Fanaticism',
          description: 'Increases purchase synergy from 1.025x to 1.075x',
          lore: 'Devotees sacrifice reason to commune directly with cosmic entities.',
          backstory: 'Acolytes abandon individual ego, intertwining their neural pathways into a shared telepathic hive mind. Each new obelisk and acolyte brought into the circle reinforces the psychic trance, elevating the cumulative synergy of all research assets.',
          image: './assets/upg-geometries.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>`,
          baseCost: 2,
          costGrowth: 3.0,
          maxLevel: 5,
          prerequisites: [{ id: 'upg_l1_exp_mult', minLevel: 1 }],
          exclusiveWith: ['upg_l1_clock'],
          effect: {
            target: 'boughtSynergy',
            targetId: 'layer0',
            operation: 'add',
            value: 0.05
          }
        },
        {
          id: 'upg_l1_apex',
          name: 'The Abyssal Awakening',
          description: 'Dynamic boost scaling with total progression time',
          lore: 'The entity sleeping beneath the ocean trench stirs in slumber.',
          backstory: 'Kilometers beneath the bedrock, an ancient titan stirs in eons-old slumber. As the observatory continues its vigil, the dream waves radiated by the sleeper grow stronger, compounding insight yields continuously with every tick of elapsed time.',
          image: './assets/upg-void-gaze.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>`,
          baseCost: 5,
          costGrowth: 1,
          maxLevel: 1,
          prerequisites: [
            { id: 'upg_l1_clock', minLevel: 1 },
            { id: 'upg_l1_synergy', minLevel: 1 }
          ],
          requireMode: 'any',
          effect: {
            target: 'layerGenerators',
            targetId: 'layer0',
            formula: (state) => {
              const logVal = Math.log10(Math.max(1, state.totalTicks.toNumber()));
              return (1 + logVal * 0.52);
            }
          }
        }
      ]
    }
  ]
});
