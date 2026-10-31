// src/games/aetherforge.js
// Fantasy / Arcane World GameConfig with presentation metadata, lore, and SVG assets

export const aetherforgeGame = {
  id: 'aetherforge',
  name: 'Aetherforge: The Grand Ascension',
  subtitle: 'Weave raw celestial mana and bind arcane constructs',
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
    '--card-glow': '0 0 24px rgba(192, 132, 252, 0.12), inset 0 0 14px rgba(251, 191, 36, 0.04)',
    '--card-bg-gradient': 'linear-gradient(180deg, rgba(24, 15, 45, 0.9) 0%, rgba(16, 10, 30, 0.96) 100%)',
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
  scenery: `<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="astral-moon" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#fef08a" stop-opacity="0.85" />
        <stop offset="30%" stop-color="#c084fc" stop-opacity="0.5" />
        <stop offset="70%" stop-color="#38bdf8" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#090510" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="spire-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#c084fc" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#130c24" stop-opacity="0.9" />
      </linearGradient>
    </defs>
    <!-- Celestial Astral Moon -->
    <circle cx="20%" cy="30%" r="130" fill="url(#astral-moon)" />
    <!-- Floating Astral Constellations -->
    <g stroke="#fbbf24" stroke-width="1" stroke-opacity="0.3" fill="#fbbf24">
      <circle cx="150" cy="90" r="2" />
      <circle cx="280" cy="140" r="1.5" />
      <circle cx="340" cy="70" r="2.5" />
      <circle cx="460" cy="110" r="1.5" />
      <line x1="150" y1="90" x2="280" y2="140" />
      <line x1="280" y1="140" x2="340" y2="70" />
      <line x1="340" y1="70" x2="460" y2="110" />
    </g>
    <!-- Arcane Citadels and Spires Silhouette -->
    <polygon points="120,400 170,180 220,400" fill="url(#spire-grad)" />
    <polygon points="190,400 230,220 270,400" fill="#2d1b4e" fill-opacity="0.7" />
    <polygon points="780,400 840,140 900,400" fill="url(#spire-grad)" />
    <polygon points="870,400 910,240 950,400" fill="#2d1b4e" fill-opacity="0.7" />
    <polygon points="980,400 1040,190 1100,400" fill="url(#spire-grad)" />
    <!-- Arcane Leyline Beams -->
    <path d="M0 370 Q 300 290 600 340 T 1200 310" fill="none" stroke="#c084fc" stroke-width="2" stroke-opacity="0.25" stroke-dasharray="10 5" />
    <path d="M0 385 Q 400 330 800 370 T 1200 350" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-opacity="0.2" />
  </svg>`,
  character: {
    name: 'Archmage Vaelen',
    title: 'Keeper of the Prismatic Loom',
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
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-conduit">
            <line x1="12" y1="2" x2="12" y2="22" />
            <circle cx="12" cy="7" r="3" />
            <circle cx="12" cy="17" r="3" />
          </svg>`,
          baseCost: 380,
          costGrowth: 1.30,
          baseOutputPerTick: 0.1,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen1'
          },
          unlockThreshold: 260
        },
        {
          id: 'gen3',
          name: 'Astral Citadel',
          lore: 'Floating spire-sanctuaries anchored in the astral plane, projecting conduits onto earth.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-citadel">
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
          </svg>`,
          baseCost: 7000,
          costGrowth: 1.36,
          baseOutputPerTick: 0.02,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen2'
          },
          unlockThreshold: 5200
        }
      ],
      upgrades: [
        {
          id: 'upg_cycle_accel',
          name: 'Chrono-Incantation',
          description: 'Speeds weave frequency by 15%',
          lore: 'Compresses casting syllables through harmonic vocal resonances.',
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
            value: 1.15
          }
        },
        {
          id: 'upg_tick_amp',
          name: 'Prismatic Loom',
          description: 'Doubles Ticks emitted per Cycle',
          lore: 'Splits each strand of mana into dual resonant frequencies.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <polygon points="12 2 2 22 22 22 12 2" />
          </svg>`,
          baseCost: 1400,
          costGrowth: 3.8,
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
          description: 'Boosts Runic Familiar mana harvest by 1.75x per level',
          lore: 'Tethers spirits directly to the caster’s spiritual reservoir.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>`,
          baseCost: 400,
          costGrowth: 3.0,
          maxLevel: 10,
          effect: {
            target: 'generator',
            targetId: 'gen1',
            operation: 'multiply',
            value: 1.75
          }
        }
      ]
    },
    {
      id: 'layer1',
      name: 'Sanctum of Ascension',
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
