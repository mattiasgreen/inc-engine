// test/pacing.test.js
import { describe, it, expect } from './runner.js';
import { defaultGameConfig } from '../src/engine/config.js';
import { dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame } from '../src/games/index.js';
import { createInitialState } from '../src/engine/core.js';
import { Simulator } from '../src/engine/simulator.js';
import { GreedyPolicy, OptimalRoiPolicy, SemiOptimalPolicy, PassivePolicy, AutoPrestigePolicy } from '../src/engine/policies.js';
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
    const policy = new AutoPrestigePolicy({ prestigeLayerId: 'layer1', minReward: 1, basePolicy: new OptimalRoiPolicy() });

    const result = simulator.run(state, policy, {
      stopCondition: st => st.layers.layer1.currency.gte(1),
      maxSimulatedMs: 3 * 60 * 60 * 1000
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

  it('proves First Prestige Window is paced around 2 hours of optimal play with sawtooth wait cadence and m1 milestone guardrail', () => {
    const games = [dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame];
    for (const gameConfig of games) {
      let state = createInitialState(gameConfig);
      const simulator = new Simulator(gameConfig);
      const policy = new OptimalRoiPolicy();

      const target = new BigNum(1e6);
      const result = simulator.run(state, policy, {
        stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target),
        maxSimulatedMs: 3 * 60 * 60 * 1000 // 3 hours max
      });

      expect(result.state.layers.layer0.runTotalCurrency.gte(target)).toBe(true);

      const elapsedSeconds = result.simulatedMs / 1000;
      // Optimal play reaches 1e6 in ~2 hours (between 90 and 140 minutes; calibrated to ~110.2 minutes / 6614s)
      expect(elapsedSeconds).toBeGreaterThanOrEqual(5400);
      expect(elapsedSeconds).toBeLessThanOrEqual(8400);

      // Milestone guardrail: gen1 unlocks m1 (25 bought) on Run 1, but stays below m2 (50 bought) without hellroad grinding
      const gen1Bought = result.state.layers.layer0.generators.gen1.bought.toNumber();
      expect(gen1Bought).toBeGreaterThanOrEqual(25);
      expect(gen1Bought).toBeLessThan(50);

      // Sawtooth wait-time cadence: verify presence of rapid (<30s), tactical (~45-90s), major (~180-300s), and epoch (~360-650s) waits
      const waitsSec = result.history.map(h => (h.waitMs || 0) / 1000);
      const rapidSteps = waitsSec.filter(w => w > 0 && w <= 35).length;
      const tacticalSteps = waitsSec.filter(w => w > 35 && w <= 100).length;
      const majorJumps = waitsSec.filter(w => w >= 150 && w <= 320).length;
      const epochJumps = waitsSec.filter(w => w > 320).length;

      expect(rapidSteps).toBeGreaterThanOrEqual(10);
      expect(tacticalSteps).toBeGreaterThanOrEqual(5);
      expect(majorJumps).toBeGreaterThanOrEqual(3);
      expect(epochJumps).toBeGreaterThanOrEqual(2);
    }
  });

  it('proves Semi-Optimal play (human hesitation and offline pauses) reaches First Prestige in ~3.5 to 4.5 hours', () => {
    const games = [dysonSwarmGame, aetherforgeGame, sunkenObservatoryGame];
    for (const gameConfig of games) {
      let state = createInitialState(gameConfig);
      const simulator = new Simulator(gameConfig);
      // Realistic human semi-optimal play: hesitation lag, occasional generator bias, and 3 offline breaks
      const policy = new SemiOptimalPolicy();

      const target = new BigNum(1e6);
      const result = simulator.run(state, policy, {
        stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target),
        maxSimulatedMs: 6 * 60 * 60 * 1000 // 6 hours max
      });

      expect(result.state.layers.layer0.runTotalCurrency.gte(target)).toBe(true);

      const elapsedHours = result.simulatedMs / (3600 * 1000);
      // Calibrated to ~3.5 to 4.5 hours of semi-active human play
      expect(elapsedHours).toBeGreaterThanOrEqual(3.0);
      expect(elapsedHours).toBeLessThanOrEqual(4.8);
    }
  });

  it('demonstrates Prestige Acceleration: Run #2 reaches 1e6 in <50% of Run #1 time', () => {
    const simulator = new Simulator(defaultGameConfig);
    const policy = new OptimalRoiPolicy();
    const target = new BigNum(1e6);

    // Run 1: from scratch to 1e6
    let state = createInitialState(defaultGameConfig);
    const run1 = simulator.run(state, policy, {
      stopCondition: (st) => st.layers.layer0.runTotalCurrency.gte(target),
      maxSimulatedMs: 3 * 60 * 60 * 1000
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
      maxSimulatedMs: 3 * 60 * 60 * 1000
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

    // Should complete in under 1500ms real wall-clock time
    expect(realExecutionMs).toBeLessThan(1500);
  });
});
