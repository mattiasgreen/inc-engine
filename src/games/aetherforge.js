// src/games/aetherforge.js
// Fantasy / Arcane World GameConfig with presentation metadata, lore, and SVG assets

export const aetherforgeGame = {
  id: 'aetherforge',
  name: 'Aetherforge: The Grand Ascension',
  shortName: 'Aetherforge',
  subtitle: 'Weave raw celestial mana and bind arcane constructs',
  prestigeImage: './assets/prestige-aetherforge.jpg',
  prestigeTitle: 'Astral Transmutation Gateway',
  palette: {
    '--bg': '#090510',
    '--card-bg': '#130c24',
    '--card-border': '#432670',
    '--primary': '#c084fc',
    '--primary-hover': '#a855f7',
    '--secondary': '#38bdf8',
    '--danger': '#f43f5e',
    '--danger-hover': '#e11d48',
    '--success': '#34d399',
    '--accent': '#fbbf24',
    '--font-display': "'Cinzel', 'Trajan Pro', 'Georgia', serif",
    '--font-body': "'Cormorant Garamond', 'Garamond', 'Palatino Linotype', serif",
    '--bg-pattern': 'radial-gradient(circle at 50% 0%, rgba(9, 5, 16, 0.25) 0%, rgba(9, 5, 16, 0.75) 100%), url("./assets/bg-aetherforge.jpg")',
    '--panel-l0-bg': 'url("./assets/panel-aetherforge.jpg")',
    '--panel-l1-bg': 'url("./assets/panel-aetherforge.jpg")',
    '--panel-overlay-l0': 'linear-gradient(135deg, rgba(24, 15, 45, 0.82) 0%, rgba(14, 8, 26, 0.93) 100%)',
    '--panel-overlay-l1': 'linear-gradient(135deg, rgba(24, 15, 45, 0.82) 0%, rgba(14, 8, 26, 0.93) 100%)',
    '--card-glow': '0 0 24px rgba(192, 132, 252, 0.16), inset 0 0 14px rgba(251, 191, 36, 0.08)',
    '--card-bg-gradient': 'linear-gradient(180deg, rgba(28, 18, 54, 0.88) 0%, rgba(18, 11, 36, 0.95) 100%)',
    '--border-radius-panel': '16px',
    '--border-radius-card': '12px',
    '--border-radius-btn': '8px',
    '--banner-bg': 'linear-gradient(135deg, rgba(28, 17, 54, 0.95) 0%, rgba(19, 12, 36, 0.85) 100%)',
    '--banner-border': '#c084fc77',
    '--tag-case': 'none',
    '--tag-letter-spacing': '0.04em',
    '--badge-bg': 'rgba(192, 132, 252, 0.15)',
    '--badge-color': '#e9d5ff',
    '--btn-sec-bg': 'rgba(251, 191, 36, 0.12)',
    '--btn-sec-color': '#fde68a',
    '--btn-sec-border': 'rgba(251, 191, 36, 0.35)'
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
    baseCycleDurationMs: 1000,
    baseTicksPerCycle: 1
  },
  layers: [
    {
      id: 'layer0',
      name: 'The Aetherial Weave',
      boughtSynergyMultiplier: 1.02, // Arcane synergy multiplier
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
          costGrowth: 1.28,
          baseOutputPerTick: 1.0,
          produces: 'currency'
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
          baseCost: 570,
          costGrowth: 1.33,
          baseOutputPerTick: 0.05,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen1'
          },
          unlockThreshold: 360
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
          baseCost: 17500,
          costGrowth: 1.40,
          baseOutputPerTick: 0.01,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen2'
          },
          unlockThreshold: 8000
        }
      ],
      upgrades: [
        {
          id: 'upg_cycle_accel',
          name: 'Chrono-Incantation',
          description: 'Speeds weave frequency by 10%',
          lore: 'Compresses casting syllables through harmonic vocal resonances.',
          backstory: 'An ancient polyphonic casting technique perfected by the First Chantry. By overlapping vocal cadences across three tonal registers simultaneously, complex spell formulas collapse into pure musical chords, quickening weave cycles by 10%.',
          image: './assets/upg-leyline.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 8 14" />
          </svg>`,
          baseCost: 250,
          costGrowth: 2.5,
          maxLevel: 10,
          effect: {
            target: 'cycleFrequency',
            operation: 'multiply',
            value: 1.10
          }
        },
        {
          id: 'upg_tick_amp',
          name: 'Prismatic Loom',
          description: 'Doubles Ticks emitted per Cycle',
          lore: 'Splits each strand of mana into dual resonant frequencies.',
          backstory: 'Carved from a fallen celestial prism discovered in the crater of Mount Vael. The loom splits unformed ether into golden dawn and violet dusk harmonic spectra, allowing the spellcaster to harvest twice as many discrete mana pulses during every weave resonance.',
          image: './assets/upg-prism.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <polygon points="12 2 2 22 22 22 12 2" />
          </svg>`,
          baseCost: 3500,
          costGrowth: 4.5,
          maxLevel: 5,
          effect: {
            target: 'tickYield',
            operation: 'multiply',
            value: 2.0
          }
        },
        {
          id: 'upg_gen1_overdrive',
          name: 'Ethereal Bond',
          description: 'Boosts Runic Familiar mana harvest by 1.35x per level',
          lore: 'Tethers spirits directly to the caster’s spiritual reservoir.',
          backstory: 'A sacred blood-and-mana pact inscribed onto the familiar spirits astral essence. By opening an unbroken psychic channel to the archmage, the spirits draw upon bottomless reservoirs of will, boosting each familiar mana yield by 35% per rank.',
          image: './assets/upg-bond.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>`,
          baseCost: 400,
          costGrowth: 3.2,
          maxLevel: 10,
          effect: {
            target: 'generator',
            targetId: 'gen1',
            operation: 'multiply',
            value: 1.35
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
};
