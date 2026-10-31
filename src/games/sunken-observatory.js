// src/games/sunken-observatory.js
// Cosmic Horror / Eldritch Investigation GameConfig with presentation metadata, lore, and SVG assets

export const sunkenObservatoryGame = {
  id: 'sunken-observatory',
  name: 'The Sunken Observatory',
  shortName: 'Sunken Observatory',
  subtitle: 'Unearth eldritch secrets submerged beneath the abyssal depths',
  prestigeImage: './assets/prestige-sunken.jpg',
  prestigeTitle: 'Cosmic Void Transcendence',
  palette: {
    '--bg': '#020608',
    '--card-bg': '#051217',
    '--card-border': '#0e3442',
    '--primary': '#2dd4bf',
    '--primary-hover': '#14b8a6',
    '--secondary': '#a78bfa',
    '--danger': '#f43f5e',
    '--danger-hover': '#e11d48',
    '--success': '#10b981',
    '--accent': '#f472b6',
    '--font-display': "'Courier Prime', 'Special Elite', 'IM Fell English', monospace",
    '--font-body': "'Courier New', 'Courier', monospace",
    '--bg-pattern': 'radial-gradient(circle at 50% 0%, rgba(2, 6, 8, 0.25) 0%, rgba(2, 6, 8, 0.75) 100%), url("./assets/bg-sunken-observatory.jpg")',
    '--panel-l0-bg': 'url("./assets/panel-sunken-observatory.jpg")',
    '--panel-l1-bg': 'url("./assets/panel-sunken-observatory.jpg")',
    '--panel-overlay-l0': 'linear-gradient(135deg, rgba(6, 20, 26, 0.82) 0%, rgba(3, 10, 14, 0.93) 100%)',
    '--panel-overlay-l1': 'linear-gradient(135deg, rgba(6, 20, 26, 0.82) 0%, rgba(3, 10, 14, 0.93) 100%)',
    '--card-glow': '0 0 24px rgba(45, 212, 191, 0.14), inset 0 0 16px rgba(167, 139, 250, 0.08)',
    '--card-bg-gradient': 'linear-gradient(180deg, rgba(8, 26, 34, 0.88) 0%, rgba(4, 14, 18, 0.95) 100%)',
    '--border-radius-panel': '2px',
    '--border-radius-card': '2px',
    '--border-radius-btn': '1px',
    '--banner-bg': 'linear-gradient(90deg, rgba(7, 24, 31, 0.98) 0%, rgba(4, 15, 20, 0.9) 100%)',
    '--banner-border': '#2dd4bf66',
    '--tag-case': 'uppercase',
    '--tag-letter-spacing': '0.12em',
    '--badge-bg': 'rgba(45, 212, 191, 0.12)',
    '--badge-color': '#5eead4',
    '--btn-sec-bg': 'rgba(167, 139, 250, 0.12)',
    '--btn-sec-color': '#ddd6fe',
    '--btn-sec-border': 'rgba(167, 139, 250, 0.35)'
  },
  scenery: `<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="trench-glow" cx="50%" cy="100%" r="70%">
        <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.3" />
        <stop offset="45%" stop-color="#a78bfa" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#020608" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="monolith-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#051217" stop-opacity="0.95" />
      </linearGradient>
    </defs>
    <!-- Abyssal Trench Light -->
    <rect x="0" y="0" width="1200" height="400" fill="url(#trench-glow)" />
    <!-- Submerged Ancient Obelisks & Monoliths -->
    <polygon points="180,400 210,160 250,170 270,400" fill="url(#monolith-grad)" />
    <polygon points="320,400 350,230 380,240 400,400" fill="#091b22" />
    <polygon points="760,400 790,130 830,140 850,400" fill="url(#monolith-grad)" />
    <polygon points="920,400 945,200 975,210 1000,400" fill="#091b22" />
    <!-- Rising Bioluminescent Plankton Bubbles -->
    <g fill="#2dd4bf" opacity="0.45">
      <circle cx="215" cy="110" r="2.5" />
      <circle cx="230" cy="80" r="1.5" />
      <circle cx="240" cy="40" r="3" />
      <circle cx="510" cy="190" r="2" />
      <circle cx="530" cy="140" r="3.5" />
      <circle cx="795" cy="90" r="2" />
      <circle cx="810" cy="60" r="3" />
    </g>
    <!-- Abyssal Eye Silhouette in Trench Depths -->
    <ellipse cx="600" cy="380" rx="160" ry="40" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-opacity="0.35" />
    <circle cx="600" cy="380" r="14" fill="#a78bfa" fill-opacity="0.4" />
  </svg>`,
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
    baseCycleDurationMs: 1000,
    baseTicksPerCycle: 1
  },
  layers: [
    {
      id: 'layer0',
      name: 'The Abyssal Archive',
      boughtSynergyMultiplier: 1.02,
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
          costGrowth: 1.27,
          baseOutputPerTick: 1.0,
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
          backstory: 'Armored bathyspheres cast from abyssal bronze, fitted with pneumatic void dredges and quartz viewing ports. Piloted deep into the Mariana Trench, their ultrasonic drills fracture the continental crust, prying open reality-warping rifts that allow dormant monoliths to breach the seabed.',
          image: './assets/gen-horror-3.jpg',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" xmlns="http://www.w3.org/2000/svg" class="icon-rift">
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
          backstory: 'Distilled from phosphorescent kelp harvested along hydrothermal vents. Consuming the bitter brew liberates the scholar intellect from the constraint of physical sleep, allowing relentless analysis of submerged star-matrices and accelerating research frequency by 15%.',
          image: './assets/upg-astrolabe.jpg',
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
          backstory: 'Through curved obsidian mirrors polished with sea-salt, researchers divide their waking consciousness across multiple temporal planes. Observing archaic stellar alignments and present ocean currents simultaneously doubles the discrete insight pulses generated per cycle.',
          image: './assets/upg-lenses.jpg',
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
          backstory: 'Drawn from abyssal giant cephalopods that feed upon thermal plumes. This viscous black ink remains warm to the touch and glows faintly in absolute darkness. Texts copied with this ink crawl across the page, compelling acolytes to furious transcriptive output.',
          image: './assets/upg-black-ink.jpg',
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
};
