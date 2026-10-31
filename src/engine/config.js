// src/engine/config.js
// Declarative GameConfig schema and default Layer 0 / Layer 1 configuration

export const defaultGameConfig = {
  id: 'inc-engine-default',
  name: 'Inc-Engine Reference Game',
  clock: {
    baseCycleDurationMs: 1000,
    baseTicksPerCycle: 1
  },
  layers: [
    {
      id: 'layer0',
      name: 'Core System',
      boughtSynergyMultiplier: 1.02,
      currency: {
        id: 'energy',
        name: 'Energy',
        symbol: 'E',
        initialAmount: 10
      },
      generators: [
        {
          id: 'gen1',
          name: 'Generator I',
          baseCost: 10,
          costGrowth: 1.26,
          baseOutputPerTick: 1,
          produces: 'currency'
        },
        {
          id: 'gen2',
          name: 'Generator II (Metagenerator)',
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
          name: 'Generator III (Metagenerator)',
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
          name: 'Cycle Accelerator',
          description: 'Increases Cycle frequency by 15%',
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
          name: 'Tick Amplifier',
          description: 'Doubles Ticks emitted per Cycle',
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
          name: 'Gen I Overdrive',
          description: 'Increases Generator I output by 1.75x per level',
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
      name: 'Prestige Core',
      currency: {
        id: 'cores',
        name: 'Prestige Cores',
        symbol: 'C',
        initialAmount: 0
      },
      prestige: {
        targetLayerId: 'layer0',
        thresholdCurrency: 1e6,
        rewardFormula: (runTotal) => {
          // floor((runTotal / 1e6) ^ 0.5)
          const base = runTotal.div(1e6);
          if (base.lt(1)) return 0;
          return base.pow(0.5).floor();
        },
        passiveMultiplierFormula: (unspentCurrency) => {
          // 1 + unspent * 0.5
          return unspentCurrency.mul(0.5).add(1);
        }
      },
      generators: [],
      upgrades: [
        {
          id: 'upg_l1_exp_mult',
          name: 'Core Resonance',
          description: 'Multiplies all Layer 0 output by 2.5x per level',
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
          name: 'Temporal Overclock',
          description: 'Adds +1 base Tick per Cycle',
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
          name: 'Manual Mastery',
          description: 'Increases Layer 0 purchase synergy boost from 1.02x to 1.07x',
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
          name: 'Logarithmic Cascade Synergy',
          description: 'Dynamic boost scaling with total progression time',
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
