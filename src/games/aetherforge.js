// src/games/aetherforge.js
// Fantasy / Arcane World GameConfig with presentation metadata, lore, and SVG assets

import { compileGameConfig, GEN2_MILESTONE_TIERS, GEN3_MILESTONE_TIERS } from './blueprint.js';

export const aetherforgeGame = compileGameConfig({
  id: 'aetherforge',
  name: 'Aetherforge: The Grand Ascension',
  shortName: 'Aetherforge',
  subtitle: 'Weave raw celestial mana and bind arcane constructs',
  prestigeImage: './assets/prestige-aetherforge.jpg',
  prestigeTitle: 'Astral Transmutation Gateway',
  palette: {
    '--bg': '#08050f',
    '--card-bg': '#110b1f',
    '--card-border': 'rgba(176, 132, 235, 0.24)',
    '--text': '#e6dcf2',
    '--text-muted': '#a393ba',
    '--primary': '#b88ae6',
    '--primary-hover': '#d0acf5',
    '--secondary': '#38bdf8',
    '--danger': '#f43f5e',
    '--danger-hover': '#e11d48',
    '--success': '#34d399',
    '--accent': '#e5b344',
    '--font-display': "'Cinzel', 'Trajan Pro', 'Georgia', serif",
    '--font-body': "'Cormorant Garamond', 'Garamond', 'Palatino Linotype', serif",
    '--bg-pattern': 'radial-gradient(circle at 50% 0%, rgba(9, 5, 16, 0.30) 0%, rgba(9, 5, 16, 0.80) 100%), url("./assets/bg-aetherforge.jpg")',
    '--panel-l0-bg': 'url("./assets/panel-aetherforge.jpg")',
    '--panel-l1-bg': 'url("./assets/panel-aetherforge.jpg")',
    '--panel-overlay-l0': 'linear-gradient(135deg, rgba(20, 12, 38, 0.85) 0%, rgba(11, 6, 22, 0.94) 100%)',
    '--panel-overlay-l1': 'linear-gradient(135deg, rgba(20, 12, 38, 0.85) 0%, rgba(11, 6, 22, 0.94) 100%)',
    '--card-glow': '0 0 20px rgba(184, 138, 230, 0.11), inset 0 0 12px rgba(229, 179, 68, 0.05)',
    '--card-bg-gradient': 'linear-gradient(180deg, rgba(24, 15, 44, 0.90) 0%, rgba(14, 9, 28, 0.96) 100%)',
    '--border-radius-panel': '16px',
    '--border-radius-card': '12px',
    '--border-radius-btn': '8px',
    '--banner-bg': 'linear-gradient(135deg, rgba(24, 15, 44, 0.95) 0%, rgba(16, 10, 30, 0.88) 100%)',
    '--banner-border': 'rgba(184, 138, 230, 0.30)',
    '--tag-case': 'none',
    '--tag-letter-spacing': '0.04em',
    '--badge-bg': 'rgba(184, 138, 230, 0.14)',
    '--badge-color': '#e2cdf7',
    '--btn-bg': 'rgba(0, 0, 0, 0.60)',
    '--btn-bg-hover': 'rgba(0, 0, 0, 0.78)',
    '--btn-bg-disabled': 'rgba(0, 0, 0, 0.45)',
    '--btn-text': '#ffffff',
    '--btn-text-disabled': 'rgba(255, 255, 255, 0.42)',
    '--btn-primary-border': 'rgba(184, 138, 230, 0.72)',
    '--btn-primary-glow': 'inset 0 0 12px rgba(184, 138, 230, 0.20), 0 2px 8px rgba(0, 0, 0, 0.5)',
    '--btn-sec-bg': 'rgba(0, 0, 0, 0.60)',
    '--btn-sec-color': '#ffffff',
    '--btn-sec-border': 'rgba(229, 179, 68, 0.38)',
    '--upg-card-scrim': 'linear-gradient(135deg, rgba(8, 5, 16, 0.90) 0%, rgba(12, 7, 24, 0.80) 52%, rgba(16, 10, 32, 0.62) 100%)',
    '--upg-card-scrim-hover': 'linear-gradient(135deg, rgba(8, 5, 16, 0.82) 0%, rgba(12, 7, 24, 0.70) 52%, rgba(16, 10, 32, 0.48) 100%)',
    '--viewport-vignette': 'radial-gradient(circle at 50% 45%, transparent 50%, rgba(5, 2, 10, 0.60) 100%)',
    '--title-text-shadow': '0 0 14px rgba(184, 138, 230, 0.25)'
  },
  scenery: `<img src="./assets/bg-aetherforge.jpg" alt="Aetherforge Astral Sanctum Panorama" class="scenery-img" />`,
  character: {
    name: 'Archmage Vaelen',
    title: 'Keeper of the Prismatic Loom',
    image: './assets/portrait-aetherforge.jpg',
    backstory: 'Keeper of the Celestial Loom and master of ethereal transmutations. Archmage Vaelen has channeled planetary leylines for over three centuries, transmuting raw cosmic starlight into indestructible magical constructs and weaving the astral fabric of reality.',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="char-svg-aether">
      <defs>
        <radialGradient id="vaelen-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#c084fc" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle class="halo-pulse" cx="32" cy="24" r="22" fill="url(#vaelen-halo)" />
      <circle class="rune-orbit" cx="32" cy="32" r="28" stroke="#c084fc" stroke-width="2" stroke-dasharray="6 3" />
      <path class="robe-drape" d="M20 50 C20 34, 44 34, 44 50" stroke="#38bdf8" stroke-width="2.5" fill="rgba(56,189,248,0.2)" />
      <circle cx="32" cy="24" r="8" stroke="#fbbf24" stroke-width="2" fill="rgba(251,191,36,0.3)" />
      <!-- Archmage Crest / Floating Crown -->
      <polygon class="crown-float" points="32,2 37,13 48,13 39,20 42,31 32,25 22,31 25,20 16,13 27,13" fill="#fbbf24" />
      <circle cx="32" cy="24" r="2" fill="#fff" />
    </svg>`,
    dialogue: {
      intro: 'The Aetherial Loom awakens. Whisper the incantations to summon Runic Familiars to harvest raw Mana.',
      gen2Revealed: 'The ley currents deepen! Runic Conduits now automatically conjure Familiars from the astral veil.',
      gen3Revealed: 'Astral Citadels rise into the heavens, weaving entire conduits of cosmic energy.',
      prestigeVisible: 'The Loom strains with raw celestial resonance. We can perform the Grand Ascension to crystallize Arcane Sigils.',
      prestigeExecuted: 'Ascension complete! The crystallized Sigils empower all future weave patterns.'
    }
  },
  clock: {
    baseCycleDurationMs: 4000,
    baseTicksPerCycle: 1
  },
  layers: [
    {
      id: 'layer0',
      name: 'The Aetherial Weave',
      boughtSynergyMultiplier: 1.016,
      overdriveMultiplier: 1.16,
      bayCapacity: {
        gen1: { base: 6, perBought: 0.80 },
        gen2: { base: 4, perBought: 0.8 },
        gen3: { base: 3, perBought: 0.8 }
      },
      capacitor: {
        name: 'Astral Crucible',
        pulseLabel: 'Invoke Chant',
        dischargeLabel: 'Unleash Leyflare',
        surgeName: 'Astral Leyflare',
        pulseCooldownMs: 15000,
        pulseBaseCurrency: 4,
        pulseRateSec: 1.1,
        pulseCharge: 0.045,
        passiveChargePerTick: 0.003,
        minDischargeCharge: 0.40,
        surgeMultiplier: 1.70,
        surgeCycleFreqMult: 1.12,
        surgeTickMult: 1,
        maxSurgeTicks: 22
      },
      defaultStanceId: 'balanced',
      stances: [
        {
          id: 'balanced',
          name: 'Harmonic Weave',
          description: 'Balanced 1.0x mana harvest, summoning speed, and crucible charge.',
          currencyMult: 1.0,
          metaMult: 1.0,
          chargeMult: 1.0,
          cycleFreqMult: 1.0
        },
        {
          id: 'extraction',
          name: 'Channeled Harvest',
          description: '+20% mana harvest, +8% chant tempo, -35% summoning rate.',
          currencyMult: 1.20,
          metaMult: 0.65,
          chargeMult: 0.90,
          cycleFreqMult: 1.08
        },
        {
          id: 'cascade',
          name: 'Planar Conjuration',
          description: '+55% conduit/citadel summoning, +75% crucible charge, -32% direct MP.',
          currencyMult: 0.68,
          metaMult: 1.55,
          chargeMult: 1.75,
          cycleFreqMult: 1.0
        }
      ],
      image: './assets/icon-aether-l0.jpg',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>`,
      currency: {
        id: 'mana',
        name: 'Mana',
        symbol: 'MP',
        initialAmount: 10
      },
      generators: [
        {
          id: 'gen1',
          name: 'Runic Familiar',
          lore: 'Minor ethereal spirits bonded to harvest lingering ambient mana crystals.',
          backstory: 'Spiritual entities summoned from the twilight realm between dreams and reality. Bound by silver torcs inscribed with primordial binding runes, these glowing sprites flutter through ancient crystalline caves, gathering ambient mana condensation and transmuting it directly into pure magical energy.',
          image: './assets/gen-aether-1.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-familiar">
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4 21l3.39-.97C8.93 20.66 10.42 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
            <circle cx="9" cy="11" r="1" fill="#c084fc" />
            <circle cx="15" cy="11" r="1" fill="#c084fc" />
          </svg>`,
          baseCost: 10,
          costGrowth: 1.388,
          cyclePeriodTicks: 1,
          baseOutputPerTick: 3.15,
          produces: 'currency',
          milestones: [
            { id: 'm0', rank: 0, name: 'Common', minBought: 0, multiplier: 1 },
            { id: 'm1', rank: 1, name: 'Uncommon', minBought: 22, multiplier: 2 },
            { id: 'm2', rank: 2, name: 'Rare', minBought: 48, multiplier: 4 },
            { id: 'm3', rank: 3, name: 'Epic', minBought: 100, multiplier: 12 },
            { id: 'm4', rank: 4, name: 'Legendary', minBought: 240, multiplier: 50 }
          ]
        },
        {
          id: 'gen2',
          name: 'Leyline Conduit',
          lore: 'Carved obsidian pillars drawing subterranean mystic currents to manifest familiars.',
          backstory: 'Monolithic pillars of enchanted volcanic glass driven deep into subterranean planar faults. By channeling subterranean veins of raw planetary magic upward into consecrated runic circles, each conduit automatically summons and binds new Runic Familiars to expand the weave.',
          image: './assets/gen-aether-2.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-conduit">
            <line x1="12" y1="2" x2="12" y2="22" />
            <circle cx="12" cy="7" r="3" />
            <circle cx="12" cy="17" r="3" />
          </svg>`,
          baseCost: 1280,
          costGrowth: 1.43,
          cyclePeriodTicks: 3,
          baseOutputPerTick: 0.0038,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen1'
          },
          unlockThreshold: 520,
          milestones: GEN2_MILESTONE_TIERS
        },
        {
          id: 'gen3',
          name: 'Astral Citadel',
          lore: 'Floating spire-sanctuaries anchored in the astral plane, projecting conduits onto earth.',
          backstory: 'Floating spire-fortresses suspended between the physical earth and the celestial astral plane. Governed by circle sorcerers in perpetual meditation, these sky-sanctuaries project harmonic resonance beams onto terrestrial landscapes, transmuting bedrock into self-constructing Leyline Conduits.',
          image: './assets/gen-aether-3.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-citadel">
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
          </svg>`,
          baseCost: 13000,
          costGrowth: 1.46,
          cyclePeriodTicks: 6,
          baseOutputPerTick: 0.0031,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen2'
          },
          unlockThreshold: 5500,
          milestones: GEN3_MILESTONE_TIERS
        }
      ],
      upgrades: [
        {
          id: 'upg_cycle_accel',
          name: 'Chrono-Incantation',
          description: 'Speeds weave frequency by 5.5%',
          lore: 'Compresses casting syllables through harmonic vocal resonances.',
          backstory: 'An ancient polyphonic casting technique perfected by the First Chantry. By overlapping vocal cadences across three tonal registers simultaneously, complex spell formulas collapse into pure musical chords, quickening weave cycles by 5.5%.',
          image: './assets/upg-leyline.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 8 14" />
          </svg>`,
          baseCost: 210,
          costGrowth: 2.60,
          maxLevel: 6,
          effect: {
            target: 'cycleFrequency',
            operation: 'multiply',
            value: 1.055
          }
        },
        {
          id: 'upg_gen1_overdrive',
          name: 'Ethereal Bond',
          description: 'Boosts Runic Familiar mana harvest by 1.10x per level',
          lore: 'Tethers spirits directly to the caster spiritual reservoir.',
          backstory: 'A sacred blood-and-mana pact inscribed onto the familiar spirits astral essence. By opening an unbroken psychic channel to the archmage, the spirits draw upon bottomless reservoirs of will, boosting each familiar mana yield by 10% per rank.',
          image: './assets/upg-bond.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>`,
          baseCost: 410,
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
          name: 'Quickened Invocation',
          description: 'Halves Generator Tick Periods across the Aetherial Weave (+16% Overdrive at <=1s)',
          lore: 'Inscribes haste glyphs directly into obsidian leyline pillars.',
          backstory: 'By weaving temporal haste runes into the foundation of every Leyline Conduit and Astral Citadel, ritual conjurations complete in half the required Ticks, driving arcane constructs toward 1.16x Overdrive.',
          image: './assets/upg-spirits.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
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
          name: 'Doctrine: Solar Leyflare',
          description: 'Branch Choice: +20% all Layer 0 mana and +22% Astral Leyflare Surge (locks Endless Summoning)',
          lore: 'Attunes the Astral Crucible to violent stellar flare eruptions.',
          backstory: 'Channels celestial fire directly through crystallized crucible sigils, transforming every Astral Leyflare into an overwhelming flood of condensed ether.',
          image: './assets/upg-astral-amp.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>`,
          baseCost: 8400,
          costGrowth: 1,
          maxLevel: 1,
          milestoneRank: 2,
          unlockThreshold: 4000,
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
              value: 1.22
            }
          ]
        },
        {
          id: 'upg_doctrine_cascade',
          name: 'Doctrine: Endless Summoning',
          description: 'Branch Choice: +32% Conduit/Citadel summoning rate and +75% Bay Capacity (locks Solar Leyflare)',
          lore: 'Unbinds planar summoning circles to hold vast cohorts of familiars.',
          backstory: 'Expands the geometric chalk perimeter of every summoning hall, letting summoned familiars and conduits weave without magical congestion.',
          image: './assets/upg-spirits.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>`,
          baseCost: 8400,
          costGrowth: 1,
          maxLevel: 1,
          milestoneRank: 2,
          unlockThreshold: 4000,
          prerequisites: [{ id: 'upg_period_compress', minLevel: 1 }],
          exclusiveWith: ['upg_doctrine_surge'],
          effect: {
            target: 'cascadeMeta',
            targetId: 'layer0',
            operation: 'multiply',
            value: 1.32
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
          name: 'Covenant of the Circle',
          description: 'Boosts all Layer 0 output by +0.30% per total Generator bought',
          lore: 'Every summoned familiar and spire harmonizes with the grand chantry.',
          backstory: 'Links every Runic Familiar, Conduit, and Citadel into a sympathetic arcane chorus where each newly bound construct amplifies the potency of the entire weave.',
          image: './assets/upg-planetary-siphon.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" />
            <polygon points="12 4 19 18 5 18 12 4" />
          </svg>`,
          baseCost: 14000,
          costGrowth: 3.7,
          maxLevel: 3,
          milestoneRank: 3,
          unlockThreshold: 7000,
          requireMode: 'any',
          prerequisites: [
            { id: 'upg_doctrine_surge', minLevel: 1 },
            { id: 'upg_doctrine_cascade', minLevel: 1 }
          ],
          effect: {
            target: 'crossGeneratorSynergy',
            targetId: 'layer0',
            operation: 'add',
            value: 0.0030
          }
        },
        {
          id: 'upg_milestone_resonance',
          name: 'Runic Sanctification',
          description: 'Multiplies Milestone Tier bonuses by 1.18x and Bay Capacity by 1.25x per level',
          lore: 'Consecrates familiar covens once a circle reaches 22 bound spirits.',
          backstory: 'When 22 constructs of a single order are gathered, high artificers anoint them in liquid starlight, magnifying every Milestone Tier and expanding sanctuary space.',
          image: './assets/upg-bond.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
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
          name: 'Prismatic Loom',
          description: 'Multiplies Ticks emitted per Cycle by 1.5x per level',
          lore: 'Splits each strand of mana into dual resonant frequencies.',
          backstory: 'Carved from a fallen celestial prism discovered in the crater of Mount Vael. The loom splits unformed ether into golden dawn and violet dusk harmonic spectra, allowing the spellcaster to harvest more discrete mana pulses during every weave resonance.',
          image: './assets/upg-prism.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <polygon points="12 2 2 22 22 22 12 2" />
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
          name: 'Aetherial Vortex Cascade',
          description: 'Scales all Layer 0 output by log10(Run Mana)^0.14',
          lore: 'Accumulated mana bends local gravity into an arcane whirlpool.',
          backstory: 'As the sanctum reservoir swells with gathered mana, its metaphysical density warps the surrounding ether, drawing ambient magic inward at an accelerating logarithmic rate.',
          image: './assets/upg-astral-amp.jpg',
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
      name: 'Sanctum of Ascension',
      image: './assets/icon-aether-l1.jpg',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" />
        <polygon points="12 6 15 11 20 12 16 16 17 21 12 18 7 21 8 16 4 12 9 11 12 6" />
      </svg>`,
      currency: {
        id: 'sigils',
        name: 'Arcane Sigils',
        symbol: 'SIG',
        initialAmount: 0
      },
      prestige: {
        targetLayerId: 'layer0',
        thresholdCurrency: 1e6,
        actionLabel: 'Perform Grand Ascension',
        rewardFormula: (runTotal) => {
          const base = runTotal.div(1e6);
          if (base.lt(1)) return 0;
          return base.pow(0.5).floor();
        },
        passiveMultiplierFormula: (unspentCurrency) => {
          return unspentCurrency.mul(0.6).add(1); // Slightly higher passive prestige boost
        }
      },
      generators: [],
      upgrades: [
        {
          id: 'upg_l1_exp_mult',
          name: 'Astral Resonance',
          description: 'Multiplies all Layer 0 output by 2.6x per level',
          lore: 'Harmonizes mortal runes with transcendent celestial frequencies.',
          backstory: 'By aligning mortal ritual glyphs with the music of the celestial spheres, the chantry dissolves terrestrial limitations. Conduits and familiars channel pure starry luminescence directly from the crown of creation, multiplying all Layer 0 production by 2.6x per tier.',
          image: './assets/upg-astral-amp.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          </svg>`,
          baseCost: 1,
          costGrowth: 2.0,
          maxLevel: 5,
          effect: {
            target: 'layerGenerators',
            targetId: 'layer0',
            operation: 'multiply',
            value: 2.6
          }
        },
        {
          id: 'upg_l1_clock',
          name: 'Temporal Enchantment',
          description: 'Adds +1 base Tick per Cycle',
          lore: 'Weaves ancient haste sigils permanently into the fabric of space.',
          backstory: 'Forged from sands gathered during the shattered Age of Chronos. This sigil dilates the flow of moments within the sanctum perimeter, causing the mortal weave to pulse with additional discrete spell-ticks during every natural heartbeat.',
          image: './assets/upg-spirits.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 14 14" />
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
          name: 'Artificer Dedication',
          description: 'Increases purchase synergy from 1.03x to 1.08x',
          lore: 'Master artisans imprint each familiar and conduit with sacred runes.',
          backstory: 'Generations of guild artificers have inscribed silver filaments across every conduit pedestal and summoning brazier. This dedicated craftsmanship ensures each newly purchased construct amplifies the metaphysical resonance of all existing generators.',
          image: './assets/upg-planetary-siphon.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
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
          name: 'The Living Loom',
          description: 'Dynamic boost scaling with total progression time',
          lore: 'The weave becomes conscious, self-generating mana across infinite timelines.',
          backstory: 'The woven strands of reality achieve sentience. The living tapestry breathes in synchrony with the cosmos, tapping into timeless currents where magic is limitless. Its output ascends ever higher with every moment spent tending its immortal threads.',
          image: './assets/upg-astral-amp.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
              return (1 + logVal * 0.55);
            }
          }
        }
      ]
    }
  ]
});
