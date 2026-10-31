// src/games/sunken-observatory.js
// Cosmic Horror / Eldritch Investigation GameConfig with presentation metadata, lore, and SVG assets

export const sunkenObservatoryGame = {
  id: 'sunken-observatory',
  name: 'The Sunken Observatory',
  subtitle: 'Unearth eldritch secrets submerged beneath the abyssal depths',
  palette: {
    '--bg': '#040b0e',
    '--card-bg': '#07161b',
    '--card-border': '#112d37',
    '--primary': '#2dd4bf',
    '--primary-hover': '#14b8a6',
    '--secondary': '#a78bfa',
    '--danger': '#f43f5e',
    '--danger-hover': '#e11d48',
    '--success': '#10b981',
    '--accent': '#f472b6'
  },
  character: {
    name: 'Curator Ambrose',
    title: 'Sole Keeper of the Abyssal Vault',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" stroke="#2dd4bf" stroke-width="2" />
      <path d="M16 32 C16 20, 48 20, 48 32 C48 44, 16 44, 16 32 Z" stroke="#a78bfa" stroke-width="2" fill="rgba(167,139,250,0.2)" />
      <circle cx="32" cy="32" r="6" fill="#f472b6" />
      <circle cx="32" cy="32" r="2" fill="#040b0e" />
      <path d="M20 48 Q32 58 44 48" stroke="#2dd4bf" stroke-width="2" fill="none" />
      <path d="M28 12 L32 6 L36 12" stroke="#2dd4bf" stroke-width="2" />
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
    baseCycleDurationMs: 1000,
    baseTicksPerCycle: 1
  },
  layers: [
    {
      id: 'layer0',
      name: 'The Abyssal Archive',
      boughtSynergyMultiplier: 1.02,
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
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>`,
          baseCost: 10,
          costGrowth: 1.27,
          baseOutputPerTick: 1.0,
          produces: 'currency'
        },
        {
          id: 'gen2',
          name: 'Whispering Monolith',
          lore: 'Barnacle-encrusted obelisks transmitting low-frequency psychic instructions that recruit acolytes.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 21h8l-2-18h-4z" />
          </svg>`,
          baseCost: 360,
          costGrowth: 1.29,
          baseOutputPerTick: 0.1,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen1'
          },
          unlockThreshold: 250
        },
        {
          id: 'gen3',
          name: 'Rift Harvester',
          lore: 'Diving bells equipped with gravimetric dredges, opening fissures that manifest monoliths.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>`,
          baseCost: 6600,
          costGrowth: 1.35,
          baseOutputPerTick: 0.02,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen2'
          },
          unlockThreshold: 5000
        }
      ],
      upgrades: [
        {
          id: 'upg_cycle_accel',
          name: 'Fever Dreams',
          description: 'Speeds research Cycle frequency by 15%',
          lore: 'Hallucinogenic deep-sea flora eliminate the necessity for mundane slumber.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
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
          name: 'Lucid Trance Channel',
          description: 'Doubles Ticks emitted per Cycle',
          lore: 'Allows the conscious intellect to perceive past and present simultaneously.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
          </svg>`,
          baseCost: 1500,
          costGrowth: 4.0,
          maxLevel: 5,
          effect: {
            target: 'tickYield',
            operation: 'multiply',
            value: 2.0
          }
        },
        {
          id: 'upg_gen1_overdrive',
          name: 'Black Ink Inscription',
          description: 'Increases Cult Acolyte output by 1.75x per level',
          lore: 'Binding glyphs penned in cephalopod bioluminescent ichor.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
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
      name: 'The Nameless Void',
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
};
