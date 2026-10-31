// src/games/dyson-swarm.js
// Engineering / Megastructure World GameConfig with presentation metadata, lore, and SVG assets

export const dysonSwarmGame = {
  id: 'dyson-swarm',
  name: 'Dyson Swarm: Protocol Sol',
  subtitle: 'Orbital megastructure automation & solar extraction grid',
  palette: {
    '--bg': '#070b14',
    '--card-bg': '#0f172a',
    '--card-border': '#1e293b',
    '--primary': '#38bdf8',
    '--primary-hover': '#0ea5e9',
    '--secondary': '#818cf8',
    '--danger': '#f43f5e',
    '--danger-hover': '#e11d48',
    '--success': '#10b981',
    '--accent': '#f59e0b'
  },
  character: {
    name: 'AURORA-7',
    title: 'Superorbital Grid Coordinator',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 2" />
      <polygon points="32,14 48,46 16,46" stroke="#818cf8" stroke-width="2" fill="rgba(129,140,248,0.15)" />
      <circle cx="32" cy="35" r="6" fill="#38bdf8" />
      <line x1="32" y1="6" x2="32" y2="12" stroke="#38bdf8" stroke-width="2" />
      <line x1="32" y1="52" x2="32" y2="58" stroke="#38bdf8" stroke-width="2" />
      <line x1="6" y1="32" x2="12" y2="32" stroke="#38bdf8" stroke-width="2" />
      <line x1="52" y1="32" x2="58" y2="32" stroke="#38bdf8" stroke-width="2" />
    </svg>`,
    dialogue: {
      intro: 'Grid initialization complete. Solar collection array is online. We need energy to deploy automated collectors.',
      gen2Revealed: 'Metagenerator online: Orbital Fabricators will now construct Solar Drones autonomously in high orbit.',
      gen3Revealed: 'Heavy industrial presence achieved. Stellar Harvesters deployed into the solar corona.',
      prestigeVisible: 'Solar flux critical. Quantum Compression protocol ready. Compress current energy grid into permanent Quantum Cores?',
      prestigeExecuted: 'Prestige cycle completed. Quantum Cores integrated into grid firmware. Energy output boosted.'
    }
  },
  clock: {
    baseCycleDurationMs: 1000,
    baseTicksPerCycle: 1
  },
  layers: [
    {
      id: 'layer0',
      name: 'Photovoltaic Array',
      boughtSynergyMultiplier: 1.02,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>`,
      currency: {
        id: 'energy',
        name: 'Megawatts',
        symbol: 'MW',
        initialAmount: 10
      },
      generators: [
        {
          id: 'gen1',
          name: 'Solar Drone',
          lore: 'Autonomous photovoltaic mirror drones capturing raw stellar radiation.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <polygon points="12 2 19 21 12 17 5 21 12 2" />
          </svg>`,
          baseCost: 10,
          costGrowth: 1.26,
          baseOutputPerTick: 1,
          produces: 'currency'
        },
        {
          id: 'gen2',
          name: 'Orbital Fabricator',
          lore: 'Automated micro-factories 3D-printing swarms of Solar Drones directly in space.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
          </svg>`,
          baseCost: 350,
          costGrowth: 1.28,
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
          name: 'Stellar Harvester',
          lore: 'Gigantic atmospheric scoops skimming the solar corona to forge Fabricators.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>`,
          baseCost: 6500,
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
          name: 'Telemetry Overclock',
          description: 'Increases telemetry Cycle frequency by 15%',
          lore: 'Upgrades inter-satellite communications to sub-picosecond microwave relays.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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
          name: 'Multi-Phase Transceiver',
          description: 'Doubles Ticks emitted per Cycle',
          lore: 'Processes parallel energy ingestion channels on dual orbital planes.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12h5l3-9 4 18 3-9h5" />
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
          name: 'Reflective Coating',
          description: 'Increases Solar Drone output by 1.75x per level',
          lore: 'Applies metamaterial dielectric mirrors to drone capture surfaces.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18" />
            <path d="M12 8l4 4-4 4" />
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
      name: 'Quantum Compression Hub',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>`,
      currency: {
        id: 'cores',
        name: 'Quantum Cores',
        symbol: 'QC',
        initialAmount: 0
      },
      prestige: {
        targetLayerId: 'layer0',
        thresholdCurrency: 1e6,
        actionLabel: 'Compress Quantum Cores',
        rewardFormula: (runTotal) => {
          const base = runTotal.div(1e6);
          if (base.lt(1)) return 0;
          return base.pow(0.5).floor();
        },
        passiveMultiplierFormula: (unspentCurrency) => {
          return unspentCurrency.mul(0.5).add(1);
        }
      },
      generators: [],
      upgrades: [
        {
          id: 'upg_l1_exp_mult',
          name: 'Sub-Space Quantum Link',
          description: 'Multiplies all Layer 0 output by 2.5x per level',
          lore: 'Tethers orbital swarm telemetry directly through zero-point vacuum nodes.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>`,
          baseCost: 1,
          costGrowth: 2.0,
          maxLevel: 5,
          effect: {
            target: 'layerGenerators',
            targetId: 'layer0',
            operation: 'multiply',
            value: 2.5
          }
        },
        {
          id: 'upg_l1_clock',
          name: 'Temporal Nanosecond Matrix',
          description: 'Adds +1 base Tick per Cycle',
          lore: 'Re-aligns array clock synchronization with relativistic solar orbit frames.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
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
          name: 'Modular Architecture Protocol',
          description: 'Increases purchase synergy boost from 1.02x to 1.07x',
          lore: 'Standardizes component sockets across all drone and fabricator chassis.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1" />
            <rect x="8" y="2" width="14" height="14" rx="2" />
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
          name: 'Dyson Sphere Matrix Singularity',
          description: 'Dynamic boost scaling with total progression time',
          lore: 'The megastructure attains self-sustaining orbital equilibrium around Sol.',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="2" />
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
            <circle cx="12" cy="12" r="8" stroke-dasharray="2 2" />
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
              return (1 + logVal * 0.5);
            }
          }
        }
      ]
    }
  ]
};
