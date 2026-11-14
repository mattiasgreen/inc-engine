// src/games/blueprint.js
// Declarative Progression Blueprint and Schema Compiler
// Guarantees mathematical invariants, micro-utility, and progression sanity across all themes.

import { BigNum } from '../engine/bignum.js';

export const GEN2_MILESTONE_TIERS = [
  { id: 'm0', rank: 0, name: 'Common', minBought: 0, multiplier: 1 },
  { id: 'm1', rank: 1, name: 'Uncommon', minBought: 6, multiplier: 2 },
  { id: 'm2', rank: 2, name: 'Rare', minBought: 14, multiplier: 4 },
  { id: 'm3', rank: 3, name: 'Epic', minBought: 30, multiplier: 10 },
  { id: 'm4', rank: 4, name: 'Legendary', minBought: 70, multiplier: 35 }
];

export const GEN3_MILESTONE_TIERS = [
  { id: 'm0', rank: 0, name: 'Common', minBought: 0, multiplier: 1 },
  { id: 'm1', rank: 1, name: 'Uncommon', minBought: 2, multiplier: 2 },
  { id: 'm2', rank: 2, name: 'Rare', minBought: 6, multiplier: 4 },
  { id: 'm3', rank: 3, name: 'Epic', minBought: 15, multiplier: 10 },
  { id: 'm4', rank: 4, name: 'Legendary', minBought: 35, multiplier: 35 }
];

export const CANONICAL_PROGRESSION = {
  clock: {
    baseCycleDurationMs: 6000
  },
  layer0: {
    boughtSynergyMultiplier: 1.012,
    overdriveMultiplier: 1.22,
    bayCapacity: {
      gen1: { base: 1.45, perBought: 0.145 },
      gen2: { base: 2.0, perBought: 0.35 },
      gen3: { base: 2.0, perBought: 0.45 }
    },
    capacitor: {
      name: 'Layer Capacitor',
      pulseLabel: 'Pulse',
      dischargeLabel: 'Ignite Surge',
      surgeName: 'Surge Window',
      pulseCooldownMs: 18000,
      pulseBaseCurrency: 4,
      pulseRateSec: 1.2,
      pulseCharge: 0.045,
      passiveChargePerTick: 0.004,
      minDischargeCharge: 0.40,
      surgeMultiplier: 1.60,
      surgeCycleFreqMult: 1.15,
      surgeTickMult: 1,
      maxSurgeTicks: 16
    },
    defaultStanceId: 'balanced',
    stances: [
      {
        id: 'balanced',
        name: 'Balanced',
        description: 'Nominal 1.0x output, cascade speed, and capacitor charge.',
        currencyMult: 1.0,
        metaMult: 1.0,
        chargeMult: 1.0,
        cycleFreqMult: 1.0
      },
      {
        id: 'extraction',
        name: 'Extraction',
        description: '+25% currency rate, -40% cascade spawn speed.',
        currencyMult: 1.25,
        metaMult: 0.60,
        chargeMult: 0.85,
        cycleFreqMult: 1.0
      },
      {
        id: 'cascade',
        name: 'Cascade',
        description: '+60% cascade spawn speed, +40% capacitor charge, -28% direct currency.',
        currencyMult: 0.72,
        metaMult: 1.60,
        chargeMult: 1.40,
        cycleFreqMult: 1.0
      }
    ],
    generators: [
      {
        id: 'gen1',
        baseCost: 10,
        costGrowth: 1.482,
        cyclePeriodTicks: 1,
        baseOutputPerTick: 6.0,
        produces: 'currency'
      },
      {
        id: 'gen2',
        baseCost: 960,
        costGrowth: 1.47,
        cyclePeriodTicks: 4,
        baseOutputPerTick: 0.031,
        produces: {
          type: 'generator',
          layerId: 'layer0',
          targetId: 'gen1'
        },
        unlockThreshold: 430,
        milestones: GEN2_MILESTONE_TIERS
      },
      {
        id: 'gen3',
        baseCost: 16500,
        costGrowth: 1.50,
        cyclePeriodTicks: 8,
        baseOutputPerTick: 0.0125,
        produces: {
          type: 'generator',
          layerId: 'layer0',
          targetId: 'gen2'
        },
        unlockThreshold: 7000,
        milestones: GEN3_MILESTONE_TIERS
      }
    ],
    upgrades: [
      {
        id: 'upg_cycle_accel',
        baseCost: 245,
        costGrowth: 2.85,
        maxLevel: 6,
        effect: {
          target: 'cycleFrequency',
          operation: 'multiply',
          value: 1.055
        }
      },
      {
        id: 'upg_gen1_overdrive',
        baseCost: 680,
        costGrowth: 3.00,
        maxLevel: 6,
        effect: {
          target: 'generator',
          targetId: 'gen1',
          operation: 'multiply',
          value: 1.08
        }
      },
      {
        id: 'upg_period_compress',
        baseCost: 5600,
        costGrowth: 4.8,
        maxLevel: 2,
        milestoneRank: 2,
        unlockThreshold: 2600,
        prerequisites: [{ id: 'upg_cycle_accel', minLevel: 1 }],
        effect: {
          target: 'generatorPeriod',
          targetId: 'all',
          operation: 'divide',
          value: 2.0
        },
        effects: [
          {
            target: 'bayCapacity',
            targetId: 'layer0',
            operation: 'multiply',
            value: 1.50
          }
        ]
      },
      {
        id: 'upg_doctrine_surge',
        baseCost: 9000,
        costGrowth: 1,
        maxLevel: 1,
        milestoneRank: 2,
        unlockThreshold: 4200,
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
        baseCost: 9000,
        costGrowth: 1,
        maxLevel: 1,
        milestoneRank: 2,
        unlockThreshold: 4200,
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
        baseCost: 14500,
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
          value: 0.0028
        },
        effects: [
          {
            target: 'bayCapacity',
            targetId: 'layer0',
            operation: 'multiply',
            value: 1.42
          }
        ]
      },
      {
        id: 'upg_milestone_resonance',
        baseCost: 28000,
        costGrowth: 4.3,
        maxLevel: 2,
        milestoneRank: 3,
        unlockThreshold: 14000,
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
            value: 1.32
          }
        ]
      },
      {
        id: 'upg_tick_amp',
        baseCost: 40000,
        costGrowth: 5.5,
        maxLevel: 3,
        unlockThreshold: 20000,
        prerequisites: [{ id: 'upg_cross_synergy', minLevel: 1 }],
        effect: {
          target: 'tickYield',
          operation: 'multiply',
          value: 1.5
        }
      },
      {
        id: 'upg_log_momentum',
        baseCost: 58000,
        costGrowth: 1,
        maxLevel: 1,
        milestoneRank: 4,
        unlockThreshold: 29000,
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
  layer1: {
    prestige: {
      thresholdCurrency: 1e6
    },
    upgrades: [
      {
        id: 'upg_l1_exp_mult',
        baseCost: 1,
        costGrowth: 2.0,
        maxLevel: 5,
        effect: {
          target: 'layerGenerators',
          targetId: 'layer0',
          operation: 'multiply',
          value: 2.0
        }
      },
      {
        id: 'upg_l1_clock',
        baseCost: 2,
        costGrowth: 3.0,
        maxLevel: 3,
        effect: {
          target: 'cycleFrequency',
          operation: 'multiply',
          value: 1.25
        }
      },
      {
        id: 'upg_l1_synergy',
        baseCost: 2,
        costGrowth: 3.0,
        maxLevel: 3,
        effect: {
          target: 'costScaling',
          targetId: 'layer0',
          operation: 'subtract',
          value: 0.02
        }
      },
      {
        id: 'upg_l1_apex',
        baseCost: 5,
        costGrowth: 1,
        maxLevel: 1,
        milestoneRank: 4,
        effect: {
          target: 'layerGenerators',
          targetId: 'layer0',
          operation: 'multiply',
          value: 5.0
        }
      }
    ]
  }
};

export function validateGameConfig(config) {
  const clock = config.clock || CANONICAL_PROGRESSION.clock;
  const cycleSec = (clock.baseCycleDurationMs || 6000) / 1000;

  for (const layer of config.layers || []) {
    const genById = new Map((layer.generators || []).map(g => [g.id, g]));

    for (const gen of layer.generators || []) {
      if (!gen.baseCost || gen.baseCost <= 0) {
        throw new Error(`Generator ${gen.id} in layer ${layer.id} has invalid baseCost: ${gen.baseCost}`);
      }
      if (!gen.costGrowth || gen.costGrowth <= 1.0 || gen.costGrowth > 2.5) {
        throw new Error(`Generator ${gen.id} in layer ${layer.id} has invalid costGrowth: ${gen.costGrowth}`);
      }
      if (gen.unlockThreshold && gen.unlockThreshold > gen.baseCost) {
        throw new Error(`Generator ${gen.id} unlockThreshold (${gen.unlockThreshold}) cannot exceed baseCost (${gen.baseCost})`);
      }

      // Metagenerator micro-utility check: base Tier-2 <= 240s per unit, deeper tiers <= 600s per unit
      if (gen.produces && typeof gen.produces === 'object' && gen.produces.type === 'generator') {
        const targetId = gen.produces.targetId;
        const targetGen = genById.get(targetId);
        if (!targetGen) {
          throw new Error(`Metagenerator ${gen.id} targets non-existent generator ${targetId}`);
        }
        const targetProducesCurrency = !targetGen.produces || targetGen.produces === 'currency' || targetGen.produces.type === 'currency';
        const maxSpawnSec = targetProducesCurrency ? 240 : 600;
        const spawnSec = cycleSec / gen.baseOutputPerTick;
        if (spawnSec > maxSpawnSec) {
          throw new Error(`Metagenerator ${gen.id} spawn rate too slow (${spawnSec.toFixed(1)}s per unit > ${maxSpawnSec}s).`);
        }
      }
    }

    for (const upg of layer.upgrades || []) {
      if (!upg.baseCost || upg.baseCost <= 0) {
        throw new Error(`Upgrade ${upg.id} in layer ${layer.id} has invalid baseCost: ${upg.baseCost}`);
      }
      if (upg.unlockThreshold && upg.unlockThreshold > upg.baseCost) {
        throw new Error(`Upgrade ${upg.id} unlockThreshold (${upg.unlockThreshold}) cannot exceed baseCost (${upg.baseCost})`);
      }
    }

    if (layer.capacitor) {
      const minD = layer.capacitor.minDischargeCharge;
      if (minD !== undefined && (minD <= 0 || minD > 1)) {
        throw new Error(`Capacitor in layer ${layer.id} has invalid minDischargeCharge: ${minD}`);
      }
      if (layer.capacitor.maxSurgeTicks !== undefined && layer.capacitor.maxSurgeTicks < 1) {
        throw new Error(`Capacitor in layer ${layer.id} has invalid maxSurgeTicks: ${layer.capacitor.maxSurgeTicks}`);
      }
    }

    if (layer.stances) {
      if (!Array.isArray(layer.stances) || layer.stances.length === 0) {
        throw new Error(`Stances in layer ${layer.id} must be a non-empty array`);
      }
      for (const s of layer.stances) {
        if (!s.id || !s.name) {
          throw new Error(`Stance in layer ${layer.id} is missing id or name`);
        }
      }
    }
  }
}

export function compileGameConfig(themeSpec) {
  const l0Blueprint = CANONICAL_PROGRESSION.layer0;
  const l1Blueprint = CANONICAL_PROGRESSION.layer1;

  const mergedLayers = themeSpec.layers.map((themeLayer, idx) => {
    if (idx === 0) {
      const mergedGenerators = l0Blueprint.generators.map(baseGen => {
        const themeGen = themeLayer.generators?.find(g => g.id === baseGen.id) || {};
        return { ...baseGen, ...themeGen };
      });
      for (const themeGen of themeLayer.generators || []) {
        if (!l0Blueprint.generators.some(b => b.id === themeGen.id)) {
          mergedGenerators.push(themeGen);
        }
      }

      const mergedUpgrades = l0Blueprint.upgrades.map(baseUpg => {
        const themeUpg = themeLayer.upgrades?.find(u => u.id === baseUpg.id) || {};
        return { ...baseUpg, ...themeUpg };
      });
      for (const themeUpg of themeLayer.upgrades || []) {
        if (!l0Blueprint.upgrades.some(b => b.id === themeUpg.id)) {
          mergedUpgrades.push(themeUpg);
        }
      }

      const mergedBayCapacity = themeLayer.bayCapacity === null
        ? null
        : {
            ...(l0Blueprint.bayCapacity || {}),
            ...(themeLayer.bayCapacity || {})
          };

      const mergedCapacitor = themeLayer.capacitor === null
        ? null
        : {
            ...l0Blueprint.capacitor,
            ...(themeLayer.capacitor || {})
          };

      return {
        ...themeLayer,
        boughtSynergyMultiplier: themeLayer.boughtSynergyMultiplier ?? l0Blueprint.boughtSynergyMultiplier,
        overdriveMultiplier: themeLayer.overdriveMultiplier ?? l0Blueprint.overdriveMultiplier,
        bayCapacity: mergedBayCapacity,
        capacitor: mergedCapacitor,
        defaultStanceId: themeLayer.defaultStanceId || l0Blueprint.defaultStanceId,
        stances: themeLayer.stances || l0Blueprint.stances,
        generators: mergedGenerators,
        upgrades: mergedUpgrades
      };
    }

    if (idx === 1) {
      const mergedUpgrades = l1Blueprint.upgrades.map(baseUpg => {
        const themeUpg = themeLayer.upgrades?.find(u => u.id === baseUpg.id) || {};
        return { ...baseUpg, ...themeUpg };
      });
      for (const themeUpg of themeLayer.upgrades || []) {
        if (!l1Blueprint.upgrades.some(b => b.id === themeUpg.id)) {
          mergedUpgrades.push(themeUpg);
        }
      }

      return {
        ...themeLayer,
        prestige: {
          ...l1Blueprint.prestige,
          ...(themeLayer.prestige || {})
        },
        upgrades: mergedUpgrades
      };
    }

    return themeLayer;
  });

  const config = {
    ...themeSpec,
    clock: {
      ...CANONICAL_PROGRESSION.clock,
      ...(themeSpec.clock || {})
    },
    layers: mergedLayers
  };

  validateGameConfig(config);
  return config;
}
