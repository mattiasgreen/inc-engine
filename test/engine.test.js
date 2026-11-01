// test/engine.test.js
import { describe, it, expect } from './runner.js';
import { defaultGameConfig } from '../src/engine/config.js';
import {
  createInitialState,
  getDerivedStats,
  advanceTime,
  advanceTicks,
  buyGenerator,
  buyUpgrade,
  resetLayer
} from '../src/engine/core.js';
import { BigNum } from '../src/engine/bignum.js';

describe('Engine Core Seam', () => {
  it('initializes state with 10 Layer 0 currency and 0 generators at Tick 0', () => {
    const state = createInitialState(defaultGameConfig);
    expect(state.layers.layer0.currency.toNumber()).toBe(10);
    expect(state.layers.layer0.generators.gen1.owned.toNumber()).toBe(0);
    expect(state.layers.layer0.ticksInLayer.toNumber()).toBe(0);
    expect(state.totalTicks.toNumber()).toBe(0);
    expect(state.totalCycles.toNumber()).toBe(0);

    // With 0 generators, advancing ticks yields 0 additional currency but increments ticks
    const nextState = advanceTicks(state, defaultGameConfig, new BigNum(100));
    expect(nextState.layers.layer0.currency.toNumber()).toBe(10);
    expect(nextState.layers.layer0.ticksInLayer.toNumber()).toBe(100);
  });

  it('buys generator 1 with initial currency and produces currency per tick', () => {
    let state = createInitialState(defaultGameConfig);
    // Buy 1 generator 1 (costs 10)
    state = buyGenerator(state, defaultGameConfig, 'layer0', 'gen1', 1);
    expect(state.layers.layer0.currency.toNumber()).toBe(0);
    expect(state.layers.layer0.generators.gen1.owned.toNumber()).toBe(1);

    // Advance 5 ticks
    state = advanceTicks(state, defaultGameConfig, new BigNum(5));
    // Base output of gen1 is 6 per tick -> 30 currency
    expect(state.layers.layer0.currency.toNumber()).toBe(30);
  });

  it('converts elapsed wall-clock milliseconds into cycles and ticks preserving remainder', () => {
    let state = createInitialState(defaultGameConfig);
    state = buyGenerator(state, defaultGameConfig, 'layer0', 'gen1', 1);

    // Base clock: 6000ms per cycle, 1 tick per cycle (6 currency/tick)
    // Advance 9000ms -> 1 cycle fired (6000ms), 3000ms remainder
    const { nextState, report } = advanceTime(state, defaultGameConfig, 9000);
    expect(report.cyclesFired.toNumber()).toBe(1);
    expect(report.ticksEmitted.toNumber()).toBe(1);
    expect(nextState.cycleRemainderMs).toBe(3000);
    expect(nextState.layers.layer0.currency.toNumber()).toBe(6);

    // Advance another 3000ms -> total 6000ms with remainder -> 1 more cycle fired
    const second = advanceTime(nextState, defaultGameConfig, 3000);
    expect(second.report.cyclesFired.toNumber()).toBe(1);
    expect(second.nextState.cycleRemainderMs).toBe(0);
    expect(second.nextState.layers.layer0.currency.toNumber()).toBe(12);
  });

  it('supports Buy Max via closed-form geometric series', () => {
    let state = createInitialState(defaultGameConfig);
    // Give 1000 currency
    state.layers.layer0.currency = new BigNum(1000);

    // Buy Max gen1
    state = buyGenerator(state, defaultGameConfig, 'layer0', 'gen1', 'max');
    expect(state.layers.layer0.generators.gen1.owned.toNumber()).toBeGreaterThan(0);
    expect(state.layers.layer0.currency.toNumber()).toBeLessThan(1000);

    // Trying to buy another when unaffordable leaves state unchanged
    const stats = getDerivedStats(state, defaultGameConfig);
    const nextCost = stats.generatorCosts.layer0.gen1;
    expect(state.layers.layer0.currency.lt(nextCost)).toBe(true);
  });

  it('applies upgrades to cycle frequency, tick yield, and generator output', () => {
    let state = createInitialState(defaultGameConfig);
    state = buyGenerator(state, defaultGameConfig, 'layer0', 'gen1', 1);

    // Give enough currency to buy upgrades
    state.layers.layer0.currency = new BigNum(100000);

    // Buy Cycle Accelerator (increases cycle frequency)
    state = buyUpgrade(state, defaultGameConfig, 'layer0', 'upg_cycle_accel');
    const stats1 = getDerivedStats(state, defaultGameConfig);
    expect(stats1.cycleFrequencyMultiplier).toBeGreaterThan(1.0);
    expect(stats1.effectiveCycleDurationMs).toBeLessThan(6000);

    // Buy Tick Amplifier (multiplies ticks per cycle)
    state = buyUpgrade(state, defaultGameConfig, 'layer0', 'upg_tick_amp');
    const stats2 = getDerivedStats(state, defaultGameConfig);
    expect(stats2.tickYieldPerCycle.toNumber()).toBe(2);

    // Advancing 1 full cycle now emits 2 ticks
    const { nextState } = advanceTime(state, defaultGameConfig, stats2.effectiveCycleDurationMs);
    expect(nextState.totalTicks.toNumber()).toBe(2);
  });

  it('locks Layer 1 prestige until threshold and awards prestige currency with multipliers', () => {
    let state = createInitialState(defaultGameConfig);

    // Cannot prestige at 0 currency
    expect(() => resetLayer(state, defaultGameConfig, 'layer1')).toThrow('Threshold not reached');

    // Simulate reaching 1e6 run-total currency
    state.layers.layer0.currency = new BigNum(1e6);
    state.layers.layer0.runTotalCurrency = new BigNum(1e6);

    const statsBefore = getDerivedStats(state, defaultGameConfig);
    expect(statsBefore.prestigeRewards.layer1.gte(1)).toBe(true);

    // Perform Prestige
    state = resetLayer(state, defaultGameConfig, 'layer1');
    expect(state.layers.layer1.currency.toNumber()).toBe(1);
    // Layer 0 is reset back to initial 10 currency and 0 ticksInLayer
    expect(state.layers.layer0.currency.toNumber()).toBe(10);
    expect(state.layers.layer0.generators.gen1.owned.toNumber()).toBe(0);
    expect(state.layers.layer0.ticksInLayer.toNumber()).toBe(0);

    // Layer 1 currency now grants passive multiplier to Layer 0
    const statsAfter = getDerivedStats(state, defaultGameConfig);
    expect(statsAfter.layerMultipliers.layer0.gt(1.0)).toBe(true);
  });

  it('supports chunked time advancement for bounded discrete simulation', () => {
    let state = createInitialState(defaultGameConfig);
    state = buyGenerator(state, defaultGameConfig, 'layer0', 'gen1', 1);

    // Advance 60 seconds (10 cycles of 6000ms each) with mode: 'chunked' and maxSlices: 5
    const { nextState, report } = advanceTime(state, defaultGameConfig, 60000, { mode: 'chunked', maxSlices: 5 });
    expect(report.cyclesFired.toNumber()).toBe(10);
    expect(nextState.layers.layer0.currency.toNumber()).toBe(60);
    expect(nextState.layers.layer0.ticksInLayer.toNumber()).toBe(10);
  });

  it('decouples bought from owned count so metagenerator production does not inflate purchase price', () => {
    let state = createInitialState(defaultGameConfig);
    // Gen 1 costs 10 Energy base
    state = buyGenerator(state, defaultGameConfig, 'layer0', 'gen1', 1);
    expect(state.layers.layer0.generators.gen1.bought.toNumber()).toBe(1);
    expect(state.layers.layer0.generators.gen1.owned.toNumber()).toBe(1);

    const costBeforeMeta = getDerivedStats(state, defaultGameConfig).generatorCosts.layer0.gen1;

    // Simulate metagenerator producing 50 additional gen1 units to 'owned'
    state.layers.layer0.generators.gen1.owned = state.layers.layer0.generators.gen1.owned.add(50);
    expect(state.layers.layer0.generators.gen1.owned.toNumber()).toBe(51);
    expect(state.layers.layer0.generators.gen1.bought.toNumber()).toBe(1);

    // Next purchase cost must be identical to costBeforeMeta because 'bought' is still 1
    const costAfterMeta = getDerivedStats(state, defaultGameConfig).generatorCosts.layer0.gen1;
    expect(costAfterMeta.toNumber()).toBe(costBeforeMeta.toNumber());
  });

  it('evaluates metagenerator cascades with exact semigroup equivalence (stepping vs single jump)', () => {
    // Custom test config with 3-tier cascade: Gen 3 -> Gen 2 -> Gen 1 -> Currency
    const cascadeConfig = {
      id: 'test-cascade',
      clock: { baseCycleDurationMs: 1000, baseTicksPerCycle: 1 },
      layers: [
        {
          id: 'layer0',
          currency: { id: 'energy', initialAmount: 0 },
          generators: [
            { id: 'gen1', baseCost: 10, costGrowth: 1.15, baseOutputPerTick: 2, produces: 'currency' },
            { id: 'gen2', baseCost: 100, costGrowth: 1.25, baseOutputPerTick: 1, produces: { type: 'generator', layerId: 'layer0', targetId: 'gen1' } },
            { id: 'gen3', baseCost: 1000, costGrowth: 1.40, baseOutputPerTick: 0.5, produces: { type: 'generator', layerId: 'layer0', targetId: 'gen2' } }
          ],
          upgrades: []
        }
      ]
    };

    let stateA = createInitialState(cascadeConfig);
    stateA.layers.layer0.generators.gen1.owned = new BigNum(10);
    stateA.layers.layer0.generators.gen1.bought = new BigNum(10);
    stateA.layers.layer0.generators.gen2.owned = new BigNum(4);
    stateA.layers.layer0.generators.gen2.bought = new BigNum(4);
    stateA.layers.layer0.generators.gen3.owned = new BigNum(2);
    stateA.layers.layer0.generators.gen3.bought = new BigNum(2);

    // Clone for stateB
    let stateB = JSON.parse(JSON.stringify(stateA));
    for (const gid of ['gen1', 'gen2', 'gen3']) {
      stateB.layers.layer0.generators[gid].owned = new BigNum(stateA.layers.layer0.generators[gid].owned);
      stateB.layers.layer0.generators[gid].bought = new BigNum(stateA.layers.layer0.generators[gid].bought);
    }
    stateB.layers.layer0.currency = new BigNum(0);
    stateB.layers.layer0.runTotalCurrency = new BigNum(0);
    stateB.layers.layer0.totalLifetimeCurrency = new BigNum(0);
    stateB.layers.layer0.ticksInLayer = new BigNum(0);
    stateB.totalTicks = new BigNum(0);
    stateB.totalCycles = new BigNum(0);

    // Mode A: 50 individual 1-tick steps
    for (let i = 0; i < 50; i++) {
      stateA = advanceTicks(stateA, cascadeConfig, new BigNum(1));
    }

    // Mode B: 1 single 50-tick jump
    stateB = advanceTicks(stateB, cascadeConfig, new BigNum(50));

    // Verify Semigroup property holds: stateA equals stateB within float precision
    const gen1Diff = Math.abs(stateA.layers.layer0.generators.gen1.owned.toNumber() - stateB.layers.layer0.generators.gen1.owned.toNumber());
    const gen2Diff = Math.abs(stateA.layers.layer0.generators.gen2.owned.toNumber() - stateB.layers.layer0.generators.gen2.owned.toNumber());
    const currDiff = Math.abs(stateA.layers.layer0.currency.toNumber() - stateB.layers.layer0.currency.toNumber());

    expect(gen1Diff).toBeLessThan(1e-6);
    expect(gen2Diff).toBeLessThan(1e-6);
    expect(currDiff).toBeLessThan(1e-5);
  });

  it('evaluates Upgrade Tree DAG prerequisites and mutually exclusive branches', () => {
    const treeConfig = {
      id: 'test-tree',
      clock: { baseCycleDurationMs: 1000, baseTicksPerCycle: 1 },
      layers: [
        {
          id: 'layer0',
          currency: { id: 'energy', initialAmount: 1000 },
          generators: [],
          upgrades: [
            { id: 'root', name: 'Root', baseCost: 10, maxLevel: 1, effect: { target: 'cycleFrequency', operation: 'multiply', value: 1.1 } },
            { id: 'branch_a', name: 'Branch A', baseCost: 20, maxLevel: 1, prerequisites: [{ id: 'root', minLevel: 1 }], exclusiveWith: ['branch_b'], effect: { target: 'tickYield', operation: 'add', value: 1 } },
            { id: 'branch_b', name: 'Branch B', baseCost: 20, maxLevel: 1, prerequisites: [{ id: 'root', minLevel: 1 }], exclusiveWith: ['branch_a'], effect: { target: 'tickYield', operation: 'add', value: 2 } },
            { id: 'leaf_a', name: 'Leaf A', baseCost: 50, maxLevel: 1, prerequisites: [{ id: 'branch_a', minLevel: 1 }], effect: { target: 'cycleFrequency', operation: 'multiply', value: 1.5 } }
          ]
        }
      ]
    };

    let state = createInitialState(treeConfig);
    const stats0 = getDerivedStats(state, treeConfig);
    expect(stats0.upgradeCosts.layer0.root.toNumber()).toBe(10);
    // branch_a and branch_b are locked because root is level 0
    expect(stats0.upgradeCosts.layer0.branch_a).toBe(null);
    expect(stats0.upgradeCosts.layer0.branch_b).toBe(null);

    // Buy Root
    state = buyUpgrade(state, treeConfig, 'layer0', 'root');
    const stats1 = getDerivedStats(state, treeConfig);
    expect(stats1.upgradeCosts.layer0.branch_a.toNumber()).toBe(20);
    expect(stats1.upgradeCosts.layer0.branch_b.toNumber()).toBe(20);
    // leaf_a is still locked because branch_a is not bought
    expect(stats1.upgradeCosts.layer0.leaf_a).toBe(null);

    // Choose Branch A
    state = buyUpgrade(state, treeConfig, 'layer0', 'branch_a');
    const stats2 = getDerivedStats(state, treeConfig);
    // leaf_a is now available!
    expect(stats2.upgradeCosts.layer0.leaf_a.toNumber()).toBe(50);
    // branch_b is now permanently locked due to exclusiveWith: ['branch_a']
    expect(stats2.upgradeCosts.layer0.branch_b).toBe(null);
  });

  it('evaluates dynamic formula upgrade effects on live game state', () => {
    let state = createInitialState(defaultGameConfig);
    // Advance 999 ticks (totalTicks = 999)
    state = advanceTicks(state, defaultGameConfig, new BigNum(999));
    expect(state.totalTicks.toNumber()).toBe(999);

    // Give 10 prestige cores
    state.layers.layer1.currency = new BigNum(10);
    // Buy Root
    state = buyUpgrade(state, defaultGameConfig, 'layer1', 'upg_l1_exp_mult');
    // Buy Branch A
    state = buyUpgrade(state, defaultGameConfig, 'layer1', 'upg_l1_clock');
    // Buy Apex (Logarithmic Cascade Synergy, cost 5)
    state = buyUpgrade(state, defaultGameConfig, 'layer1', 'upg_l1_apex');

    const stats = getDerivedStats(state, defaultGameConfig);
    // log10(999 + 1) = log10(1000) = 3
    // Dynamic formula multiplier is 1 + 3 * 0.5 = 2.5x
    // Combined with Root (2.5x) and base (1.0x)
    expect(stats.layerMultipliers.layer0.gt(5.0)).toBe(true);
  });

  it('derives declarative progressive disclosure visibility states (hidden vs visible)', () => {
    let state = createInitialState(defaultGameConfig);
    const stats0 = getDerivedStats(state, defaultGameConfig);

    // Initial state: Layer 0 visible, Layer 1 hidden, Gen 1 visible, Gen 2/3 hidden, Upgrades hidden
    expect(stats0.visibility.layers.layer0).toBe('visible');
    expect(stats0.visibility.layers.layer1).toBe('hidden');
    expect(stats0.visibility.generators.layer0.gen1).toBe('visible');
    expect(stats0.visibility.generators.layer0.gen2).toBe('hidden');
    expect(stats0.visibility.generators.layer0.gen3).toBe('hidden');
    expect(stats0.visibility.upgrades.layer0.upg_cycle_accel).toBe('hidden');

    // Buying Gen 1 reveals Gen 2
    state = buyGenerator(state, defaultGameConfig, 'layer0', 'gen1', 1);
    const stats1 = getDerivedStats(state, defaultGameConfig);
    expect(stats1.visibility.generators.layer0.gen2).toBe('visible');
    expect(stats1.visibility.generators.layer0.gen3).toBe('hidden');

    // Earning 125 Energy (50% of upg_cycle_accel baseCost 250) reveals Cycle Accelerator
    state.layers.layer0.currency = new BigNum(125);
    state.layers.layer0.runTotalCurrency = new BigNum(125);
    const stats2 = getDerivedStats(state, defaultGameConfig);
    expect(stats2.visibility.upgrades.layer0.upg_cycle_accel).toBe('visible');
    // Layer 1 is still hidden (needs 100K = 10% of 1M prestige threshold)
    expect(stats2.visibility.layers.layer1).toBe('hidden');

    // Reaching 100,000 Energy reveals Layer 1
    state.layers.layer0.currency = new BigNum(100000);
    state.layers.layer0.runTotalCurrency = new BigNum(100000);
    const stats3 = getDerivedStats(state, defaultGameConfig);
    expect(stats3.visibility.layers.layer1).toBe('visible');

    // Prestige reset: Layer 1 gained lifetime currency -> remains permanently visible
    state.layers.layer0.currency = new BigNum(1e6);
    state.layers.layer0.runTotalCurrency = new BigNum(1e6);
    state = resetLayer(state, defaultGameConfig, 'layer1');
    const stats4 = getDerivedStats(state, defaultGameConfig);
    expect(stats4.visibility.layers.layer1).toBe('visible');
    // Layer 0 generators reset: Gen 1 is visible, Gen 2/3 are re-hidden until Gen 1 is bought again
    expect(stats4.visibility.generators.layer0.gen1).toBe('visible');
    expect(stats4.visibility.generators.layer0.gen2).toBe('hidden');
  });

  it('computes deterministic Cycle Phase, integer-Tick Batch Payouts, and 1 Hz Overdrive State', () => {
    const periodConfig = {
      id: 'test-period',
      clock: { baseCycleDurationMs: 1000, baseTicksPerCycle: 1 },
      layers: [
        {
          id: 'layer0',
          currency: { id: 'energy', initialAmount: 10 },
          generators: [
            {
              id: 'gen_slow',
              image: './assets/gen-dyson-2.jpg',
              baseCost: 10,
              costGrowth: 1.4,
              cyclePeriodTicks: 4,
              batchPayout: true,
              baseOutputPerTick: 5,
              produces: 'currency'
            }
          ],
          upgrades: [
            {
              id: 'upg_compress',
              baseCost: 10,
              costGrowth: 2,
              maxLevel: 2,
              effect: { target: 'generatorPeriod', targetId: 'all', operation: 'divide', value: 2.0 }
            }
          ]
        }
      ]
    };

    let state = createInitialState(periodConfig);
    state = buyGenerator(state, periodConfig, 'layer0', 'gen_slow', 1);

    // At 0 ticks, 500ms remainder -> 0.5 / 4 = 0.125 Cycle Phase, not in Overdrive (4000ms > 1000ms)
    const { nextState: stHalf } = advanceTime(state, periodConfig, 500);
    const statsHalf = getDerivedStats(stHalf, periodConfig);
    expect(statsHalf.generatorPeriods.layer0.gen_slow).toBe(4);
    expect(statsHalf.generatorOverdrive.layer0.gen_slow).toBe(false);
    expect(Math.abs(statsHalf.generatorCyclePhase.layer0.gen_slow - 0.125)).toBeLessThan(1e-6);

    // Batch Payout: Ticks 1, 2, 3 award 0 currency while bar fills; Tick 4 awards full batch (4 * 5 = 20)
    let stTick = advanceTicks(state, periodConfig, new BigNum(1));
    expect(stTick.layers.layer0.currency.toNumber()).toBe(0);
    stTick = advanceTicks(stTick, periodConfig, new BigNum(1));
    expect(stTick.layers.layer0.currency.toNumber()).toBe(0);
    stTick = advanceTicks(stTick, periodConfig, new BigNum(1));
    expect(stTick.layers.layer0.currency.toNumber()).toBe(0);
    stTick = advanceTicks(stTick, periodConfig, new BigNum(1));
    expect(stTick.layers.layer0.currency.toNumber()).toBe(20);

    // Buying 2 levels of Period Compression divides period by 4 (4 -> 1 Tick = 1000ms <= 1000ms -> Overdrive!)
    stTick.layers.layer0.currency = new BigNum(100);
    stTick = buyUpgrade(stTick, periodConfig, 'layer0', 'upg_compress');
    stTick = buyUpgrade(stTick, periodConfig, 'layer0', 'upg_compress');
    const statsOd = getDerivedStats(stTick, periodConfig);
    expect(statsOd.generatorPeriods.layer0.gen_slow).toBe(1);
    expect(statsOd.generatorOverdrive.layer0.gen_slow).toBe(true);
    expect(statsOd.generatorCyclePhase.layer0.gen_slow).toBe(1.0);
  });

  it('tracks Milestone Tiers (m0..m4), asset naming conventions, and anticipatory upgrade archetypes', () => {
    let state = createInitialState(defaultGameConfig);
    const stats0 = getDerivedStats(state, defaultGameConfig);
    const ms0 = stats0.generatorMilestones.layer0.gen1;
    expect(ms0.tierId).toBe('m0');
    expect(ms0.tierName).toBe('Common');
    expect(ms0.multiplier).toBe(1);
    expect(ms0.assetPath).toBe('./assets/gen-dyson-1-m0.jpg');

    // Reaching 25 bought upgrades gen1 to m1 (Uncommon, 2x multiplier) and updates asset path to -m1.jpg
    state.layers.layer0.generators.gen1.bought = new BigNum(25);
    state.layers.layer0.generators.gen1.owned = new BigNum(25);
    const statsM1 = getDerivedStats(state, defaultGameConfig);
    const ms1 = statsM1.generatorMilestones.layer0.gen1;
    expect(ms1.tierId).toBe('m1');
    expect(ms1.tierName).toBe('Uncommon');
    expect(ms1.multiplier).toBe(2);
    expect(ms1.assetPath).toBe('./assets/gen-dyson-1-m1.jpg');
    expect(statsM1.characterMilestone.tierId).toBe('m1');

    // Reaching 50 bought upgrades gen1 to m2 (Rare, 4x), 100 -> m3 (Epic, 12x), 250 -> m4 (Legendary, 50x)
    state.layers.layer0.generators.gen1.bought = new BigNum(250);
    const statsM4 = getDerivedStats(state, defaultGameConfig);
    expect(statsM4.generatorMilestones.layer0.gen1.tierId).toBe('m4');
    expect(statsM4.generatorMilestones.layer0.gen1.multiplier).toBe(50);
    expect(statsM4.generatorMilestones.layer0.gen1.assetPath).toBe('./assets/gen-dyson-1-m4.jpg');
  });
});
