// src/games/dyson-swarm.js
// Engineering / Megastructure World GameConfig with presentation metadata, lore, and SVG assets

export const dysonSwarmGame = {
  id: 'dyson-swarm',
  name: 'Dyson Swarm: Protocol Sol',
  subtitle: 'Orbital megastructure automation & solar extraction grid',
  palette: {
    '--bg': '#060a12',
    '--card-bg': '#0c1322',
    '--card-border': '#1e2d48',
    '--primary': '#38bdf8',
    '--primary-hover': '#0ea5e9',
    '--secondary': '#818cf8',
    '--danger': '#f43f5e',
    '--danger-hover': '#e11d48',
    '--success': '#10b981',
    '--accent': '#f59e0b',
    '--font-display': "'Orbitron', 'Space Grotesk', system-ui, sans-serif",
    '--font-body': "'Share Tech Mono', 'Courier New', monospace",
    '--bg-pattern': 'radial-gradient(circle at 50% 0%, rgba(6, 10, 18, 0.6) 0%, rgba(6, 10, 18, 0.95) 100%), url("./assets/bg-dyson-swarm.jpg")',
    '--card-glow': '0 0 16px rgba(56, 189, 248, 0.08), inset 0 1px 0 rgba(56, 189, 248, 0.15)',
    '--card-bg-gradient': 'linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(10, 16, 30, 0.98) 100%)',
    '--border-radius-panel': '6px',
    '--border-radius-card': '4px',
    '--border-radius-btn': '3px',
    '--banner-bg': 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 32, 58, 0.8) 100%)',
    '--banner-border': '#38bdf866',
    '--tag-case': 'uppercase',
    '--tag-letter-spacing': '0.06em',
    '--badge-bg': 'rgba(56, 189, 248, 0.12)',
    '--badge-color': '#38bdf8',
    '--btn-sec-bg': '#1e293b',
    '--btn-sec-color': '#e2e8f0',
    '--btn-sec-border': '#334155'
  },
  scenery: `<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sol-core" cx="85%" cy="30%" r="50%">
        <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9" />
        <stop offset="35%" stop-color="#f59e0b" stop-opacity="0.4" />
        <stop offset="70%" stop-color="#38bdf8" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#060a12" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="scaffold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#818cf8" stop-opacity="0.05" />
      </linearGradient>
    </defs>
    <!-- Sol Star Corona -->
    <circle cx="85%" cy="30%" r="220" fill="url(#sol-core)" />
    <!-- Distant Starfield & Nebula -->
    <g fill="#38bdf8" opacity="0.4">
      <circle cx="60" cy="80" r="1.5" />
      <circle cx="180" cy="40" r="1.2" />
      <circle cx="340" cy="120" r="1" />
      <circle cx="490" cy="60" r="1.8" />
      <circle cx="620" cy="180" r="1" />
      <circle cx="750" cy="70" r="1.5" />
      <circle cx="210" cy="240" r="1" />
      <circle cx="400" cy="310" r="1.4" />
    </g>
    <!-- Mega Orbital Rings -->
    <ellipse cx="85%" cy="30%" rx="380" ry="140" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="14 8" transform="rotate(-18 1020 120)" />
    <ellipse cx="85%" cy="30%" rx="440" ry="160" fill="none" stroke="#818cf8" stroke-width="1.2" stroke-opacity="0.2" stroke-dasharray="6 12" transform="rotate(-18 1020 120)" />
    <!-- Dyson Truss Scaffold Silhouette -->
    <path d="M-50 420 L250 260 L420 310 L680 190 L920 280 L1250 140" fill="none" stroke="url(#scaffold-grad)" stroke-width="2" />
    <polygon points="250,260 270,420 230,420" fill="#38bdf8" fill-opacity="0.04" />
    <polygon points="680,190 700,420 660,420" fill="#38bdf8" fill-opacity="0.04" />
    <!-- Atmospheric/Orbital Horizon Glow -->
    <path d="M0 380 Q 600 340 1200 380 L1200 400 L0 400 Z" fill="#0c1322" fill-opacity="0.6" />
  </svg>`,
  character: {
    name: 'AURORA-7',
    title: 'Superorbital Grid Coordinator',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="char-svg-dyson">
      <defs>
        <filter id="aurora-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <circle class="ring-outer" cx="32" cy="32" r="28" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5 3" />
      <circle class="ring-inner" cx="32" cy="32" r="22" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="3 4" stroke-opacity="0.7" />
      <polygon class="core-poly" points="32,13 49,46 15,46" stroke="#38bdf8" stroke-width="2" fill="rgba(56,189,248,0.15)" filter="url(#aurora-glow)" />
      <circle class="core-pulse" cx="32" cy="35" r="5" fill="#38bdf8" filter="url(#aurora-glow)" />
      <!-- Telemetry crosshairs -->
      <line x1="32" y1="4" x2="32" y2="10" stroke="#38bdf8" stroke-width="2" />
      <line x1="32" y1="54" x2="32" y2="60" stroke="#38bdf8" stroke-width="2" />
      <line x1="4" y1="32" x2="10" y2="32" stroke="#38bdf8" stroke-width="2" />
      <line x1="54" y1="32" x2="60" y2="32" stroke="#38bdf8" stroke-width="2" />
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
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-drone">
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
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-fabricator">
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
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-harvester">
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
