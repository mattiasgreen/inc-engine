// src/games/blueprint.js
// Declarative Progression Blueprint and Schema Compiler
// Guarantees mathematical invariants, micro-utility, and progression sanity across all themes.

import { BigNum } from '../engine/bignum.js';

export const CANONICAL_PROGRESSION = {
  clock: {
    baseCycleDurationMs: 6000
  },
  layer0: {
    generators: [
      {
        id: 'gen1',
        baseCost: 10,
        costGrowth: 1.405,
        cyclePeriodTicks: 1,
        baseOutputPerTick: 6.0,
        produces: 'currency'
      },
      {
        id: 'gen2',
        baseCost: 1850,
        costGrowth: 1.44,
        cyclePeriodTicks: 4,
        baseOutputPerTick: 0.016,
        produces: {
          type: 'generator',
          layerId: 'layer0',
          targetId: 'gen1'
        },
        unlockThreshold: 650
      },
      {
        id: 'gen3',
        baseCost: 20000,
        costGrowth: 1.48,
        cyclePeriodTicks: 8,
        baseOutputPerTick: 0.009,
        produces: {
          type: 'generator',
          layerId: 'layer0',
          targetId: 'gen2'
        },
        unlockThreshold: 8500
      }
    ],
    upgrades: [
      {
        id: 'upg_cycle_accel',
        baseCost: 250,
        costGrowth: 2.6,
        maxLevel: 10,
        effect: {
          target: 'cycleFrequency',
          operation: 'multiply',
          value: 1.04
        }
      },
      {
        id: 'upg_gen1_overdrive',
        baseCost: 550,
        costGrowth: 2.75,
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
        baseCost: 4400,
        costGrowth: 5.4,
        maxLevel: 2,
        milestoneRank: 2,
        unlockThreshold: 2200,
        effect: {
          target: 'generatorPeriod',
          targetId: 'all',
          operation: 'divide',
          value: 2.0
        }
      },
      {
        id: 'upg_tick_amp',
        baseCost: 92000,
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
        baseCost: 17000,
        costGrowth: 3.9,
        maxLevel: 4,
        milestoneRank: 3,
        unlockThreshold: 8500,
        effect: {
          target: 'crossGeneratorSynergy',
          targetId: 'layer0',
          operation: 'add',
          value: 0.0025
        }
      },
      {
        id: 'upg_milestone_resonance',
        baseCost: 40000,
        costGrowth: 4.6,
        maxLevel: 2,
        milestoneRank: 3,
        unlockThreshold: 20000,
        effect: {
          target: 'milestoneMultiplier',
          targetId: 'layer0',
          operation: 'multiply',
          value: 1.15
        }
      },
      {
        id: 'upg_log_momentum',
        baseCost: 130000,
        costGrowth: 1,
        maxLevel: 1,
        milestoneRank: 4,
        unlockThreshold: 70000,
        effect: {
          target: 'logMomentum',
          targetId: 'layer0',
          operation: 'add',
          value: 0.08
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
          target: 'layerMultiplier',
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
          target: 'layerMultiplier',
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
    const genMap = new Set((layer.generators || []).map(g => g.id));

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

      // Metagenerator micro-utility check
      if (gen.produces && typeof gen.produces === 'object' && gen.produces.type === 'generator') {
        const targetId = gen.produces.targetId;
        if (!genMap.has(targetId)) {
          throw new Error(`Metagenerator ${gen.id} targets non-existent generator ${targetId}`);
        }
        const spawnSec = cycleSec / gen.baseOutputPerTick;
        if (spawnSec > 900) {
          throw new Error(`Metagenerator ${gen.id} spawn rate too slow (${spawnSec.toFixed(1)}s per unit > 900s). Violates micro-utility standard.`);
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

      const mergedUpgrades = l0Blueprint.upgrades.map(baseUpg => {
        const themeUpg = themeLayer.upgrades?.find(u => u.id === baseUpg.id) || {};
        return { ...baseUpg, ...themeUpg };
      });

      return {
        ...themeLayer,
        generators: mergedGenerators,
        upgrades: mergedUpgrades
      };
    }

    if (idx === 1) {
      const mergedUpgrades = l1Blueprint.upgrades.map(baseUpg => {
        const themeUpg = themeLayer.upgrades?.find(u => u.id === baseUpg.id) || {};
        return { ...baseUpg, ...themeUpg };
      });

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
