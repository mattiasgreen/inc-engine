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
    // Base output of gen1 is 1 per tick -> 5 currency
    expect(state.layers.layer0.currency.toNumber()).toBe(5);
  });

  it('converts elapsed wall-clock milliseconds into cycles and ticks preserving remainder', () => {
    let state = createInitialState(defaultGameConfig);
    state = buyGenerator(state, defaultGameConfig, 'layer0', 'gen1', 1);

    // Base clock: 1000ms per cycle, 1 tick per cycle
    // Advance 1500ms -> 1 cycle fired, 500ms remainder
    const { nextState, report } = advanceTime(state, defaultGameConfig, 1500);
    expect(report.cyclesFired.toNumber()).toBe(1);
    expect(report.ticksEmitted.toNumber()).toBe(1);
    expect(nextState.cycleRemainderMs).toBe(500);
    expect(nextState.layers.layer0.currency.toNumber()).toBe(1);

    // Advance another 500ms -> total 1000ms with remainder -> 1 more cycle fired
    const second = advanceTime(nextState, defaultGameConfig, 500);
    expect(second.report.cyclesFired.toNumber()).toBe(1);
    expect(second.nextState.cycleRemainderMs).toBe(0);
    expect(second.nextState.layers.layer0.currency.toNumber()).toBe(2);
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
    state.layers.layer0.currency = new BigNum(10000);

    // Buy Cycle Accelerator (increases cycle frequency)
    state = buyUpgrade(state, defaultGameConfig, 'layer0', 'upg_cycle_accel');
    const stats1 = getDerivedStats(state, defaultGameConfig);
    expect(stats1.cycleFrequencyMultiplier).toBeGreaterThan(1.0);
    expect(stats1.effectiveCycleDurationMs).toBeLessThan(1000);

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

    // Advance 10 seconds with mode: 'chunked' and maxSlices: 5
    const { nextState, report } = advanceTime(state, defaultGameConfig, 10000, { mode: 'chunked', maxSlices: 5 });
    expect(report.cyclesFired.toNumber()).toBe(10);
    expect(nextState.layers.layer0.currency.toNumber()).toBe(10);
    expect(nextState.layers.layer0.ticksInLayer.toNumber()).toBe(10);
  });
});
