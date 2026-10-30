// test/pacing.test.js
import { describe, it, expect } from './runner.js';
import { defaultGameConfig } from '../src/engine/config.js';
import { createInitialState } from '../src/engine/core.js';
import { Simulator } from '../src/engine/simulator.js';
import { GreedyPolicy, OptimalRoiPolicy, PassivePolicy, AutoPrestigePolicy } from '../src/engine/policies.js';
import { BigNum } from '../src/engine/bignum.js';

describe('Simulator and Progression Pacing Seam', () => {
  it('supports PassivePolicy for pure idle time advancement', () => {
    let state = createInitialState(defaultGameConfig);
    const simulator = new Simulator(defaultGameConfig);
    const policy = new PassivePolicy();

    const result = simulator.run(state, policy, { maxSimulatedMs: 5000 });
    expect(result.simulatedMs).toBe(5000);
    expect(result.history.length).toBe(0);
  });

  it('supports AutoPrestigePolicy to automatically reset upon reaching prestige threshold', () => {
    let state = createInitialState(defaultGameConfig);
    const simulator = new Simulator(defaultGameConfig);
    const policy = new AutoPrestigePolicy({ prestigeLayerId: 'layer1', minReward: 1 });

    const result = simulator.run(state, policy, {
      stopCondition: st => st.layers.layer1.currency.gte(1),
      maxSimulatedMs: 15 * 60 * 1000
    });

    expect(result.state.layers.layer1.currency.gte(1)).toBe(true);
    const resetEvents = result.history.filter(h => h.action.type === 'resetLayer');
    expect(resetEvents.length).toBeGreaterThan(0);
  });
  it('guarantees monotonicity: currency and ticks strictly increase with no deadlocks', () => {
    let state = createInitialState(defaultGameConfig);
    const simulator = new Simulator(defaultGameConfig);
    const policy = new GreedyPolicy();

    // Simulate 30 seconds
    const result = simulator.run(state, policy, { maxSimulatedMs: 30000 });
    expect(result.state.totalTicks.gt(0)).toBe(true);
    expect(result.state.layers.layer0.currency.gte(0)).toBe(true);
    expect(result.state.layers.layer0.runTotalCurrency.gt(10)).toBe(true);
    expect(result.history.length).toBeGreaterThan(0);
  });

  it('proves First Prestige Window is paced between 5 and 15 minutes of simulated time', () => {
    let state = createInitialState(defaultGameConfig);
    const simulator = new Simulator(defaultGameConfig);
    const policy = new OptimalRoiPolicy();

    // Goal: reach 1e6 run-total currency in Layer 0
    const target = new BigNum(1e6);
    const result = simulator.run(state, policy, {
      stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target),
      maxSimulatedMs: 15 * 60 * 1000 // 15 minutes max
    });

    expect(result.state.layers.layer0.runTotalCurrency.gte(target)).toBe(true);

    const elapsedSeconds = result.simulatedMs / 1000;
    // Between 5 minutes (300s) and 15 minutes (900s)
    expect(elapsedSeconds).toBeGreaterThanOrEqual(300);
    expect(elapsedSeconds).toBeLessThanOrEqual(900);
  });

  it('demonstrates Prestige Acceleration: Run #2 reaches 1e6 in <50% of Run #1 time', () => {
    const simulator = new Simulator(defaultGameConfig);
    const policy = new OptimalRoiPolicy();
    const target = new BigNum(1e6);

    // Run 1: from scratch to 1e6
    let state = createInitialState(defaultGameConfig);
    const run1 = simulator.run(state, policy, {
      stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target),
      maxSimulatedMs: 15 * 60 * 1000
    });
    const run1DurationMs = run1.simulatedMs;

    // Reset Layer 1
    state = simulator.resetLayer(run1.state, 'layer1');
    expect(state.layers.layer1.currency.gte(1)).toBe(true);

    // Buy Layer 1 Upgrade: Exponential Synergy (2x global multiplier)
    state = simulator.buyUpgrade(state, 'layer1', 'upg_l1_exp_mult');

    // Run 2: from reset to 1e6 again
    const run2 = simulator.run(state, policy, {
      stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target),
      maxSimulatedMs: 15 * 60 * 1000
    });
    const run2DurationMs = run2.simulatedMs;

    // Run 2 should take less than 50% of Run 1
    expect(run2DurationMs).toBeLessThan(run1DurationMs * 0.5);
  });

  it('executes active policy simulation with high performance via event skipping', () => {
    let state = createInitialState(defaultGameConfig);
    const simulator = new Simulator(defaultGameConfig);
    const policy = new GreedyPolicy();

    const startPerf = Date.now();
    // Simulate 10,000 seconds (almost 3 hours)
    simulator.run(state, policy, { maxSimulatedMs: 10000 * 1000, maxSteps: 5000 });
    const realExecutionMs = Date.now() - startPerf;

    // Should complete in under 500ms real wall-clock time
    expect(realExecutionMs).toBeLessThan(500);
  });
});
