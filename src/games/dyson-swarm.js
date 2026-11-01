// src/games/dyson-swarm.js
// Engineering / Megastructure World GameConfig with presentation metadata, lore, and SVG assets

export const dysonSwarmGame = {
  id: 'dyson-swarm',
  name: 'Dyson Swarm: Protocol Sol',
  shortName: 'Dyson Swarm',
  subtitle: 'Orbital megastructure automation & solar extraction grid',
  prestigeImage: './assets/prestige-dyson.jpg',
  prestigeTitle: 'Quantum Singularity Compression Core',
  palette: {
    '--bg': '#060a12',
    '--card-bg': '#0b1220',
    '--card-border': 'rgba(56, 189, 248, 0.22)',
    '--text': '#dbe7f4',
    '--text-muted': '#849bb8',
    '--primary': '#38bdf8',
    '--primary-hover': '#7dd3fc',
    '--secondary': '#818cf8',
    '--danger': '#f43f5e',
    '--danger-hover': '#e11d48',
    '--success': '#10b981',
    '--accent': '#f59e0b',
    '--font-display': "'Orbitron', 'Space Grotesk', system-ui, sans-serif",
    '--font-body': "'Share Tech Mono', 'Courier New', monospace",
    '--bg-pattern': 'radial-gradient(circle at 50% 0%, rgba(6, 10, 18, 0.25) 0%, rgba(6, 10, 18, 0.78) 100%), url("./assets/bg-dyson-swarm.jpg")',
    '--panel-l0-bg': 'url("./assets/panel-dyson-swarm.jpg")',
    '--panel-l1-bg': 'url("./assets/panel-dyson-swarm.jpg")',
    '--panel-overlay-l0': 'linear-gradient(135deg, rgba(10, 17, 30, 0.85) 0%, rgba(5, 9, 16, 0.94) 100%)',
    '--panel-overlay-l1': 'linear-gradient(135deg, rgba(10, 17, 30, 0.85) 0%, rgba(5, 9, 16, 0.94) 100%)',
    '--card-glow': '0 0 18px rgba(56, 189, 248, 0.10), inset 0 1px 0 rgba(56, 189, 248, 0.14)',
    '--card-bg-gradient': 'linear-gradient(180deg, rgba(12, 20, 36, 0.90) 0%, rgba(8, 13, 25, 0.96) 100%)',
    '--border-radius-panel': '6px',
    '--border-radius-card': '4px',
    '--border-radius-btn': '3px',
    '--banner-bg': 'linear-gradient(90deg, rgba(12, 19, 34, 0.96) 0%, rgba(16, 26, 48, 0.84) 100%)',
    '--banner-border': 'rgba(56, 189, 248, 0.28)',
    '--tag-case': 'uppercase',
    '--tag-letter-spacing': '0.06em',
    '--badge-bg': 'rgba(56, 189, 248, 0.12)',
    '--badge-color': '#7dd3fc',
    '--btn-bg': 'rgba(0, 0, 0, 0.60)',
    '--btn-bg-hover': 'rgba(0, 0, 0, 0.78)',
    '--btn-bg-disabled': 'rgba(0, 0, 0, 0.45)',
    '--btn-text': '#ffffff',
    '--btn-text-disabled': 'rgba(255, 255, 255, 0.40)',
    '--btn-primary-border': 'rgba(56, 189, 248, 0.72)',
    '--btn-primary-glow': 'inset 0 0 12px rgba(56, 189, 248, 0.18), 0 2px 8px rgba(0, 0, 0, 0.5)',
    '--btn-sec-bg': 'rgba(0, 0, 0, 0.60)',
    '--btn-sec-color': '#ffffff',
    '--btn-sec-border': 'rgba(148, 163, 184, 0.32)',
    '--upg-card-scrim': 'linear-gradient(135deg, rgba(4, 8, 16, 0.90) 0%, rgba(6, 12, 22, 0.80) 52%, rgba(8, 16, 30, 0.62) 100%)',
    '--upg-card-scrim-hover': 'linear-gradient(135deg, rgba(4, 8, 16, 0.82) 0%, rgba(6, 12, 22, 0.70) 52%, rgba(8, 16, 30, 0.48) 100%)',
    '--viewport-vignette': 'radial-gradient(circle at 50% 45%, transparent 55%, rgba(2, 5, 10, 0.55) 100%)',
    '--title-text-shadow': '0 0 12px rgba(56, 189, 248, 0.22)'
  },
  scenery: `<img src="./assets/bg-dyson-swarm.jpg" alt="Dyson Swarm Orbital Panorama" class="scenery-img" />`,
  character: {
    name: 'AURORA-7',
    title: 'Superorbital Grid Coordinator',
    image: './assets/portrait-dyson.jpg',
    backstory: 'Autonomous Unit for Remote Orbital Resource Acquisition, Model 7. Manufactured by the Sol Engineering Collective in 2184 to orchestrate megastructure fabrication around the Sun. AURORA-7 supervises billions of autonomous mirror drones, coordinating energy telemetry through sub-picosecond microwave relays while monitoring solar coronal mass ejections.',
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
    baseCycleDurationMs: 6000,
    baseTicksPerCycle: 1
  },
  layers: [
    {
      id: 'layer0',
      name: 'Photovoltaic Array',
      boughtSynergyMultiplier: 1.00,
      image: './assets/icon-dyson-l0.jpg',
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
          backstory: 'Forged from ultra-lightweight carbon aerogels, these autonomous mirror units unfold hexagonal photovoltaic sails upon orbital insertion. Guided by micro-ion thrusters, each drone maneuvers along coronal magnetic field lines, harvesting raw stellar flux and relaying digitized megawatts down to collection hubs via coherent microwave beams.',
          image: './assets/gen-dyson-1.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-drone">
            <polygon points="12 2 19 21 12 17 5 21 12 2" />
          </svg>`,
          baseCost: 10,
          costGrowth: 1.35,
          cyclePeriodTicks: 1,
          baseOutputPerTick: 6,
          produces: 'currency'
        },
        {
          id: 'gen2',
          name: 'Orbital Fabricator',
          lore: 'Automated micro-factories 3D-printing swarms of Solar Drones directly in space.',
          backstory: 'Positioned in stable Lagrange orbits, these zero-gravity foundry modules capture metallic asteroids using tractor arrays. Inside pressurized induction bays, automated robotic arms smelt planetary regolith to 3D-print complete Solar Drones, launching fresh wings into orbit every standard solar cycle.',
          image: './assets/gen-dyson-2.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-fabricator">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
          </svg>`,
          baseCost: 1800,
          costGrowth: 1.40,
          cyclePeriodTicks: 4,
          baseOutputPerTick: 0.00018,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen1'
          },
          unlockThreshold: 900
        },
        {
          id: 'gen3',
          name: 'Stellar Harvester',
          lore: 'Gigantic atmospheric scoops skimming the solar corona to forge Fabricators.',
          backstory: 'Massive magnetic ring vessels skimming the upper chromosphere. Reinforced with quantum magnetic forcefields, these leviathans scoop charged solar plasma directly from solar flares, transmuting raw hydrogen into dense building materials required to construct new Orbital Fabricators.',
          image: './assets/gen-dyson-3.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-harvester">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>`,
          baseCost: 26000,
          costGrowth: 1.45,
          cyclePeriodTicks: 10,
          baseOutputPerTick: 0.00008,
          produces: {
            type: 'generator',
            layerId: 'layer0',
            targetId: 'gen2'
          },
          unlockThreshold: 12000
        }
      ],
      upgrades: [
        {
          id: 'upg_cycle_accel',
          name: 'Telemetry Overclock',
          description: 'Increases telemetry Cycle frequency by 4%',
          lore: 'Upgrades inter-satellite communications to sub-picosecond microwave relays.',
          backstory: 'By synchronizing orbital microwave transmitters through optical atomic clocks, telemetry latency across 1.4 million kilometers of space is eliminated. Autonomous swarm clusters react to solar coronal mass ejections instantaneously, accelerating processing cycles by 4%.',
          image: './assets/upg-telemetry.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>`,
          baseCost: 250,
          costGrowth: 2.35,
          maxLevel: 10,
          effect: {
            target: 'cycleFrequency',
            operation: 'multiply',
            value: 1.04
          }
        },
        {
          id: 'upg_gen1_overdrive',
          name: 'Reflective Coating',
          description: 'Increases Solar Drone output by 1.07x per level',
          lore: 'Applies metamaterial dielectric mirrors to drone capture surfaces.',
          backstory: 'A vacuum-deposited multilayer titanium oxide film with nanoscale refractive gradients. The dielectric coating traps and recycles scattered photons within drone collection cavities, boosting individual drone power output by 7% per upgrade rank.',
          image: './assets/upg-coating.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18" />
            <path d="M12 8l4 4-4 4" />
          </svg>`,
          baseCost: 420,
          costGrowth: 2.45,
          maxLevel: 10,
          effect: {
            target: 'generator',
            targetId: 'gen1',
            operation: 'multiply',
            value: 1.07
          }
        },
        {
          id: 'upg_period_compress',
          name: 'Harmonic Thruster Cadence',
          description: 'Halves Generator Tick Periods across the orbital array',
          lore: 'Synchronizes assembly bays with orbital perihelion harmonics.',
          backstory: 'By firing ion thrusters at orbital resonance nodes, Orbital Fabricators and Stellar Harvesters complete their production cycles in half the required Ticks, pushing heavy assembly lines toward continuous Overdrive.',
          image: './assets/upg-superconductivity.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>`,
          baseCost: 3800,
          costGrowth: 4.5,
          maxLevel: 2,
          milestoneRank: 2,
          unlockThreshold: 1800,
          effect: {
            target: 'generatorPeriod',
            targetId: 'all',
            operation: 'divide',
            value: 2.0
          }
        },
        {
          id: 'upg_tick_amp',
          name: 'Multi-Phase Transceiver',
          description: 'Doubles Ticks emitted per Cycle',
          lore: 'Processes parallel energy ingestion channels on dual orbital planes.',
          backstory: 'Engineered using high-temperature superconductive metamaterials, this transceiver operates on dual orthogonal orbital planes simultaneously. By processing polar and equatorial solar flux concurrently, it doubles the operational ticks emitted during each computational cycle.',
          image: './assets/upg-transceiver.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12h5l3-9 4 18 3-9h5" />
          </svg>`,
          baseCost: 82000,
          costGrowth: 8.0,
          maxLevel: 5,
          effect: {
            target: 'tickYield',
            operation: 'multiply',
            value: 2.0
          }
        },
        {
          id: 'upg_cross_synergy',
          name: 'Swarm Mesh Interlink',
          description: 'Boosts all Layer 0 output by +0.25% per total Generator bought',
          lore: 'Every commissioned unit acts as a relay amplifier for the entire array.',
          backstory: 'Links every Solar Drone, Fabricator, and Harvester into a unified phased-array antenna. Each newly purchased construct sharpens beam collimation across the entire orbital fleet.',
          image: './assets/upg-nanites.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="12" cy="18" r="3" />
            <line x1="8.5" y1="7.5" x2="15.5" y2="7.5" />
            <line x1="7.5" y1="8.5" x2="10.5" y2="15.5" />
            <line x1="16.5" y1="8.5" x2="13.5" y2="15.5" />
          </svg>`,
          baseCost: 14000,
          costGrowth: 3.5,
          maxLevel: 4,
          milestoneRank: 3,
          unlockThreshold: 7000,
          effect: {
            target: 'crossGeneratorSynergy',
            targetId: 'layer0',
            operation: 'add',
            value: 0.0025
          }
        },
        {
          id: 'upg_milestone_resonance',
          name: 'Ascendant Chassis Matrix',
          description: 'Multiplies all Uncommon (m1+) Milestone Tier bonuses by 1.15x',
          lore: 'Unlocks overcharged coronal shielding once a swarm wing reaches 25 units.',
          backstory: 'Reconfigures standard 25-unit drone squadrons into high-density diamond formations, amplifying the multiplicative power surge granted at every Milestone Tier.',
          image: './assets/upg-coating.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9 12 2" />
          </svg>`,
          baseCost: 34000,
          costGrowth: 4.0,
          maxLevel: 2,
          milestoneRank: 3,
          unlockThreshold: 17000,
          effect: {
            target: 'milestoneMultiplier',
            targetId: 'layer0',
            operation: 'multiply',
            value: 1.15
          }
        },
        {
          id: 'upg_log_momentum',
          name: 'Coronal Flux Feedback',
          description: 'Scales all Layer 0 output by log10(Run Megawatts)^0.08',
          lore: 'Redirects excess grid energy to magnetically pinch solar plasma.',
          backstory: 'Channels accumulated megawatts back into solar magnetic containment fields, creating a self-reinforcing feedback loop that accelerates production as total run energy climbs toward the Quantum Compression threshold.',
          image: './assets/upg-quantum-link.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v20M2 12h20" />
            <circle cx="12" cy="12" r="7" />
          </svg>`,
          baseCost: 118000,
          costGrowth: 1,
          maxLevel: 1,
          milestoneRank: 4,
          unlockThreshold: 60000,
          effect: {
            target: 'logMomentum',
            targetId: 'layer0',
            operation: 'add',
            value: 0.08
          }
        }
      ]
    },
    {
      id: 'layer1',
      name: 'Quantum Compression Hub',
      image: './assets/icon-dyson-l1.jpg',
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
          backstory: 'By creating micro-wormholes inside cryogenic magnetic traps, telemetry channels bypass the speed of light entirely. Swarm nodes transfer harvested joules directly to core distribution matrices with near-zero line resistance, multiplying all base solar energy output by 2.5x per level.',
          image: './assets/upg-quantum-link.jpg',
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
          backstory: 'Relativistic frame-dragging near Sol causes time differentials between inner orbits and planetary outposts. This matrix synthesizes a unified temporal mesh across the solar system, inserting additional discrete operational ticks into every collection cycle.',
          image: './assets/upg-superconductivity.jpg',
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
          backstory: 'An open-source architectural standard ratified by the orbital collective. Standardization allows hot-swappable inductive power linkages across drone chassis, ensuring each new generator installed magnifies the baseline efficiency of all active orbital infrastructure.',
          image: './assets/upg-nanites.jpg',
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
          backstory: 'The culmination of centuries of autonomous construction. Trillions of solar rings interlock into a closed, self-optimizing sphere surrounding the sun. The singularity continually adapts to stellar fluctuations, scaling its output perpetually as total operational duration increases.',
          image: './assets/upg-quantum-link.jpg',
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
